import { useState, useEffect } from 'react'
import { Package, Link2, Download, Clock } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/dashboard/StatCard'
import UploadCard from '../components/dashboard/UploadCard'
import SuccessModal from '../components/dashboard/SuccessModal'
import ApkTable from '../components/apk/ApkTable'
import { getDashboardStats, getUserApks } from '../lib/apkService'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentApks, setRecentApks] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingApks, setLoadingApks] = useState(true)
  const [successData, setSuccessData] = useState(null)

  const loadData = async () => {
    try {
      const [statsData, apksData] = await Promise.all([
        getDashboardStats(),
        getUserApks(),
      ])
      setStats(statsData)
      setRecentApks(apksData.slice(0, 5))
    } catch (err) {
      toast.error('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoadingStats(false)
      setLoadingApks(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUploadSuccess = (data) => {
    setSuccessData(data)
    loadData() // Refresh stats
    toast.success('APK uploaded successfully!')
  }

  return (
    <DashboardLayout
      title="APK Transfer"
      subtitle="Upload, manage and share your Android builds."
    >
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total APKs"
            value={stats?.total ?? 0}
            icon={Package}
            color="blue"
            loading={loadingStats}
          />
          <StatCard
            title="Active Links"
            value={stats?.active ?? 0}
            icon={Link2}
            color="green"
            loading={loadingStats}
          />
          <StatCard
            title="Total Downloads"
            value={stats?.downloads ?? 0}
            icon={Download}
            color="cyan"
            loading={loadingStats}
          />
          <StatCard
            title="Expired"
            value={stats?.expired ?? 0}
            icon={Clock}
            color="red"
            loading={loadingStats}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Upload Card */}
          <div className="xl:col-span-2">
            <UploadCard onSuccess={handleUploadSuccess} />
          </div>

          {/* Recent APKs */}
          <div className="xl:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Recent APKs</h2>
                <a href="/apks" className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
                  View all →
                </a>
              </div>

              {loadingApks ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card p-4 flex items-center gap-3">
                      <div className="skeleton w-9 h-9 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3.5 w-32 rounded" />
                        <div className="skeleton h-3 w-20 rounded" />
                      </div>
                      <div className="skeleton h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentApks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Package size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">No APKs uploaded yet</p>
                  <p className="text-white/20 text-xs mt-1">Upload your first APK to get started</p>
                </div>
              ) : (
                <ApkTable
                  apks={recentApks}
                  onRefresh={loadData}
                  loading={loadingApks}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successData}
        data={successData}
        onClose={() => setSuccessData(null)}
      />
    </DashboardLayout>
  )
}
