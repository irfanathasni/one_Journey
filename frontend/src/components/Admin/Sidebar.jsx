import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  FolderTree,
  ChartColumn,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";

const AdminSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Vendors",
      path: "/admin/vendors",
      icon: <Store size={20} />,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <FolderTree size={20} />,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <ChartColumn size={20} />,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/admin/login";
  };

  const handleMenuClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={onClose}
        />
      )}

     
     <aside
  className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}
  style={styles.sidebar}
>
        {/* Mobile Close Button */}
       <button
  className="sidebar-close-button"
  style={styles.closeButton}
  onClick={onClose}
  aria-label="Close sidebar"
>
          <X size={22} />
        </button>

        <div>
          <h2 style={styles.logo}>
            One_Journey <span style={styles.admin}>Admin</span>
          </h2>

          <p style={styles.subtitle}>Platform Management</p>

          <p style={styles.label}>MANAGEMENT</p>

          <div style={styles.menu}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={handleMenuClick}
                style={({ isActive }) => ({
                  ...styles.link,
                  background: isActive ? "#F7F1E8" : "transparent",
                  color: isActive ? "#B8935A" : "#2B2B2B",
                  borderLeft: isActive
                    ? "4px solid #B8935A"
                    : "4px solid transparent",
                  fontWeight: isActive ? "600" : "500",
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <button
          style={styles.logout}
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Responsive Styles */}
      <style>
  {`
    @media (max-width: 768px) {
      .admin-sidebar {
        transform: translateX(-100%) !important;
      }

      .admin-sidebar-open {
        transform: translateX(0) !important;
      }

      .admin-sidebar .sidebar-close-button {
        display: flex !important;
      }
    }
  `}
</style>
    </>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    background: "#FFFFFF",
    borderRight: "1px solid #E5DFD5",
    padding: "28px 18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100vh",
    height: "100vh",
    boxSizing: "border-box",
    boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: "transform 0.3s ease",
  },

  sidebarOpen: {
    transform: "translateX(0)",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.35)",
    zIndex: 999,
  },

  closeButton: {
    display: "none",
    position: "absolute",
    top: "18px",
    right: "15px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#555",
    padding: "5px",
  },

  logo: {
    fontSize: "28px",
    fontFamily: "Georgia, serif",
    color: "#2B2B2B",
    margin: 0,
  },

  admin: {
    color: "#B8935A",
  },

  subtitle: {
    color: "#8C8C8C",
    fontSize: "13px",
    marginTop: "6px",
    marginBottom: "30px",
  },

  label: {
    fontSize: "12px",
    color: "#999",
    letterSpacing: "1.5px",
    marginBottom: "15px",
    fontWeight: "600",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 15px",
    textDecoration: "none",
    borderRadius: "10px",
    transition: "all .2s ease",
  },

  logout: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#FFF3F3",
    color: "#C0392B",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
};

export default AdminSidebar;