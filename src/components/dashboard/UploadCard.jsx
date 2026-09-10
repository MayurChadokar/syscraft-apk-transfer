import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileText, Clock, ChevronDown, AlertCircle,
  CheckCircle2, Loader2, X, Calendar
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { uploadApk } from '../../lib/apkService'
import { formatFileSize } from '../../lib/utils'
import toast from 'react-hot-toast'

const VALIDITY_OPTIONS = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'custom', label: 'Custom Date/Time' },
]

export default function UploadCard({ onSuccess }) {
  const { user } = useAuth()
  const [appName, setAppName] = useState('')
  const [validity, setValidity] = useState('7d')
  const [customDate, setCustomDate] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  const validateFile = (f) => {
    const isApk = f.name.toLowerCase().endsWith('.apk')
    const isIpa = f.name.toLowerCase().endsWith('.ipa')
    if (!isApk && !isIpa) {
      return 'Only .apk (Android) or .ipa (iOS) files are allowed'
    }
    if (f.size > 500 * 1024 * 1024) {
      return 'File size must be under 500 MB'
    }
    return null
  }

  const handleFileSelect = (f) => {
    const err = validateFile(f)
    if (err) {
      setErrors(prev => ({ ...prev, file: err }))
      return
    }
    setErrors(prev => ({ ...prev, file: null }))
    setFile(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const validate = () => {
    const errs = {}
    if (!appName.trim()) errs.appName = 'Application name is required'
    if (!file) errs.file = 'Please select an APK file'
    if (validity === 'custom' && !customDate) errs.customDate = 'Please select expiry date/time'
    if (validity === 'custom' && customDate && new Date(customDate) <= new Date()) {
      errs.customDate = 'Expiry date must be in the future'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleUpload = async () => {
    if (!validate()) return
    setUploading(true)
    setProgress(0)

    try {
      const result = await uploadApk({
        appName: appName.trim(),
        file,
        validity,
        customDate: validity === 'custom' ? customDate : null,
        userId: user.id,
        onProgress: (info) => {
          setProgress(info.percent)
        },
      })

      setProgress(100)

      setTimeout(() => {
        setUploading(false)
        setProgress(0)
        setAppName('')
        setFile(null)
        setValidity('7d')
        setCustomDate('')
        onSuccess(result)
      }, 400)
    } catch (err) {
      setUploading(false)
      setProgress(0)
      toast.error(err.message || 'Upload failed. Please try again.')
    }
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h2 className="text-white font-semibold text-base">Upload New APK</h2>
        <p className="text-white/40 text-sm mt-1">Upload an Android APK and generate a secure shareable link</p>
      </div>

      <div className="space-y-4">
        {/* Application Name */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Application Name
          </label>
          <div className="relative">
            <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value)
                if (errors.appName) setErrors(prev => ({ ...prev, appName: null }))
              }}
              placeholder="e.g. Syscraft Notes v1.0"
              className={`input-field pl-10 ${errors.appName ? 'border-red-500/50 focus:ring-red-500/30' : ''}`}
              disabled={uploading}
            />
          </div>
          {errors.appName && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.appName}
            </p>
          )}
        </div>

        {/* Validity */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Link Validity
          </label>
          <div className="relative">
            <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
            <select
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="select-field pl-10 pr-10"
              disabled={uploading}
            >
              {VALIDITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-navy-800">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Custom Date */}
        {validity === 'custom' && (
          <div className="animate-fade-in">
            <label className="block text-white/70 text-sm font-medium mb-2">
              Expiry Date & Time
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none z-10" />
              <input
                type="datetime-local"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value)
                  if (errors.customDate) setErrors(prev => ({ ...prev, customDate: null }))
                }}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className={`input-field pl-10 ${errors.customDate ? 'border-red-500/50' : ''}`}
                disabled={uploading}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            {errors.customDate && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.customDate}
              </p>
            )}
          </div>
        )}

        {/* File Drop Zone */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            APK File
          </label>

          {file ? (
            <div className="flex items-center gap-3 p-4 glass-card border border-emerald-500/20 bg-emerald-500/5 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-white/40 text-xs">{formatFileSize(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragging
                  ? 'border-brand-500/60 bg-brand-600/10'
                  : errors.file
                    ? 'border-red-500/40 bg-red-500/5 hover:border-red-500/60'
                    : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
                }
              `}
            >
              <Upload size={28} className={`mx-auto mb-3 ${dragging ? 'text-brand-400' : 'text-white/20'}`} />
              <p className="text-white/60 text-sm font-medium">
                {dragging ? 'Drop your APK or IPA file here' : 'Drop your APK or IPA file here'}
              </p>
              <p className="text-white/30 text-xs mt-1">or <span className="text-brand-400 hover:underline">browse files</span></p>
              <p className="text-white/20 text-xs mt-3">Supports .apk (Android) & .ipa (iOS) · Max 500 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".apk,.ipa"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files[0]
                  if (f) handleFileSelect(f)
                  e.target.value = ''
                }}
              />

            </div>
          )}
          {errors.file && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.file}
            </p>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{progress < 100 ? `Uploading to Backblaze B2 (${progress}%)` : 'Complete!'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full py-3 text-sm font-semibold"
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {progress < 90 ? 'Uploading APK...' : 'Generating link...'}
            </>
          ) : (
            <>
              <Upload size={15} />
              Upload & Generate Link
            </>
          )}
        </button>
      </div>
    </div>
  )
}
