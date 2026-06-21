import { Home } from "@/pages/Private/User/Home"
import { LandTickets } from "@/pages/Private/User/LandTickets"
import { ProofDeliveries } from "@/pages/Private/User/ProofDeliveries"
import { Navigate, Route, Routes } from "react-router-dom"

const UserRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/land-tickets" element={<LandTickets />} />
      <Route path="/proof-deliveries" element={<ProofDeliveries />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default UserRoute