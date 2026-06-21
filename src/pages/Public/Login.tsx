import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { login, loadingLogin, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
      console.log(message);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm py-7">
        <CardHeader className='mb-auto'>
          <CardTitle className="text-center text-2xl!">
            SmartRitase
          </CardTitle>
          <CardDescription className='mb-2 text-base! text-center mt-2'>
            Masukkan email dan password untuk masuk ke akun anda!
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-2 mb-2'>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-red-500 text-red-500 bg-red-500/15 rounded text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="John doe"
              disabled={loadingLogin}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loadingLogin}
              required
            />

            <Button
              type="submit"
              variant="outline"
              isLoading={loadingLogin}
              className="w-full mt-2"
            >
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


export default Login