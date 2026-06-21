import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Pagination } from '@/components/ui/pagination'
import { SkeletonTable } from '@/components/ui/skeleton'
import { type Vehicle } from '@/types'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useVehicleStore } from '@/stores/vehicleStore'
import { createVehicle, deleteVehicle, updateVehicle } from '@/services/vehicleService';

function Vehicles() {
  const { vehicles, fetchVehicles, clearVehicles, isLoadingVehicle } = useVehicleStore()

  const [currentPage, setCurrentPage] = useState(1)
  const [isShowData, setIsShowData] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const ITEMS_PER_PAGE = 10;

  const vehicleType = [
    'Colt Diesel Engkel (CDE) Dump',
    'Colt Diesel Double (CDD) Dump',
    'Dump Truck Engkel Besar',
    'Dump Truck Tronton',
    'Dump Truck Tronton Jumbo',
    'Dump Truck Trailer'
  ]

  const [formData, setFormData] = useState({
    plate: '',
    type: '',
    status: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    setTotalPages(Math.ceil(vehicles.length / ITEMS_PER_PAGE) || 1);
  }, [vehicles]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    return vehicles.slice(startIndex, endIndex);
  }, [vehicles, currentPage]);
  
  
  const resetData = async () => {
    clearVehicles()
    await fetchVehicles()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { type, plate, status } = formData;
    if (!type || !plate || !status) {
      return alert('Silakan isi semua field');
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await updateVehicle(editingId, { ...formData } as Partial<Vehicle>)
      } else {
        const vehicleData = {...formData} as Omit<Vehicle, 'id'>

        await createVehicle(vehicleData);
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
      plate: '',
      type: '',
      status: ''
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
    
    clearVehicles() 
    try {
      await deleteVehicle(id)
      await resetData()

      setCurrentPage(1)
    } catch (error) {
      console.error('Error deleting ticket:', error)
      alert('Gagal menghapus tiket')
    }
  }

  return (
    <Layout title="Kendaraan">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Daftar Kendaraan</h2>
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} /> Tambah Kendaraan
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoadingVehicle ? (
              <SkeletonTable />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tidak ada Kendaraan</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Plat Nomor</th>
                      <th className="text-left py-3 px-4 font-semibold">Jenis</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                    <tbody>
                      {paginatedVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="border-b border-border hover:bg-secondary transition-colors" onClick={(e: any) => {
                          if(![...e.target.parentElement.classList].find(t => t.includes('btn-'))) {
                            setIsShowData(true)
                            setIsModalOpen(true)
                            setFormData({
                              plate: vehicle.plate,
                              type: vehicle.type,
                              status: vehicle.status
                            })
                          }
                        }}>
                        <td className="py-3 px-4">{vehicle.plate}</td>
                        <td className="py-3 px-4">{vehicle.type}</td>
                        <td className="py-3 px-4">{vehicle.status == 'active' ? 'Aktif' : 'Inaktif'}</td>
                        <td className="py-3 px-4 flex gap-2 btn-aksi">
                          <Button size="sm" variant="outline" className='btn-edit' onClick={() => {
                            setFormData({
                              plate: vehicle.plate,
                              type: vehicle.type,
                              status: vehicle.status
                            })
                            setEditingId(vehicle.id!)
                            setIsModalOpen(true)
                          }}>
                            <Edit size={16} className='btn-edit' />
                          </Button>
                          <Button size="sm" className='btn-delete' variant="danger" onClick={() => handleDelete(vehicle.id!)}>
                            <Trash2 size={16} className='btn-delete' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {!isLoadingVehicle && totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
              isLoading={isLoadingVehicle} 
            />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Kendaraan' : isShowData ? 'Lihat Kendaraan' : 'Tambah Kendaraan'} className="max-w-2xl max-h-9/10 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plat Nomor"
            type="text"
            value={formData.plate}
            onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value }))}
            disabled={submitting || isShowData}
          />

          <Select
            label="Jenis"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={vehicleType.map((t) => ({ value: t, label: t }))}
            disabled={submitting || isShowData}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[{
              display: 'Aktif',
              value: 'active'
            }, {
              display: 'Inaktif',
              value: 'inactive'
            }].map((t) => ({ value: t.value, label: t.display }))}
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

export default Vehicles