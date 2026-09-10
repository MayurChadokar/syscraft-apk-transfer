import { useState } from 'react'
import { User, Lock, Save, Loader2, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account and preferences."
    >
      <div className="max-w-xl space-y-6">
        {/* Profile Info */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User size={16} className="text-brand-400" />
            <h2 className="text-white font-semibold text-sm">Account Information</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Email Address</label>
              <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <p className="text-white/70 text-sm">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Account ID</label>
              <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <p className="text-white/30 text-xs font-mono truncate">{user?.id}</p>
              </div>
            </div>
            <div>
              <label className="block text-white/40 text-xs mb-1.5">Member Since</label>
              <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <p className="text-white/50 text-sm">
                  {new Date(user?.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-brand-400" />
            <h2 className="text-white font-semibold text-sm">Change Password</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                placeholder="Minimum 8 characters"
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                placeholder="Repeat new password"
                className="input-field"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : <><Save size={14} /> Update Password</>}
            </button>
          </form>
        </div>

        {/* App Info */}
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm font-medium">Syscraft APK Transfer</p>
            <p className="text-white/30 text-xs mt-0.5">Version 1.0.0 · Built with Supabase</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 4h6l4 4v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M11 4v4h4" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 12v-3M9 11l1 1 1-1" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
