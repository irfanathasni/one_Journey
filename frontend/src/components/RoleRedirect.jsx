import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRedirect = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === "customer") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  if (role === "vendor") {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
