import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated ,role } = useSelector((state) =>state.auth)
    
    if(!isAuthenticated) {
        if(allowedRoles?.includes("admin")) {
            return <Navigate to="/admin/login" replace />
        }
        return <Navigate to="/login" replace />
    }
        
    if(allowedRoles && !allowedRoles.includes(role)) {
        if (role ==="admin"){
            return <Navigate to="/admin/dashboard" replace />
        }
        if(role ==="vendor"){
            return <Navigate to="/vendor/dashboard" replace />
        }
        if(role ==="customer") {
            return <Navigate to="/customer/dashboard" replace />
        }
   
         return <Navigate to="/login" replace />
        }
    return <Outlet />
}
export default ProtectedRoute;