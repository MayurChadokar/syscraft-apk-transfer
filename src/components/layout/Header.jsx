import { Menu } from 'lucide-react'

export default function Header({ onMenuToggle, title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-md">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-white font-semibold text-base leading-tight">
          {title || 'APK Transfer'}
        </h1>
        {subtitle && (
          <p className="text-white/40 text-xs mt-0.5 hidden sm:block">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
