import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/Admin/Sidebar";
import AdminHeader from "../../components/Admin/AdminHeader";

const AdminLayout = () => {
  return (
    <div style={styles.container}>
      <AdminSidebar />

      <div style={styles.main}>
        <AdminHeader />

        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
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
  },

  content: {
    padding: "2rem",
  },
};

export default AdminLayout;