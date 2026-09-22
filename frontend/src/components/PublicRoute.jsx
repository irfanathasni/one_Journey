import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (role === "customer") {
      return <Navigate to="/customer/dashboard" replace />;
    }

    if (role === "vendor") {
      return <Navigate to="/vendor/dashboard" replace />;
    }

    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
