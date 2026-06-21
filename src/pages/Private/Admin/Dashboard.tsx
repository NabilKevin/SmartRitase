import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/ui/skeleton'
import { useLandTicketStore } from '@/stores/landTicketStore'
import { useProofDeliveryStore } from '@/stores/proofDeliveryStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useUserStore } from '@/stores/userStore'

function Dashboard() {
  const { user } = useAuthStore()
  const { fetchLandTickets, landTickets, isLoadingLandTicket } = useLandTicketStore()
  const { fetchProofDeliveries, proofDeliveries, isLoadingProofDelivery } = useProofDeliveryStore()
  const { fetchVehicles, vehicles, isLoadingVehicle } = useVehicleStore()
  const { fetchUsers, users, isLoadingUser } = useUserStore()
  const [stats, setStats] = useState({
    landTickets: 0,
    proofDeliveries: 0,
    vehicles: 0,
    users: 0,
  })

  useEffect(() => {
    fetchLandTickets()
    fetchProofDeliveries()
    fetchVehicles()
    fetchUsers()
  }, [])

  useEffect(() => {
    setStats(() => ({
      users: users.length,
      vehicles: vehicles.length,
      landTickets: landTickets.length,
      proofDeliveries: proofDeliveries.length,
    }))
  }, [landTickets, proofDeliveries, vehicles, users])

  const statCards = [
    {
      title: 'Bon Tanah',
      value: stats.landTickets,
      color: 'border-accent',
    },
    {
      title: 'Bukti Pengiriman',
      value: stats.proofDeliveries,
      color: 'border-primary',
    },
    {
      title: 'Kendaraan',
      value: stats.vehicles,
      color: 'border-secondary',
    },
    {
      title: 'Pengguna',
      value: stats.users,
      color: 'border-muted',
    },
  ]

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-l-4">
              <CardContent className="pt-6">
                {isLoadingLandTicket || isLoadingProofDelivery || isLoadingUser || isLoadingVehicle ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-accent">
                      {stat.value}
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Dashboard