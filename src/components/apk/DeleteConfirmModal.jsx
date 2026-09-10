import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import Modal from '../ui/Modal'

export default function DeleteConfirmModal({ isOpen, apk, onConfirm, onCancel, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Delete APK</h3>
            <p className="text-white/40 text-sm mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-white/50 text-xs mb-0.5">APK to delete</p>
          <p className="text-white text-sm font-medium">{apk?.app_name}</p>
          <p className="text-white/30 text-xs">{apk?.original_file_name}</p>
        </div>

        <p className="text-white/50 text-sm leading-relaxed">
          The APK file and its download link will be permanently deleted. 
          Anyone with the link will no longer be able to download it.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex-1"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete APK
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
