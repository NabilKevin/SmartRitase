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
import { type ProofDelivery, type LandTicket } from '@/types'
import { Plus, Edit, Trash2, MapPin, Camera } from 'lucide-react'
import { getCurrentLocation, formatDateTime } from '@/lib/utils'
import { useProofDeliveryStore } from '@/stores/proofDeliveryStore'
import { useLandTicketStore } from '@/stores/landTicketStore'
import { MapPicker } from '@/components/MapPicker'
import CameraModal from '@/components/CameraModel'
import { deleteProofDelivery, updateProofDelivery } from '@/services/proofDeliveryService'
import { useUserStore } from '@/stores/userStore'

export function ProofDeliveries() {
  const { user } = useAuthStore()
  const { proofDeliveries, fetchProofDeliveries, isLoadingProofDelivery, clearProofDelivery, createNewProofDelivery, isLoadingMore, hasMore, fetchMoreProofDeliveries } = useProofDeliveryStore()
  const { landTickets, fetchLandTickets } = useLandTicketStore()
  const { users, fetchUsers } = useUserStore()

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  
  const [isShowData, setIsShowData] = useState(false)
  const [landTicketFilters, setLandTicketFilters] = useState<LandTicket[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [photoModalTarget, setPhotoModalTarget] = useState(false)
  
  const [formData, setFormData] = useState({
    land_ticket_id: '',
    project_name: '',
    landfill_site_lat: 0,
    landfill_site_long: 0,
    unloading_time: new Date().toISOString().slice(0, 16),
    landfill_pic_name: '',
    landfill_pic_signature: '',
  })

  useEffect(() => {
    fetchProofDeliveries(user)
    fetchLandTickets(user)
    if(user?.role === 'admin') fetchUsers()
  }, [])

  useEffect(() => {
    if(landTickets.length > 0) {
      setLandTicketFilters(landTickets.filter(lt => lt.status === 'in_transit'))
    }
  }, [landTickets])

  const resetData = async () => {
    clearProofDelivery()
    await fetchProofDeliveries(user)
  }

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return proofDeliveries.slice(start, start + ITEMS_PER_PAGE)
  }, [proofDeliveries, currentPage])

  const totalPages = Math.ceil(proofDeliveries.length / ITEMS_PER_PAGE) || 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.land_ticket_id || !formData.project_name || !formData.landfill_pic_signature) {
      return alert('Silakan isi semua field')
    }

    setSubmitting(true)
    try {
      const unixDate = Math.floor(new Date(formData.unloading_time).getTime() / 1000).toString();
      if (editingId) {
        await updateProofDelivery(editingId, { ...formData, unloading_time: unixDate } as Partial<ProofDelivery>)
      } else {
        await createNewProofDelivery({ ...formData, unloading_time: unixDate } as Omit<ProofDelivery, 'id'>, user?.role === 'admin' ? null : user)
      }
      if(user?.role === 'admin') {
        await resetData()
      }
      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      alert('Gagal menyimpan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGetLocation = async () => {
    setGettingLocation(true)
    try {
      const location = await getCurrentLocation()
      setFormData({
        ...formData,
        landfill_site_lat: location.latitude,
        landfill_site_long: location.longitude,
      })
    } catch (error) {
      alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.')
    } finally {
      setGettingLocation(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      land_ticket_id: '',
      project_name: '',
      landfill_site_lat: 0,
      landfill_site_long: 0,
      unloading_time: new Date().toISOString().slice(0, 16),
      landfill_pic_name: '',
      landfill_pic_signature: '',
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if(editingId || isShowData) {
      setLandTicketFilters(() => [...landTicketFilters.slice(0,landTicketFilters.length-1)])
      resetForm()
    }
    setIsShowData(false)
  }

  const handleDelete = async (id: string, land_ticket_id: string) => {
    if (!confirm('Yakin hapus?')) return
    try {
      await deleteProofDelivery({ id, landTicketId: land_ticket_id })
      await fetchProofDeliveries(user)
    } catch (error) {
      alert('Gagal menghapus')
    }
  }

  return (
    <Layout title="Bukti Pengiriman">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Bukti Pengiriman</h2>
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Tambah Bukti Pengiriman
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoadingProofDelivery ? <SkeletonTable /> : proofDeliveries.length === 0 ? (
              <div className="text-center py-8">Tidak ada bukti pengiriman</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Proyek</th>
                      <th className="text-left py-3 px-4 font-semibold">Waktu Unloading</th>
                      <th className="text-left py-3 px-4 font-semibold">Lokasi Galian</th>
                      {
                        user?.role == 'admin' && <th className="text-left py-3 px-4 font-semibold">Aksi</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((delivery) => (
                      <tr key={delivery.id} className="border-b hover:bg-secondary cursor-pointer" onClick={(e: any) => {
                         if(!e.target.closest('.btn-aksi')) {
                           setIsShowData(true); setIsModalOpen(true);
                           setFormData({
                            land_ticket_id: delivery.land_ticket_id,
                            project_name: delivery.project_name,
                            landfill_site_lat: delivery.landfill_site_lat,
                            landfill_site_long: delivery.landfill_site_long,
                            unloading_time:  new Date(parseInt(delivery.unloading_time) * 1000).toISOString().split('T')[0],
                            landfill_pic_name: delivery.landfill_pic_name,
                            landfill_pic_signature: delivery.landfill_pic_signature,
                          })
                         }
                      }}>
                        <td className="py-3 px-4">{delivery.project_name}</td>
                        <td className="py-3 px-4">{formatDateTime(delivery.unloading_time)}</td>
                        <td className="py-3 px-4 text-xs">
                          <a href={`https://www.google.com/maps/search/?q=${delivery.landfill_site_lat},${delivery.landfill_site_long}`} target='_blank' rel="noreferrer" className="flex items-center gap-1 text-blue-500">
                            <MapPin size={14} /> Lokasi Galian
                          </a>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="py-3 px-4 flex gap-2 btn-aksi">
                            <Button size="sm" variant="outline" className="btn-edit" onClick={() =>  {
                                const dataLandTicket = landTickets.find(ticket => ticket.id == delivery.land_ticket_id) as LandTicket
                                setFormData({
                                  land_ticket_id: delivery.land_ticket_id,
                                  project_name: delivery.project_name,
                                  landfill_site_lat: delivery.landfill_site_lat,
                                  landfill_site_long: delivery.landfill_site_long,
                                  unloading_time:  new Date(parseInt(delivery.unloading_time) * 1000).toISOString().split('T')[0],
                                  landfill_pic_name: delivery.landfill_pic_name,
                                  landfill_pic_signature: delivery.landfill_pic_signature,
                                })
                                setLandTicketFilters(props => [
                                  ...props,
                                  dataLandTicket
                                ])
                                setEditingId(delivery.id!)
                                setIsModalOpen(true)
                              }}>
                              <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="danger" className="btn-delete" onClick={() => handleDelete(delivery.id!, delivery.land_ticket_id)}>
                              <Trash2 size={16} />
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
              onClick={() => fetchMoreProofDeliveries(user.role, user)}
              isLoading={isLoadingMore}
              className="w-full md:w-auto"
            >
              Muat Lebih Banyak Bukti Pengiriman
            </Button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Bukti Pengiriman' : isShowData ? 'Lihat Bukti Pengiriman' : 'Tambah Bukti Pengiriman'}
        className="max-w-2xl max-h-9/10 overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {
            isShowData ? (
              <Select
                label="Land Ticket"
                value={formData.land_ticket_id}
                onChange={(e) => setFormData({ ...formData, land_ticket_id: e.target.value })}
                options={landTickets.map((t) => ({ value: t.id!, label: `${user?.role == 'user' ? user.username : users.find(u => u.uid == t.driver_id)?.username} - ${formatDateTime(t.date)}` }))}
                disabled={submitting || isShowData}
              />
            ) : (
              <Select
                label="Land Ticket"
                value={formData.land_ticket_id}
                onChange={(e) => setFormData({ ...formData, land_ticket_id: e.target.value })}
                options={landTicketFilters.map((t) => ({ value: t.id!, label: `${user?.role == 'user' ? user.username : users.find(u => u.uid == t.driver_id)?.username} - ${formatDateTime(t.date)}` }))}
                disabled={submitting || isShowData}
              />
            )
          }

          <Input
            label="Nama Proyek"
            value={formData.project_name}
            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
            placeholder="Proyek Pembangunan..."
            disabled={submitting || isShowData}
          />

          <Input
            label="Waktu Unloading"
            type="date"
            value={formData.unloading_time}
            onChange={(e) => setFormData({ ...formData, unloading_time: e.target.value })}
            disabled={submitting || isShowData}
          />

          {
            user?.role == 'user' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi Galian</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="Latitude"
                      type="number"
                      step="0.0001"
                      value={formData.landfill_site_lat}
                      disabled={true}
                      readOnly
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Longitude"
                      type="number"
                      step="0.0001"
                      value={formData.landfill_site_long}
                      disabled={true}
                      readOnly
                    />
                  </div>
                </div>
                {
                  !isShowData && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleGetLocation}
                      isLoading={gettingLocation}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <MapPin size={16} />
                      Ambil Lokasi Saat Ini
                    </Button>
                  )
                }
              </div>
            )
          }

          {
            user?.role == 'admin' && (
              <div>
                <label className="block mb-2 font-semibold">Pilih Titik Galian di Peta:</label>
                <p className="text-sm text-gray-500 mb-2">Klik area pada peta untuk meletakkan pin lokasi.</p>
                
                <MapPicker
                  onLocationSelect={(lat, lng) => setFormData(formData => ({...formData, landfill_site_lat: lat, landfill_site_long: lng}))} 
                  disabled={isShowData}
                />
                
                {formData.landfill_site_lat !== 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    Koordinat terpilih: {formData.landfill_site_lat.toFixed(6)}, {formData.landfill_site_long.toFixed(6)}
                  </p>
                )}
              </div>
            )
          }
          
          <Input
            label="Nama Pengawas"
            value={formData.landfill_pic_name}
            onChange={(e) => setFormData({ ...formData, landfill_pic_name: e.target.value })}
            disabled={submitting || isShowData}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Tanda Tangan Pengawas</label>
            {formData.landfill_pic_signature && (
              <div className="border border-border rounded p-2">
                <img src={`${!formData.landfill_pic_signature.includes('data:image/') ? 'data:image/jpeg;base64,' : ''}${formData.landfill_pic_signature}`} alt={'Tanda Tangan Pengawas'} className="w-full h-24 object-contain" />
              </div>
            )}
            {!isShowData && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPhotoModalTarget(true)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Camera size={16} /> {formData.landfill_pic_signature ? 'Ubah' : 'Buat'} Tanda Tangan
              </Button>
            )}
          </div>

          {!isShowData && (
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={submitting}
                className="flex-1"
              >
                {editingId ? 'Simpan Perubahan' : 'Buat Bukti'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={submitting}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          )}
        </form>
      </Modal>

      <CameraModal
        isOpen={!!photoModalTarget} 
        onClose={() => setPhotoModalTarget(false)} 
        targetField={'landfill_pic_signature'}
        onCapture={(field: string, base64: string) => setFormData(prev => ({ ...prev, [field]: base64 }))}
      />
    </Layout>
  )
}
