export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton rounded-2xl ${className}`} />
  )
}

export function SkeletonText({ className = '' }) {
  return (
    <div className={`skeleton rounded-md h-4 ${className}`} />
  )
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <SkeletonText className="w-20" />
          <SkeletonText className="w-12 h-7" />
          <SkeletonText className="w-24 h-3" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-center gap-4">
          <SkeletonText className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-40" />
            <SkeletonText className="w-24 h-3" />
          </div>
          <SkeletonText className="w-20" />
          <SkeletonText className="w-16" />
        </div>
      ))}
    </div>
  )
}
