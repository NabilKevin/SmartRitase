import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
// import {
//   getLandTickets,
//   getProofDeliveries,
//   getVehicles,
//   getUsers,
// } from '@/services/database'
import { Skeleton } from '@/components/ui/skeleton'
import { useLandTicketStore } from '@/stores/landTicketStore'
import { useProofDeliveryStore } from '@/stores/proofDeliveryStore'

function Dashboard() {
  const getVehicles = (...props: any) => ({total: 0})
  const getUsers = (...props: any) => ({total: 0})

  const { user } = useAuthStore()
  const { fetchLandTickets, landTickets } = useLandTicketStore()
  const { fetchProofDeliveries, proofDeliveries } = useProofDeliveryStore()
  const [stats, setStats] = useState({
    landTickets: 0,
    proofDeliveries: 0,
    vehicles: 0,
    users: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      try {
        const [vehiclesResult, usersResult] =
          await Promise.all([
            getVehicles(1),
            getUsers(1),
          ])

        setStats(props => ({
          ...props,
          vehicles: vehiclesResult.total,
          users: usersResult.total,
        }))
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    fetchLandTickets()
    fetchProofDeliveries()
  }, [])

  useEffect(() => {
    setStats(props => ({
      ...props,
      landTickets: landTickets.length,
      proofDeliveries: proofDeliveries.length,
    }))
  }, [landTickets, proofDeliveries])

  const statCards = [
    {
      title: 'Land Tickets',
      value: stats.landTickets,
      color: 'border-accent',
    },
    {
      title: 'Proof Deliveries',
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
                {loading ? (
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