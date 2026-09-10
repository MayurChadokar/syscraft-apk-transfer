import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, Package, Link2, Clock, Settings, LogOut, 
  Zap, X, Menu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/apks', icon: Package, label: 'APK Files' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function SyscraftLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 4h6l4 4v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M11 4v4h4" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 12v-3M9 11l1 1 1-1" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <p className="text-white font-semibold text-sm leading-tight">Syscraft</p>
        <p className="text-white/40 text-xs leading-tight">APK Transfer</p>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
      toast.success('Signed out successfully')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
        <SyscraftLogo />
        {mobileOpen !== undefined && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        {/* User info */}
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-xs font-semibold">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">{user?.email}</p>
            <p className="text-white/30 text-xs">Admin</p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col h-screen sticky top-0 border-r border-white/[0.06] bg-navy-900/50 backdrop-blur-sm">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-navy-900 border-r border-white/[0.06] flex flex-col animate-slide-up">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
