import Dashboard from "@/pages/Private/Admin/Dashboard"
import Users from "@/pages/Private/Admin/Users"
import Vehicles from "@/pages/Private/Admin/Vehicles"
import { LandTickets } from "@/pages/Private/User/LandTickets"
import { ProofDeliveries } from "@/pages/Private/User/ProofDeliveries"
import { Navigate, Route, Routes } from "react-router-dom"

const AdminRoute = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/land-tickets" element={<LandTickets />} />
      <Route path="/dashboard/proof-deliveries" element={<ProofDeliveries />} />
      <Route path="/dashboard/vehicles" element={<Vehicles />} />
      <Route path="/dashboard/users" element={<Users />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AdminRoute