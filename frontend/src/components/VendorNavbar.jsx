import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axiosInstance from "../services/axiosInstance";

const VendorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axiosInstance.post("/auth/logout", {
        refreshToken,
      });
    } catch (err) {
      console.log("Logout error", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <header className="vendor-navbar" style={styles.navbar}>      <div style={styles.logo}>One_Journey</div>
      <nav className="vendor-nav-links" style={styles.navLinks}>        <NavLink
          to="/vendor/dashboard"
          style={({ isActive }) =>
            isActive ? styles.activeNav : styles.navLink}>Dashboard
        </NavLink>

        <NavLink to="/vendor/bookings"
          style={({ isActive }) =>
            isActive ? styles.activeNav : styles.navLink}>
          Bookings
        </NavLink>

        <NavLink to="/vendor/availability"
         style={({ isActive}) => 
          isActive ? styles.activeNav :styles.navLink}>
             Availability
        </NavLink>
        
        <NavLink
          to="/vendor/profile"
          style={({ isActive }) =>
            isActive ? styles.activeNav : styles.navLink}>
          My Profile
        </NavLink>

        <NavLink to="/vendor/messages"
          style={({ isActive }) => isActive ? styles.activeNav : styles.navLink
          }>Messages
        </NavLink>

        <NavLink to="/vendor/wallet"
          style={({ isActive }) => 
            isActive ? styles.activeNav : styles.navLink}>
        Wallet
        </NavLink>

          
      </nav>
      <div className="vendor-profile" style={styles.profileSection}>        <div style={styles.avatar}>V</div>
        <div style={styles.profileText}>
          <strong>Vendor</strong>
          <span>Business Account</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E5DFD5",
  },

  logo: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: "600",
    color: "#3D5A50",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  navLink: {
    textDecoration: "none",
    color: "#6B6560",
    fontSize: "14px",
    padding: "8px 0",
  },

  activeNav: {
    textDecoration: "none",
    color: "#3D5A50",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 0",
    borderBottom: "2px solid #3D5A50",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#3D5A50",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },

  profileText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "12px",
  },

  logoutButton: {
    marginLeft: "12px",
    padding: "7px 12px",
    background: "transparent",
    border: "1px solid #C97B84",
    borderRadius: "6px",
    color: "#C97B84",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default VendorNavbar;