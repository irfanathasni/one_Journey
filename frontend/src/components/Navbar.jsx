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
    <div className="flex justify-end px-4 py-3 sm:px-6 lg:px-8">
      <button
        onClick={handleLogout}
        className="
          rounded-md
          border border-[#C97B84]
          bg-transparent
          px-4 py-2
          text-xs sm:text-sm
          text-[#C97B84]
          cursor-pointer
          transition-colors
          duration-200
          hover:bg-[#C97B84]
          hover:text-white
        "
      >
        Log out
      </button>
    </div>
  );
};

export default Navbar