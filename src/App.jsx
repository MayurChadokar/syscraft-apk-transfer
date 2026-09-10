import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ApkList from './pages/ApkList'
import Settings from './pages/Settings'
import DownloadPage from './pages/DownloadPage'
import NotFound from './pages/NotFound'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/download/:slug" element={<DownloadPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/apks" element={
        <ProtectedRoute><ApkList /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f9fafb',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: {
                primary: '#34d399',
                secondary: '#111827',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#111827',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
