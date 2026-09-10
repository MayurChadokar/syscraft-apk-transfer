import { useState } from 'react'
import {
  Smartphone, Copy, CheckCircle2, ShieldCheck, HelpCircle,
  ExternalLink, Apple, ChevronRight
} from 'lucide-react'
import Modal from '../ui/Modal'
import toast from 'react-hot-toast'
import { copyToClipboard } from '../../lib/utils'

export default function UDIDModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  const userAgent = navigator.userAgent

  const handleCopyUA = async () => {
    await copyToClipboard(userAgent)
    setCopied(true)
    toast.success('Device info copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="iOS UDID & Installation Guide" maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Device Detector Banner */}
        <div className="glass-card p-4 border border-brand-500/20 bg-brand-500/10 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Apple size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {isIOS ? 'iPhone / iPad Detected' : 'iOS Device Inspector'}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {isIOS ? 'Ready for native Over-The-Air (OTA) app installation.' : 'Open this page on your iPhone to install iOS apps directly.'}
            </p>
          </div>
        </div>

        {/* Section 1: How iOS Installation Works */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-xs tracking-wider uppercase text-white/50 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            How to Install iOS Apps (.ipa)
          </h3>
          <div className="glass-card p-4 space-y-3 text-xs text-white/70">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p>Tap <strong className="text-white">"⚡ Install on iPhone"</strong> on the app download page in Safari.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p>When the iOS popup appears (<em className="text-white/90">"wants to install..."</em>), tap <strong className="text-white">Install</strong>.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-400 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p>The app will start installing directly on your iPhone home screen!</p>
            </div>
          </div>
        </div>

        {/* Section 2: Untrusted Developer Guide */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-xs tracking-wider uppercase text-white/50 flex items-center gap-1.5">
            <HelpCircle size={14} className="text-amber-400" />
            "Untrusted Developer" Alert Fix
          </h3>
          <div className="glass-card p-4 space-y-2 text-xs text-white/70">
            <p className="text-white/60">If iOS displays an "Untrusted Developer" popup when opening the app:</p>
            <div className="bg-navy-900/60 p-3 rounded-lg border border-white/5 space-y-1 font-mono text-[11px] text-white/80">
              <p className="flex items-center gap-1">1. Open <span className="text-brand-400">Settings</span> on your iPhone</p>
              <p className="flex items-center gap-1">2. Go to <span className="text-brand-400">General</span> <ChevronRight size={10} /> <span className="text-brand-400">VPN & Device Management</span></p>
              <p className="flex items-center gap-1">3. Tap the Developer Name under Enterprise/Developer App</p>
              <p className="flex items-center gap-1">4. Tap <span className="text-emerald-400 font-bold">"Trust [Developer Name]"</span></p>
            </div>
          </div>
        </div>

        {/* Section 3: What is UDID? */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-xs tracking-wider uppercase text-white/50 flex items-center gap-1.5">
            <Smartphone size={14} className="text-cyan-400" />
            Device UDID Registration for Ad-Hoc Apps
          </h3>
          <p className="text-white/50 text-xs leading-relaxed">
            Ad-Hoc iOS apps require registering your device UDID in the developer's Apple Developer Portal before installation.
          </p>

          <button
            onClick={handleCopyUA}
            className="btn-secondary w-full py-2.5 text-xs font-medium flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                Copied Device Info!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy Device Information for Developer
              </>
            )}
          </button>
        </div>

        {/* Footer Close */}
        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-primary py-2 px-5 text-xs font-semibold">
            Got It!
          </button>
        </div>
      </div>
    </Modal>
  )
}
