import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Pagination } from '@/components/ui/pagination'
import { SkeletonTable } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/authStore'
import { type User } from '@/types'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { createUser, deleteUser, updateUser } from '@/services/userService';

function Users() {
  const { user } = useAuthStore()
  const { users, fetchUsers, clearUsers, isLoadingUser } = useUserStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [isShowData, setIsShowData] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    setTotalPages(Math.ceil(users.length / ITEMS_PER_PAGE) || 1);
  }, [users]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return users.slice(startIndex, endIndex);
  }, [users, currentPage]);
  
  
  const resetData = async () => {
    clearUsers()
    await fetchUsers()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { email, username, role } = formData;
    if (!email || !username || !role) {
      return alert('Silakan isi semua field');
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await updateUser(editingId, { ...formData } as Partial<User>)
      } else {
        const userData = {...formData} as Omit<User, 'id'>

        await createUser(userData);
      }
      
      await resetData()
      handleCloseModal();
    } catch (error) {
      console.error('Error saving ticket:', error)
      alert('Gagal menyimpan tiket')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      email: '',
      username: '',
      role: ''
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if(editingId || isShowData) {
      resetForm()
    }
    setIsShowData(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus tiket ini?')) return
    
    clearUsers() 
    try {
      await deleteUser(id)
      await resetData()

      setCurrentPage(1)
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Gagal menghapus tiket')
    }
  }

  return (
    <Layout title="Pengguna">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Pengguna</h2>
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} /> Tambah Pengguna
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoadingUser ? (
              <SkeletonTable />
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada User</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                    <tbody>
                      {paginatedUsers.map((u) => (
                        <tr key={u.uid} className="border-b border-border hover:bg-secondary transition-colors" onClick={(e: any) => {
                          if(![...e.target.parentElement.classList].find(t => t.includes('btn-'))) {
                            setIsShowData(true)
                            setIsModalOpen(true)
                            setFormData({
                              email: u.email,
                              username: u.username!,
                              role: u.role,
                            })
                          }
                        }}>
                        <td className="py-3 px-4">{u.username}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">{u.role}</td>
                        <td className="py-3 px-4 flex gap-2 btn-aksi">
                          <Button size="sm" variant="outline" className='btn-edit' onClick={() => {
                            setFormData({
                              email: u.email,
                              username: u.username!,
                              role: u.role,
                            })
                            setEditingId(u.uid!)
                            setIsModalOpen(true)
                          }}>
                            <Edit size={16} className='btn-edit' />
                          </Button>
                          {
                            u.uid != user?.uid && (
                              <Button size="sm" className='btn-delete' variant="danger" onClick={() => handleDelete(u.uid)}>
                                <Trash2 size={16} className='btn-delete' />
                              </Button>
                            ) 
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {!isLoadingUser && totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              isLoading={isLoadingUser} 
            />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Pengguna' : isShowData ? 'Lihat Pengguna' : 'Tambah Pengguna'} className="max-w-2xl max-h-9/10 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            disabled={submitting || isShowData}
          />

          <Input
            label="Email"
            type="text"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={submitting || isShowData}
          />

          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={['User', 'Admin'].map((t) => ({ value: t.toLowerCase(), label: t }))}
            disabled={submitting || isShowData}
          />

          {!isShowData && (
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={submitting} className="flex-1">
                {editingId ? 'Simpan Perubahan' : 'Buat Tiket'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={submitting} className="flex-1">Batal</Button>
            </div>
          )}
        </form>
      </Modal>
    </Layout>
  )
}

export default Users