import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy, ExternalLink, Download, Share2, CheckCircle2,
  Calendar, FileText, Package
} from 'lucide-react'
import Modal from '../ui/Modal'
import { formatDate, formatFileSize, copyToClipboard } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function SuccessModal({ isOpen, onClose, data }) {
  const qrRef = useRef(null)

  if (!data) return null

  const { app_name, original_file_name, file_size, expires_at, downloadUrl, slug } = data

  const handleCopy = async () => {
    await copyToClipboard(downloadUrl)
    toast.success('Link copied to clipboard!')
  }

  const handleOpen = () => {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const size = 400
    canvas.width = size
    canvas.height = size + 80

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#0d1224'
    ctx.fillRect(0, 0, size, size + 80)

    const img = new Image()
    img.onload = () => {
      const padding = 20
      ctx.drawImage(img, padding, padding, size - 40, size - 40)
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(app_name, size / 2, size + 24)
      ctx.fillStyle = '#60a5fa'
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText('Scan to download APK', size / 2, size + 46)

      const link = document.createElement('a')
      link.download = `${slug}-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    toast.success('QR code downloaded!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Download ${app_name}`,
          text: `Download ${app_name} APK`,
          url: downloadUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          await handleCopy()
        }
      }
    } else {
      await handleCopy()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-white text-xl font-bold">APK Ready 🎉</h2>
          <p className="text-white/40 text-sm mt-1">Your secure download link has been generated</p>
        </div>

        {/* Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <Package size={14} className="text-brand-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs">Application</p>
              <p className="text-white text-sm font-semibold truncate">{app_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <FileText size={14} className="text-white/30 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs">File</p>
              <p className="text-white/80 text-sm truncate">{original_file_name} {file_size ? `· ${formatFileSize(file_size)}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <Calendar size={14} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs">Valid Until</p>
              <p className="text-white/80 text-sm">{formatDate(expires_at)}</p>
            </div>
          </div>
        </div>

        {/* URL */}
        <div>
          <label className="block text-white/40 text-xs font-medium mb-2">Download URL</label>
          <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl">
            <p className="flex-1 text-brand-400 text-xs font-mono truncate min-w-0">{downloadUrl}</p>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
              title="Copy URL"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-xl shadow-brand-500/10">
            <QRCodeSVG
              value={downloadUrl}
              size={160}
              bgColor="#ffffff"
              fgColor="#0d1224"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
        <p className="text-center text-white/30 text-xs">Scan to download APK</p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleCopy} className="btn-secondary text-xs py-2.5">
            <Copy size={13} />
            Copy Link
          </button>
          <button onClick={handleOpen} className="btn-secondary text-xs py-2.5">
            <ExternalLink size={13} />
            Open Link
          </button>
          <button onClick={handleDownloadQR} className="btn-secondary text-xs py-2.5">
            <Download size={13} />
            Download QR
          </button>
          <button onClick={handleShare} className="btn-primary text-xs py-2.5">
            <Share2 size={13} />
            Share
          </button>
        </div>
      </div>
    </Modal>
  )
}
