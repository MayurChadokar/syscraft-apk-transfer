import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Download, Calendar, HardDrive, Loader2, AlertTriangle,
  Clock, Shield, Smartphone, Apple, Zap, HelpCircle
} from 'lucide-react'
import { getApkBySlug, getSignedDownloadUrl } from '../lib/apkService'
import { formatFileSize, formatDate, formatTimeLeft, isExpired } from '../lib/utils'
import UDIDModal from '../components/apk/UDIDModal'
import toast from 'react-hot-toast'



function BrandFooter() {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center">
        <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
          <path d="M5 4h6l4 4v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M11 4v4h4" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-white/30 text-xs">Syscraft APK Transfer</span>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="skeleton w-20 h-20 rounded-3xl mx-auto" />
        <div className="text-center space-y-3">
          <div className="skeleton h-6 w-40 rounded mx-auto" />
          <div className="skeleton h-4 w-28 rounded mx-auto" />
        </div>
        <div className="glass-card p-5 space-y-3">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
        <div className="skeleton h-14 rounded-xl" />
      </div>
      <BrandFooter />
    </div>
  )
}

export default function DownloadPage() {
  const { slug } = useParams()
  const [apk, setApk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [status, setStatus] = useState('loading') // loading | valid | expired | not_found | error
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const fetchApk = async () => {
      try {
        const data = await getApkBySlug(slug)
        if (!data) {
          setStatus('not_found')
          return
        }
        if (isExpired(data.expires_at)) {
          setStatus('expired')
          setApk(data)
          return
        }
        setApk(data)
        setStatus('valid')
        setTimeLeft(formatTimeLeft(data.expires_at))
      } catch {
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }
    fetchApk()
  }, [slug])

  // Live countdown
  useEffect(() => {
    if (status !== 'valid' || !apk) return
    const interval = setInterval(() => {
      const tl = formatTimeLeft(apk.expires_at)
      if (tl === 'Expired') {
        setStatus('expired')
        clearInterval(interval)
        return
      }
      setTimeLeft(tl)
    }, 30000)
    return () => clearInterval(interval)
  }, [status, apk])

  const [showUDIDModal, setShowUDIDModal] = useState(false)

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const result = await getSignedDownloadUrl(slug)

      if (result.error === 'not_found') {
        setStatus('not_found')
        return
      }
      if (result.error === 'expired') {
        setStatus('expired')
        setApk(result.record)
        return
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = result.signedUrl
      link.download = apk.original_file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update download count locally
      setApk(prev => ({ ...prev, download_count: (prev?.download_count || 0) + 1 }))
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  const handleIOSInstall = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

      const result = await getSignedDownloadUrl(slug)
      if (result.error || !result.manifestSignedUrl) {
        toast.error('Failed to generate iOS installation manifest')
        return
      }

      const otaUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(result.manifestSignedUrl)}`
      
      if (isIOS) {
        // Direct location change for Safari iOS protocol handler compatibility
        window.location.href = otaUrl
        toast.success('iOS Install prompt triggered! Tap "Install" on popup.')
      } else {
        toast('iOS OTA installation works on iPhones/iPads using Safari. Downloading .IPA file directly...', { icon: '🍏', duration: 4000 })
        if (result.signedUrl) {
          const link = document.createElement('a')
          link.href = result.signedUrl
          link.download = apk.original_file_name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }

      setApk(prev => ({ ...prev, download_count: (prev?.download_count || 0) + 1 }))
    } catch (err) {
      console.error('iOS OTA Install error:', err)
      toast.error(err.message || 'Failed to start iOS installation')
    } finally {
      setDownloading(false)
    }
  }





  if (loading) return <LoadingSkeleton />

  if (status === 'not_found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6 animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto">
            <AlertTriangle size={36} className="text-white/20" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">APK Not Found</h1>
            <p className="text-white/40 text-sm mt-3 leading-relaxed">
              The download link you're trying to access doesn't exist or may have been removed.
            </p>
          </div>
          <Link
            to="/login"
            className="btn-secondary inline-flex mx-auto text-sm"
          >
            Go Home
          </Link>
        </div>
        <BrandFooter />
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6 animate-slide-up">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Clock size={36} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">This download link has expired</h1>
            <p className="text-white/40 text-sm mt-3 leading-relaxed">
              This APK link is no longer available because its validity period has ended.
            </p>
          </div>
          {apk && (
            <div className="glass-card p-4 text-left space-y-2">
              <p className="text-white/50 text-xs">Application</p>
              <p className="text-white font-medium text-sm">{apk.app_name}</p>
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-white/30 text-xs">Expired on</p>
                <p className="text-red-400/80 text-xs mt-0.5">{formatDate(apk.expires_at)}</p>
              </div>
            </div>
          )}
          <Link
            to="/"
            className="btn-secondary inline-flex mx-auto text-sm"
          >
            Back to Syscraft APK Transfer
          </Link>
        </div>
        <BrandFooter />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertTriangle size={40} className="text-red-400/40 mx-auto" />
          <p className="text-white/40 text-sm">Something went wrong. Please try again.</p>
          <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
            Retry
          </button>
        </div>
        <BrandFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-slide-up space-y-5">
        {/* App Icon & Badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center shadow-xl shadow-brand-600/10 relative">
            <Smartphone size={44} className="text-brand-400" />
            <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-navy-800 border border-white/10 text-xs font-semibold text-white flex items-center gap-1 shadow-lg">
              {apk.platform === 'ios' || apk.original_file_name?.endsWith('.ipa') ? '🍏 iOS' : '🤖 Android'}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{apk.app_name}</h1>
            <p className="text-white/40 text-sm mt-1">
              {apk.platform === 'ios' || apk.original_file_name?.endsWith('.ipa') ? 'iOS Application (.ipa)' : 'Android Application (.apk)'}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-5 space-y-4">
          {/* File Size */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <HardDrive size={14} className="text-white/40" />
            </div>
            <div>
              <p className="text-white/30 text-xs">File</p>
              <p className="text-white/80 text-sm">{apk.original_file_name}</p>
              {apk.file_size && (
                <p className="text-white/40 text-xs">
                  {apk.original_file_name?.endsWith('.ipa') ? 'IPA' : 'APK'} · {formatFileSize(apk.file_size)}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Validity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white/30 text-xs">Available until</p>
              <p className="text-white/80 text-sm">{formatDate(apk.expires_at)}</p>
              <p className="text-amber-400/70 text-xs">⏱ Expires in {timeLeft}</p>
            </div>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Download Count */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <Download size={14} className="text-white/40" />
            </div>
            <div>
              <p className="text-white/30 text-xs">Downloads</p>
              <p className="text-white/70 text-sm">{apk.download_count || 0} times</p>
            </div>
          </div>
        </div>

        {/* Download / Install Buttons */}
        <div className="space-y-3">
          {apk.original_file_name?.toLowerCase().endsWith('.ipa') || apk.platform === 'ios' ? (
            <>
              {/* Primary iOS OTA Native Installer */}
              <button
                onClick={handleIOSInstall}
                disabled={downloading}
                className="btn-primary w-full py-4 text-base font-semibold glow-blue flex items-center justify-center gap-2"
                id="install-ios-btn"
              >
                {downloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing iOS OTA Manifest...
                  </>
                ) : (
                  <>
                    <Zap size={18} className="text-amber-300" />
                    Install on iPhone (OTA)
                  </>
                )}
              </button>

              {/* Secondary Direct IPA File Download */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-secondary w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                id="download-ipa-btn"
              >
                <Download size={15} />
                Download .IPA File Directly
              </button>
            </>
          ) : (
            /* Android APK Download Button */
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary w-full py-4 text-base font-semibold glow-blue flex items-center justify-center gap-2"
              id="download-apk-btn"
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download APK
                </>
              )}
            </button>
          )}

          {/* UDID / Install Guide Trigger */}
          <button
            onClick={() => setShowUDIDModal(true)}
            className="w-full text-center text-xs text-white/40 hover:text-white/80 py-1 transition-colors flex items-center justify-center gap-1.5"
          >
            <HelpCircle size={13} />
            <span>iOS Installation & UDID Guide</span>
          </button>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 justify-center text-white/25 text-xs">
          <Shield size={11} />
          <span>Your download link is temporary and will expire automatically.</span>
        </div>
      </div>

      {/* UDID Modal */}
      <UDIDModal
        isOpen={showUDIDModal}
        onClose={() => setShowUDIDModal(false)}
      />

      <BrandFooter />
    </div>
  )
}

