import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import VendorDashboard from "./pages/vendor/VendorDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import VerifyOTP from "./pages/auth/VerifyOTP"
import ResetPassword from "./pages/auth/ResetPassword"
import ForgotPassword from "./pages/auth/ForgotPassword"

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={ <ForgotPassword/>} />
      <Route path="/reset-password/:token" element={ <ResetPassword />} />
      <Route element ={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      </Route>

       <Route element ={<ProtectedRoute allowedRoles={["vendor"]} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      </Route>

       <Route element ={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
    </BrowserRouter>
  )
}
export default App;