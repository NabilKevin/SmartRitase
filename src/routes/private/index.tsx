import { ChangePassword } from "@/pages/Private/User/ChangePassword"
import { Navigate, Route, Routes } from "react-router-dom"

const PrivateRoute = () => {
  return (
    <Routes>
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="*" element={<Navigate to="/change-password" replace />} />
    </Routes>
  )
}

export default PrivateRoute