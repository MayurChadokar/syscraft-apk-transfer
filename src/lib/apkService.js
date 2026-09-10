import { supabase } from './supabase'
import { generateSlug, getExpiresAt, getDownloadUrl } from './utils'
import { uploadFileToB2, getB2SignedDownloadUrl, deleteFileFromB2 } from './b2Service'

/**
 * Upload APK file to Backblaze B2 Storage and create database record in Supabase
 */
export async function uploadApk({ appName, file, validity, customDate, userId, onProgress }) {
  // Step 1: Generate unique storage path
  const isIpa = file.name.toLowerCase().endsWith('.ipa')
  const ext = isIpa ? '.ipa' : '.apk'
  const platform = isIpa ? 'ios' : 'android'
  const uniqueId = crypto.randomUUID()
  const storagePath = `${userId}/${uniqueId}${ext}`

  // Step 2: Upload to Backblaze B2 Storage
  try {
    await uploadFileToB2(file, storagePath, onProgress)
  } catch (uploadError) {
    throw new Error(`Upload to B2 failed: ${uploadError.message}`)
  }

  // Step 3: Generate slug and expiry
  const slug = generateSlug(appName)
  const expiresAt = getExpiresAt(validity, customDate)
  const downloadUrl = getDownloadUrl(slug)

  // Step 4: Create database record
  const { data, error: dbError } = await supabase
    .from('apk_files')
    .insert([
      {
        app_name: appName,
        slug,
        original_file_name: file.name,
        storage_path: storagePath,
        file_size: file.size,
        uploaded_by: userId,
        expires_at: expiresAt,
        download_count: 0,
        status: 'active',
        platform,
      },
    ])
    .select()
    .single()

  if (dbError) {
    // Cleanup: remove uploaded file from B2 if db insert fails
    await deleteFileFromB2(storagePath)
    throw new Error(`Database error: ${dbError.message}`)
  }

  return {
    ...data,
    downloadUrl,
  }
}

/**
 * Get all APK records for the current user
 */
export async function getUserApks() {
  const { data, error } = await supabase
    .from('apk_files')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Get a single APK record by slug (public)
 */
export async function getApkBySlug(slug) {
  const { data, error } = await supabase
    .from('apk_files')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(error.message)
  }
  return data
}

/**
 * Generate a signed download URL for the APK/IPA from Backblaze B2
 * Validates expiration BEFORE generating
 */
export async function getSignedDownloadUrl(slug) {
  // First, get the record and validate expiration
  const record = await getApkBySlug(slug)

  if (!record) {
    return { error: 'not_found' }
  }

  if (new Date(record.expires_at) <= new Date()) {
    return { error: 'expired', record }
  }

  // Increment download count atomically via RPC
  await supabase.rpc('increment_download', { p_slug: slug })

  // Generate signed URL from Backblaze B2 (1 hour expiration)
  try {
    const signedUrl = await getB2SignedDownloadUrl(record.storage_path, record.original_file_name, 3600)
    
    // For iOS (.ipa) files, generate a public HTTPS manifest.plist on Backblaze B2
    let manifestSignedUrl = null
    const isIpa = record.original_file_name?.toLowerCase().endsWith('.ipa') || record.platform === 'ios'

    if (isIpa) {
      const lastDotIndex = record.storage_path.lastIndexOf('.')
      const basePath = lastDotIndex !== -1 ? record.storage_path.substring(0, lastDotIndex) : record.storage_path
      const plistPath = `${basePath}.plist`
      const safeAppName = (record.app_name || 'App').replace(/[^\w\s-]/gi, '')
      const bundleId = `com.syscraft.${(record.slug || 'app').replace(/[^a-zA-Z0-9]/g, '')}`


      const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${signedUrl}</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${bundleId}</string>
        <key>bundle-version</key>
        <string>1.0.0</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${safeAppName}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`

      // Upload plist to B2 and get signed HTTPS URL
      await uploadTextToB2(manifestXml, plistPath, 'text/xml')
      manifestSignedUrl = await getB2SignedManifestUrl(plistPath, 3600)
    }

    return { signedUrl, manifestSignedUrl, record }
  } catch (error) {
    throw new Error(`Failed to generate download URL: ${error.message}`)
  }
}

/**
 * Delete an APK record and its file from Backblaze B2 storage
 */
export async function deleteApk(id, storagePath) {
  // Delete from Backblaze B2 first
  try {
    await deleteFileFromB2(storagePath)
  } catch (storageError) {
    console.warn('Backblaze B2 Storage deletion warning:', storageError.message)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('apk_files')
    .delete()
    .eq('id', id)

  if (dbError) throw new Error(dbError.message)
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const { data, error } = await supabase
    .from('apk_files')
    .select('expires_at, download_count')

  if (error) throw new Error(error.message)

  const now = new Date()
  const total = data.length
  const active = data.filter(r => new Date(r.expires_at) > now).length
  const expired = data.filter(r => new Date(r.expires_at) <= now).length
  const downloads = data.reduce((sum, r) => sum + (r.download_count || 0), 0)

  return { total, active, expired, downloads }
}
