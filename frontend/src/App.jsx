import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import CustomerDashboard from "./pages/customer/CustomerDashboard"
import VendorDashboard from "./pages/vendor/VendorDashboard"
import VerifyOTP from "./pages/auth/VerifyOTP"
import ResetPassword from "./pages/auth/ResetPassword"
import ForgotPassword from "./pages/auth/ForgotPassword"
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";
import VendorManagement from "./pages/admin/VendorManagement"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminLayout from "./pages/admin/AdminLayout"
import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerWedding from "./pages/customer/CustomerWedding";
import CustomerVendors from "./pages/customer/CustomerVendors";
import VendorDetails from "./pages/customer/VendorDetails";
import VendorBookings from "./pages/vendor/VendorBooking";
import VendorAvailability from "./pages/vendor/VendorAvailability";
import VendorProfile from "./pages/vendor/VendorProfile";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CategoryManagement from "./pages/admin/CategoryManagement";
import { useState ,useEffect } from "react";
import axiosInstance from "./services/axiosInstance";
import { useDispatch } from "react-redux";
import { setCredentials } from "./features/auth/authSlice";
import CustomerProfile from "./pages/customer/Customerprofile";
import CustomerBudget from "./pages/customer/CustomerBudget";
import AdminReports from "./pages/admin/AdminReports"
import VendorWallet from "./pages/vendor/Vendorwallet";
import socket from "./socket/socket";
import { useSelector } from "react-redux";
import CustomerMessages from "./pages/customer/CustomerMessages";
import VendorMessages from "./pages/vendor/VendorMessages";


function App() {
  const [loading,setLoading] = useState(true)
  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth);

 useEffect(() => {
  const refreshAuth = async () => {
    try {
      const res = await axiosInstance.post("/auth/refresh") 
      const { accessToken,role,user } = res.data
      dispatch(
        setCredentials({token: accessToken,role,user}))
    } catch (error) {
      console.log("Refresh token failed -user not logged in ");
    } finally {
      setLoading(false);
    }
  }
  refreshAuth()
}, [dispatch])

useEffect(() => {
  if (!token) return;

  socket.auth = {
    token,
  };

  socket.connect();

  socket.on("connect", () => {
    console.log("Frontend socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", () => {
    console.log("Frontend socket disconnected");
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");
    socket.disconnect();
  };
}, [token]);

if(loading) return <div>Loading...</div>
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={ <ForgotPassword/>} />
      <Route path="/reset-password/:token" element={ <ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route element ={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to= "/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="wedding" element={<CustomerWedding />} />
            <Route path="vendors" element={<CustomerVendors />} />
            <Route path="vendor/:vendorId" element={<VendorDetails />} />
            <Route path="budget" element={<CustomerBudget />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="profile" element={<CustomerProfile />} />
        </Route>
      </Route>

       <Route element ={<ProtectedRoute allowedRoles={["vendor"]} />}>
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/bookings" element={<VendorBookings />} />
        <Route path="/vendor/availability" element={<VendorAvailability />} />
        <Route path="/vendor/profile" element={<VendorProfile />} />
        <Route path="/vendor/messages" element={<VendorMessages />} />
        <Route path="/vendor/wallet" element={<VendorWallet />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="reports" element={<AdminReports />} />
    </Route>
</Route>
    </Routes>
    </BrowserRouter>
  )
}
export default App