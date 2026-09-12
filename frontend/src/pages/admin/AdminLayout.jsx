import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "../../components/Admin/Sidebar";
import AdminHeader from "../../components/Admin/AdminHeader";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={styles.container}>
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="admin-main" style={styles.main}>
        {/* Mobile Top Bar */}
        <div className="mobile-admin-bar">
          <button
            className="mobile-menu-button"
            onClick={openSidebar}
            aria-label="Open admin menu"
          >
            <Menu size={24} />
          </button>

          <span className="mobile-title">One_Journey Admin</span>
        </div>

        <AdminHeader />

        <div style={styles.content}>
          <Outlet />
        </div>
      </div>

    <style>
  {`
    .admin-main {
      margin-left: 280px;
    }

    .mobile-admin-bar {
      display: none;
    }

    @media (max-width: 768px) {
      .admin-main {
        margin-left: 0;
      }

      .mobile-admin-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 60px;
        padding: 0 16px;
        background: #FFFFFF;
        border-bottom: 1px solid #E5DFD5;
        box-sizing: border-box;
      }

      .mobile-menu-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border: 1px solid #E5DFD5;
        border-radius: 10px;
        background: #FFFFFF;
        color: #2B2B2B;
        cursor: pointer;
      }

      .mobile-title {
        font-family: Georgia, serif;
        font-size: 18px;
        font-weight: 600;
        color: #2B2B2B;
      }
    }
  `}
</style>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#FBF8F3",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  content: {
    padding: "2rem",
  },
};

export default AdminLayout


