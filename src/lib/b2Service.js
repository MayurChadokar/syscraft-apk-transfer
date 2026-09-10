import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const keyId = import.meta.env.VITE_B2_KEY_ID
const applicationKey = import.meta.env.VITE_B2_APPLICATION_KEY
const rawEndpoint = import.meta.env.VITE_B2_ENDPOINT || 's3.us-west-004.backblazeb2.com'
export const B2_BUCKET = import.meta.env.VITE_B2_BUCKET_NAME || 'syscraft-apks'

// Compute region from endpoint (e.g. s3.us-west-004.backblazeb2.com => us-west-004)
const region = import.meta.env.VITE_B2_REGION || rawEndpoint.split('.')[1] || 'us-west-004'
const endpointUrl = rawEndpoint.startsWith('http') ? rawEndpoint : `https://${rawEndpoint}`

export const s3Client = new S3Client({
  endpoint: endpointUrl,
  region: region,
  forcePathStyle: true, // Required for Backblaze B2 path-style URLs
  credentials: {
    accessKeyId: keyId,
    secretAccessKey: applicationKey,
  },
})

/**
 * Upload an APK file directly to Backblaze B2 using Presigned PUT URL + XHR progress tracking
 */
export async function uploadFileToB2(file, storagePath, onProgress) {
  const contentType = 'application/vnd.android.package-archive'
  
  // Step 1: Generate Presigned PUT URL
  const command = new PutObjectCommand({
    Bucket: B2_BUCKET,
    Key: storagePath,
    ContentType: contentType,
  })

  const presignedUploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  // Step 2: Stream upload with real-time XHR byte progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onProgress({ loaded: e.loaded, total: e.total, percent })
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true)
      } else {
        reject(new Error(`B2 Upload Error ${xhr.status}: ${xhr.responseText || xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during B2 upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(file)
  })
}

/**
 * Generate a presigned download URL for a file stored in Backblaze B2
 * @param {string} storagePath - S3 key in B2
 * @param {string} originalFileName - Original filename for Content-Disposition header
 * @param {number} expiresInSeconds - Expiration time (default 1 hour = 3600s)
 */
export async function getB2SignedDownloadUrl(storagePath, originalFileName, expiresInSeconds = 3600) {
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET,
    Key: storagePath,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(originalFileName)}"`,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds })
}

/**
 * Delete a file from Backblaze B2
 */
export async function deleteFileFromB2(storagePath) {
  const command = new DeleteObjectCommand({
    Bucket: B2_BUCKET,
    Key: storagePath,
  })

  return await s3Client.send(command)
}
