import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, LogOut } from 'lucide-react'
import { Button } from './ui/button'

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'

  const navigationItems = [
    { label: 'Dashboard', path: `${user.role == 'admin' ? '/dashboard' : '/'}`, show: true },
    { label: 'Bon Tanah', path: `${user.role == 'admin' ? '/dashboard' : ''}/land-tickets`, show: true },
    { label: 'Bukti Pengiriman', path: `${user.role == 'admin' ? '/dashboard' : ''}/proof-deliveries`, show: true },
    { label: 'Vehicles', path: `${user.role == 'admin' ? '/dashboard' : ''}/vehicles`, show: isAdmin },
    { label: 'Users', path: `${user.role == 'admin' ? '/dashboard' : ''}/users`, show: isAdmin },
  ]
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside
        className={`fixed bg-white inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pt-5 border-b border-border">
          <h1 className="text-xl font-bold">SmartRitase</h1>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems
            .filter((item) => item.show)
            .map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded hover:bg-secondary transition-colors cursor-pointer ${item.path === location.pathname ? 'font-bold' : ''}`}
              >
                {item.label}
              </button>
            ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">Masuk Sebagai</p>
            <p className="font-medium truncate">{user.username || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
          <h1 className="font-semibold">{title}</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="hidden lg:block px-6 py-4 border-b border-border">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
