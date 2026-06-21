import Login from "@/pages/Public/Login"
import { Navigate, Route, Routes } from "react-router-dom"

const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default PublicRoute