export default function StatCard({ title, value, icon: Icon, color = 'blue', loading = false, subtitle }) {
  const colorMap = {
    blue: {
      icon: 'text-brand-400',
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
    },
    green: {
      icon: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    amber: {
      icon: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    red: {
      icon: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    cyan: {
      icon: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
  }

  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-3 w-24 rounded-md" />
      </div>
    )
  }

  return (
    <div className="stat-card glass-card-hover">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
        <Icon size={18} className={colors.icon} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-white/50 text-sm mt-1">{title}</p>
        {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
