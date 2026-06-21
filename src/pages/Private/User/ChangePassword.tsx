import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Check } from 'lucide-react'
import { changePassword } from '@/services/userService'

export function ChangePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newPassword || !confirmPassword) {
      setError('Password harus diisi')
      return
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    setLoading(true)
    try {
      await changePassword(newPassword)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Gagal mengubah password'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Ubah Password</CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            Selamat datang! Silakan ubah password Anda untuk keamanan akun.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Password berhasil diubah!</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                disabled={loading || success}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimal 6 karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                disabled={loading || success}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || success}
            >
              {loading ? 'Memproses...' : success ? 'Berhasil!' : 'Ubah Password'}
            </Button>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">Catatan Keamanan:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Gunakan password yang kuat dan sulit ditebak</li>
                <li>Jangan bagikan password dengan orang lain</li>
                <li>Gunakan kombinasi huruf, angka, dan simbol jika memungkinkan</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
