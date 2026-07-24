import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated ,role } = useSelector((state) =>state.auth)

    if(!isAuthenticated) return <Navigate to="/login" replace />
    if(allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />

    return <Outlet />
}
export default ProtectedRoute;