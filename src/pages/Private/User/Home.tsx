import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/ui/skeleton'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useLandTicketStore } from '@/stores/landTicketStore'
import { useProofDeliveryStore } from '@/stores/proofDeliveryStore'

export function Home() {
  const { user } = useAuthStore()
  const { landTickets, fetchLandTickets, isLoadingLandTicket } = useLandTicketStore()
  const { proofDeliveries, fetchProofDeliveries, isLoadingProofDelivery } = useProofDeliveryStore()
  const { fetchVehicles } = useVehicleStore()

  const [stats, setStats] = useState({
    landTickets: 0,
    proofDeliveries: 0,
  })

  useEffect(() => {
    fetchLandTickets(user)
    fetchProofDeliveries(user)
    fetchVehicles()
  }, [])

  useEffect(() => {
    if(landTickets.length > 0) {
      setStats((props: any) => ({
        ...props,
        landTickets: landTickets.length
      }))
    }
    if(proofDeliveries.length > 0) {
      setStats((props: any) => ({
        ...props,
        proofDeliveries: proofDeliveries.length
      }))
    }
  }, [landTickets, proofDeliveries])

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
  ]

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-l-4">
              <CardContent className="pt-6">
                {isLoadingLandTicket && isLoadingProofDelivery ? (
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
