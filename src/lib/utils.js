/**
 * Generate a URL-safe slug from app name + random suffix
 * Example: "Syscraft Notes" → "syscraft-notes-a8Kx92"
 */
export function generateSlug(appName) {
  const base = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return `${base}-${suffix}`
}

/**
 * Get the public download URL for a slug
 */
export function getDownloadUrl(slug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/download/${slug}`
}

/**
 * Calculate expires_at timestamp from validity selection
 */
export function getExpiresAt(validity, customDate = null) {
  const now = new Date()

  const validityMap = {
    '1h': 1 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 1 * 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }

  if (validity === 'custom' && customDate) {
    return new Date(customDate).toISOString()
  }

  const ms = validityMap[validity]
  if (!ms) throw new Error('Invalid validity period')

  return new Date(now.getTime() + ms).toISOString()
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Format a countdown string: "5d 4h 32m" or "Expired"
 */
export function formatTimeLeft(expiresAt) {
  const now = new Date()
  const exp = new Date(expiresAt)
  const diff = exp - now

  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Check if a link is expired
 */
export function isExpired(expiresAt) {
  return new Date(expiresAt) <= new Date()
}

/**
 * Check if a link is expiring soon (within 24 hours)
 */
export function isExpiringSoon(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  return diff > 0 && diff < 24 * 60 * 60 * 1000
}

/**
 * Get status label
 */
export function getStatus(expiresAt) {
  if (isExpired(expiresAt)) return 'expired'
  if (isExpiringSoon(expiresAt)) return 'expiring'
  return 'active'
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

/**
 * Format date short
 */
export function formatDateShort(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}
