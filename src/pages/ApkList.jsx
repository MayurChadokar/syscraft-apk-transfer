import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ApkTable from '../components/apk/ApkTable'
import { getUserApks } from '../lib/apkService'
import toast from 'react-hot-toast'

export default function ApkList() {
  const [apks, setApks] = useState([])
  const [loading, setLoading] = useState(true)

  const loadApks = async () => {
    try {
      const data = await getUserApks()
      setApks(data)
    } catch (err) {
      toast.error('Failed to load APKs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApks()
  }, [])

  return (
    <DashboardLayout
      title="APK Files"
      subtitle="Manage all your uploaded Android packages."
    >
      <div className="space-y-6">
        <ApkTable
          apks={apks}
          onRefresh={loadApks}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  )
}
