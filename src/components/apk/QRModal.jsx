import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy } from 'lucide-react'
import Modal from '../ui/Modal'
import { getDownloadUrl, copyToClipboard } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function QRModal({ isOpen, onClose, apk }) {
  const qrRef = useRef(null)

  if (!apk) return null

  const downloadUrl = getDownloadUrl(apk.slug)

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
      ctx.drawImage(img, 20, 20, size - 40, size - 40)
      ctx.fillStyle = '#ffffff'
      ctx.font = '16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(apk.app_name, size / 2, size + 28)
      ctx.fillStyle = '#60a5fa'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText('Scan to download APK', size / 2, size + 52)

      const link = document.createElement('a')
      link.download = `${apk.slug}-qr.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('QR code downloaded!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" size="sm">
      <div className="p-6 space-y-5">
        <div className="flex flex-col items-center gap-4">
          <div ref={qrRef} className="bg-white p-4 rounded-2xl shadow-xl shadow-brand-500/10">
            <QRCodeSVG
              value={downloadUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#0d1224"
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-sm">{apk.app_name}</p>
            <p className="text-white/40 text-xs mt-1">Scan to download APK</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={async () => { await copyToClipboard(downloadUrl); toast.success('Link copied!') }}
            className="btn-secondary flex-1 text-sm py-2.5"
          >
            <Copy size={13} />
            Copy Link
          </button>
          <button
            onClick={handleDownloadQR}
            className="btn-primary flex-1 text-sm py-2.5"
          >
            <Download size={13} />
            Download QR
          </button>
        </div>
      </div>
    </Modal>
  )
}
