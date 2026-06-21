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
import { type LandTicket } from '@/types'
import { Plus, Edit, Trash2, MapPin, Camera } from 'lucide-react'
import { getCurrentLocation, formatDateTime } from '@/lib/utils'
import { useLandTicketStore } from '@/stores/landTicketStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { MapPicker } from '@/components/MapPicker'
import { useUserStore } from '@/stores/userStore'
import { deleteLandTicket, updateLandTicket } from '@/services/landTicketService'
import { useProofDeliveryStore } from '@/stores/proofDeliveryStore'
import CameraModal from '@/components/CameraModel'

export function LandTickets() {
  const { user } = useAuthStore()
  const { landTickets, fetchLandTickets, fetchMoreLandTickets, clearTickets, isLoadingLandTicket, isLoadingMore, hasMore, createNewLandTicket } = useLandTicketStore()
  const { clearProofDelivery } = useProofDeliveryStore()
  const { vehicles, fetchVehicles } = useVehicleStore()
  const { users, fetchUsers } = useUserStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [isShowData, setIsShowData] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  
  const [photoModalTarget, setPhotoModalTarget] = useState<'driver_signature' | 'excavation_pic_signature' | null>(null)

  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    vehicle_id: '',
    date: new Date().toISOString().split('T')[0],
    excavation_site_lat: 0,
    excavation_site_long: 0,
    driver_signature: '',
    excavation_pic_signature: '',
    driver_id: ''
  })

  useEffect(() => {
    fetchLandTickets(user)
    fetchVehicles()
    if (user?.role === 'admin') fetchUsers()
  }, [user?.role])

  useEffect(() => {
    setTotalPages(Math.ceil(landTickets.length / ITEMS_PER_PAGE) || 1);
  }, [landTickets]);
  
  const userMap = useMemo(() => new Map(users.map(u => [u.uid, u.username])), [users]);
  const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v.type])), [vehicles]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return landTickets.slice(startIndex, endIndex);
  }, [landTickets, currentPage]);
  
  
  const resetData = async () => {
    clearTickets()
    await fetchLandTickets(user)
  }

  const handleGetLocation = async () => {
    setGettingLocation(true)
    try {
      const location = await getCurrentLocation()
      setFormData(prev => ({
        ...prev,
        excavation_site_lat: location.latitude,
        excavation_site_long: location.longitude,
      }))
    } catch (error) {
      alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { vehicle_id, date, excavation_site_lat, excavation_site_long, driver_signature, excavation_pic_signature } = formData;
    if (!vehicle_id || !date || !excavation_site_lat || !excavation_site_long || !driver_signature || !excavation_pic_signature) {
      return alert('Silakan isi semua field');
    }

    setSubmitting(true)
    try {
      const unixDate = Math.floor(new Date(date).getTime() / 1000).toString();
      
      if (editingId) {
        await updateLandTicket(editingId, { ...formData, date: unixDate } as Partial<LandTicket>)
      } else {
        const landTicketData = {
          ...formData,
          status: 'in_transit',
          date: unixDate,
          driver_id: user?.role === 'admin' ? formData.driver_id : user?.uid,
        } as Omit<LandTicket, 'id'>

        await createNewLandTicket(landTicketData, user?.role === 'admin' ? null : user);
      }
      
      if (user?.role === 'admin') await resetData()
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
      vehicle_id: '',
      date: new Date().toISOString().split('T')[0],
      excavation_site_lat: 0,
      excavation_site_long: 0,
      driver_signature: '',
      excavation_pic_signature: '',
      driver_id: ''
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if(editingId || isShowData) {
      resetForm()
    }
    setIsShowData(false)
  }

  const handleDelete = async (ticketId: string, status: string) => {
    if (!confirm('Yakin hapus tiket ini?')) return
    
    clearTickets() 
    try {
      await deleteLandTicket(ticketId, status === 'completed')
      await resetData()
      clearProofDelivery()

      setCurrentPage(1)
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Gagal menghapus tiket')
    }
  }

  return (
    <Layout title="Bon Tanah">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Bon Tanah</h2>
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} /> Tambah Bon Tanah
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoadingLandTicket ? (
              <SkeletonTable />
            ) : landTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada bon tanah</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 font-semibold">Tanggal</th>
                      <th className="text-left py-3 px-4 font-semibold">Kendaraan</th>
                      <th className="text-left py-3 px-4 font-semibold">Lokasi</th>
                      {user?.role === 'admin' && <th className="text-left py-3 px-4 font-semibold">Aksi</th>}
                    </tr>
                  </thead>
                    <tbody>
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-border hover:bg-secondary transition-colors" onClick={(e: any) => {
                          if(![...e.target.parentElement.classList].find(t => t.includes('btn-'))) {
                            setIsShowData(true)
                            setIsModalOpen(true)
                            setFormData({
                              vehicle_id: ticket.vehicle_id,
                              date: new Date(parseInt(ticket.date) * 1000).toISOString().split('T')[0],
                              excavation_site_lat: ticket.excavation_site_lat,
                              excavation_site_long: ticket.excavation_site_long,
                              driver_signature: ticket.driver_signature || '',
                              excavation_pic_signature: ticket.excavation_pic_signature || '',
                              driver_id: ticket.driver_id
                            })
                          }
                        }}>
                        <td className="py-3 px-4">{user?.role === 'user' ? user.username : userMap.get(ticket.driver_id)}</td>
                        <td className="py-3 px-4">{formatDateTime(ticket.date)}</td>
                        <td className="py-3 px-4">{vehicleMap.get(ticket.vehicle_id)}</td>
                        <td className="py-3 px-4 text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <a href={`https://www.google.com/maps/search/?api=1&query=${ticket.excavation_site_lat},${ticket.excavation_site_long}`} target='_blank' rel="noreferrer" className="text-blue-500 hover:underline"> 
                              Lokasi Galian
                            </a>                            
                          </div>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="py-3 px-4 flex gap-2 btn-aksi">
                            <Button size="sm" variant="outline" className='btn-edit' onClick={() => {
                              setFormData({
                                vehicle_id: ticket.vehicle_id,
                                date: new Date(parseInt(ticket.date) * 1000).toISOString().split('T')[0],
                                excavation_site_lat: ticket.excavation_site_lat,
                                excavation_site_long: ticket.excavation_site_long,
                                driver_signature: ticket.driver_signature || '',
                                excavation_pic_signature: ticket.excavation_pic_signature || '',
                                driver_id: ticket.driver_id
                              })
                              setEditingId(ticket.id!)
                              setIsModalOpen(true)
                            }}>
                              <Edit size={16} className='btn-edit' />
                            </Button>
                            <Button size="sm" className='btn-delete' variant="danger" onClick={() => handleDelete(ticket.id!, ticket.status)}>
                              <Trash2 size={16} className='btn-delete' />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {user?.role === 'user' && hasMore && landTickets.length >= 50 && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={() => fetchMoreLandTickets(user.role, user)}
              isLoading={isLoadingMore}
              className="w-full md:w-auto"
            >
              Muat Lebih Banyak Bon Tanah
            </Button>
          </div>
        )}

        {!isLoadingLandTicket && totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              isLoading={isLoadingLandTicket} 
            />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Bon Tanah' : 'Tambah Bon Tanah'} className="max-w-2xl max-h-9/10 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === 'admin' && (
            <Select
              label="Supir"
              value={formData.driver_id}
              onChange={(e) => setFormData(prev => ({ ...prev, driver_id: e.target.value }))}
              options={users.filter(u => u.role === 'user').map(v => ({ value: v.uid, label: `${v.username} - ${v.email}` }))}
              disabled={submitting || isShowData}
            />
          )}

          <Select
            label="Kendaraan"
            value={formData.vehicle_id}
            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_id: e.target.value }))}
            options={vehicles.map((v) => ({ value: v.id!, label: `${v.plate} - ${v.type}` }))}
            disabled={submitting || isShowData}
          />

          <Input
            label="Tanggal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            disabled={submitting || isShowData}
          />

          {user?.role === 'user' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Lokasi Penggalian</label>
              <div className="flex gap-2">
                <Input label="Latitude" type="number" step="0.0001" value={formData.excavation_site_lat} disabled readOnly className="flex-1" />
                <Input label="Longitude" type="number" step="0.0001" value={formData.excavation_site_long} disabled readOnly className="flex-1" />
              </div>
              {
                !isShowData && (
                  <Button type="button" variant="secondary" onClick={handleGetLocation} isLoading={gettingLocation} className="w-full flex justify-center gap-2">
                    <MapPin size={16} /> Ambil Lokasi Saat Ini
                  </Button>
                )
              }
            </div>
          )}

          {user?.role === 'admin' && (
            <div>
              <label className="block mb-2 font-semibold">Pilih Titik Galian di Peta:</label>
              <p className="text-sm text-gray-500 mb-2">Klik area pada peta untuk meletakkan pin lokasi.</p>
              <MapPicker disabled={isShowData} onLocationSelect={(lat, lng) => setFormData(prev => ({...prev, excavation_site_lat: lat, excavation_site_long: lng}))} />
              {formData.excavation_site_lat !== 0 && (
                <p className="text-sm text-blue-600 mt-2">Koordinat terpilih: {formData.excavation_site_lat.toFixed(6)}, {formData.excavation_site_long.toFixed(6)}</p>
              )}
            </div>
          )}

          {[
            { label: 'Tanda Tangan Sopir', field: 'driver_signature', roleModal: 'driver', photoModalTarget: 'driver_signature' },
            { label: 'Tanda Tangan PIC Galian', field: 'excavation_pic_signature', roleModal: 'excavation', photoModalTarget: 'excavation_pic_signature' }
          ].map((item) => (
            <div className="space-y-2" key={item.field}>
              <label className="text-sm font-medium">{item.label}</label>
              {(formData as any)[item.field] && (
                <div className="border border-border rounded p-2">
                  <img src={`${!(formData as any)[item.field].includes('data:image/') ? 'data:image/jpeg;base64,' : ''}${(formData as any)[item.field]}`} alt={item.label} className="w-full h-24 object-contain" />
                </div>
              )}
              {!isShowData && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPhotoModalTarget(item.photoModalTarget as any)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Camera size={16} /> {(formData as any)[item.field] ? 'Ubah' : 'Buat'} Tanda Tangan
                </Button>
              )}
            </div>
          ))}

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


      <CameraModal
        isOpen={!!photoModalTarget} 
        onClose={() => setPhotoModalTarget(null)} 
        targetField={photoModalTarget}
        onCapture={(field: string, base64: string) => setFormData(prev => ({ ...prev, [field]: base64 }))}
      />
    </Layout>
  )
}