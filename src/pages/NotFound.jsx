import { Link } from 'react-router-dom'
import { Home, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 animate-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto">
          <FileQuestion size={36} className="text-white/20" />
        </div>
        
        <div>
          <p className="text-white/20 text-sm font-mono mb-2">404</p>
          <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
          <p className="text-white/40 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <Link to="/" className="btn-primary text-sm">
            <Home size={14} />
            Go Home
          </Link>
          <Link to="/dashboard" className="btn-secondary text-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
