import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axiosInstance from "../services/axiosInstance";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axiosInstance.post("/auth/logout", { refreshToken });
    } catch (err) {
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 2rem" }}>
      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          background: "transparent",
          color: "#C97B84",
          border: "1px solid #C97B84",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Log out
      </button>
    </div>
  );
};

export default Navbar;