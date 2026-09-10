import { useState } from 'react'
import {
  Copy, ExternalLink, Trash2, QrCode, MoreHorizontal,
  Search, ChevronDown, Package, Filter
} from 'lucide-react'
import { formatFileSize, formatDate, formatDateShort, formatTimeLeft, getStatus, getDownloadUrl, copyToClipboard } from '../../lib/utils'
import { deleteApk } from '../../lib/apkService'
import DeleteConfirmModal from './DeleteConfirmModal'
import QRModal from './QRModal'
import toast from 'react-hot-toast'

function StatusBadge({ expiresAt }) {
  const status = getStatus(expiresAt)
  const timeLeft = formatTimeLeft(expiresAt)

  if (status === 'expired') return <span className="badge-expired">Expired</span>
  if (status === 'expiring') return <span className="badge-expiring">⚡ {timeLeft}</span>
  return <span className="badge-active">Active · {timeLeft}</span>
}

function ApkRow({ apk, onDelete, onShowQR }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const downloadUrl = getDownloadUrl(apk.slug)

  const handleCopy = async () => {
    await copyToClipboard(downloadUrl)
    toast.success('Link copied!')
    setMenuOpen(false)
  }

  const handleOpen = () => {
    window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    setMenuOpen(false)
  }

  return (
    <>
      {/* Desktop row */}
      <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Package size={15} className="text-brand-400" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{apk.app_name}</p>
              <p className="text-white/30 text-xs truncate">{apk.original_file_name}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-white/50 text-xs hidden md:table-cell">
          {formatFileSize(apk.file_size)}
        </td>
        <td className="px-4 py-4 text-white/50 text-xs hidden lg:table-cell">
          {formatDateShort(apk.created_at)}
        </td>
        <td className="px-4 py-4 hidden sm:table-cell">
          <StatusBadge expiresAt={apk.expires_at} />
        </td>
        <td className="px-4 py-4 text-white/60 text-sm hidden md:table-cell">
          {apk.download_count || 0}
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Copy Link"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={handleOpen}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Open Link"
            >
              <ExternalLink size={13} />
            </button>
            <button
              onClick={() => onShowQR(apk)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Show QR"
            >
              <QrCode size={13} />
            </button>
            <button
              onClick={() => onDelete(apk)}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

function ApkCard({ apk, onDelete, onShowQR }) {
  const downloadUrl = getDownloadUrl(apk.slug)
  return (
    <div className="glass-card-hover p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{apk.app_name}</p>
            <p className="text-white/30 text-xs truncate">{apk.original_file_name}</p>
          </div>
        </div>
        <StatusBadge expiresAt={apk.expires_at} />
      </div>
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>{formatFileSize(apk.file_size)}</span>
        <span>{apk.download_count || 0} downloads</span>
        <span>{formatDateShort(apk.created_at)}</span>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
        <button onClick={async () => { await copyToClipboard(downloadUrl); toast.success('Link copied!') }} className="btn-secondary text-xs py-1.5 flex-1">
          <Copy size={11} /> Copy
        </button>
        <button onClick={() => window.open(downloadUrl, '_blank')} className="btn-secondary text-xs py-1.5 flex-1">
          <ExternalLink size={11} /> Open
        </button>
        <button onClick={() => onShowQR(apk)} className="btn-secondary text-xs py-1.5 flex-1">
          <QrCode size={11} /> QR
        </button>
        <button onClick={() => onDelete(apk)} className="btn-danger text-xs py-1.5 px-2.5">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

export default function ApkTable({ apks, onRefresh, loading }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [qrTarget, setQrTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = apks.filter(apk => {
    const matchSearch = !search ||
      apk.app_name.toLowerCase().includes(search.toLowerCase()) ||
      apk.original_file_name.toLowerCase().includes(search.toLowerCase())
    const status = getStatus(apk.expires_at)
    const matchStatus = statusFilter === 'all' || status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteApk(deleteTarget.id, deleteTarget.storage_path)
      toast.success('APK deleted successfully')
      setDeleteTarget(null)
      onRefresh()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search APKs..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field pl-9 pr-8 py-2.5 text-sm w-full sm:w-auto"
          >
            <option value="all" className="bg-navy-800">All Status</option>
            <option value="active" className="bg-navy-800">Active</option>
            <option value="expiring" className="bg-navy-800">Expiring Soon</option>
            <option value="expired" className="bg-navy-800">Expired</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="glass-card overflow-hidden hidden sm:block">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {apks.length === 0 ? 'No APKs uploaded yet' : 'No APKs match your search'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium">Application</th>
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium hidden md:table-cell">Size</th>
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium hidden lg:table-cell">Uploaded</th>
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium hidden md:table-cell">Downloads</th>
                <th className="px-4 py-3 text-left text-white/40 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apk => (
                <ApkRow
                  key={apk.id}
                  apk={apk}
                  onDelete={setDeleteTarget}
                  onShowQR={setQrTarget}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Package size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {apks.length === 0 ? 'No APKs uploaded yet' : 'No APKs match your search'}
            </p>
          </div>
        ) : (
          filtered.map(apk => (
            <ApkCard
              key={apk.id}
              apk={apk}
              onDelete={setDeleteTarget}
              onShowQR={setQrTarget}
            />
          ))
        )}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-white/30 text-xs text-right">
          {filtered.length} of {apks.length} APKs
        </p>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        apk={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* QR Modal */}
      <QRModal
        isOpen={!!qrTarget}
        apk={qrTarget}
        onClose={() => setQrTarget(null)}
      />
    </div>
  )
}
