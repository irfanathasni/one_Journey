import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";

const CustomerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate

  const menuItems = [
    {label: "Dashboard",path: "/customer/dashboard",icon: "⌂"},
    { label: "My Wedding", path: "/customer/wedding", icon: "💍" },
    {label: "Vendors",path: "/customer/vendors",icon: "🏪"},
    {label: "Budget",path: "/customer/budget",icon: "💰"},
    {label: "Bookings",path: "/customer/bookings",icon: "📋"},
    {label:"Messages",path:"/customer/messages",icon:"💬"}
  ]
  const handleLogout = async () => {
    try{
      await axiosInstance.post("/auth/logout")
    }catch(err){
      console.log("Logout error:",err)
    }
    dispatch(logout());
    navigate("/login")
  }

  return (
    <div style={styles.layout}>
      <aside className="customer-sidebar" style={styles.sidebar}>
          <div style={styles.logoSection}>
          <h2 style={styles.logo}>One Journey</h2>
          <p style={styles.logoSubtext}>Wedding Planner</p>
        </div>
          <nav className="customer-menu" style={styles.menu}>   
                   {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({...styles.menuItem,...(isActive ? styles.activeMenuItem : {}),})}>
              <span style={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={styles.bottomSection}>

          <NavLink to="/customer/profile" style={({ isActive }) => ({
              ...styles.menuItem, ...(isActive ? styles.activeMenuItem : {}),
            })}>
            <span style={styles.icon}>⚙️</span>
            <span>Profile</span>
          </NavLink>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <span style={styles.icon}>↪</span>
            <span>Logout</span>
          </button>

        </div>

      </aside> 
        <main className="customer-main" style={styles.mainContent}>
          <Outlet />
      </main>

    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#FBF8F3",
  },

  sidebar: {
    width: "250px",
    background: "#FFFFFF",
    borderRight: "1px solid #E5DFD5",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  logoSection: {
    padding: "10px 14px 30px",
    borderBottom: "1px solid #E5DFD5",
    marginBottom: "25px",
  },

  logo: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "25px",
    fontWeight: "400",
    color: "#3D5A50",
  },

  logoSubtext: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#C97B84",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#6B6560",
    fontSize: "14px",
    transition: "0.2s",
  },

  activeMenuItem: {
    background: "#F5E9E8",
    color: "#3D5A50",
    fontWeight: "600",
  },

  icon: {
    width: "22px",
    fontSize: "17px",
    textAlign: "center",
  },

  bottomSection: {
    marginTop: "auto",
    borderTop: "1px solid #E5DFD5",
    paddingTop: "15px",
  },

  logoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px 14px",
    marginTop: "6px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#A33B3B",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
  },

  mainContent: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
};

export default CustomerLayout;