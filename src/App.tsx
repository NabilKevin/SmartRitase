import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from './components/ui/skeleton'
import PublicRoute from './routes/public'
import AdminRoute from './routes/private/admin'
import UserRoute from './routes/private/user'
import PrivateRoute from './routes/private'

function AppRoutes() {
  const { user, loadingPage, initializeAuth } = useAuthStore()

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [initializeAuth])

  if (loadingPage) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 max-w-md w-full">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }
  
  console.log(user);
  
  if (!user) return <PublicRoute />
  if (user.is_first_login) return <PrivateRoute />
  if (user.role === 'admin') return <AdminRoute />
  return <UserRoute />
  
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App