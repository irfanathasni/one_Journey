
import StatCard from "../../components/Admin/StatCard";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentActivities: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const res = await getDashboardStats();

      setStats(res.data.data);
      setError("");
    } catch (err) {
      console.error(
        "Dashboard error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={styles.heading}>Platform Overview</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Dashboard Stats */}
      <div style={styles.grid}>
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
        />

        <StatCard
          title="Total Vendors"
          value={loading ? "..." : stats.totalVendors}
        />

        <StatCard
          title="Pending Vendors"
          value={loading ? "..." : stats.pendingVendors}
        />

        <StatCard
          title="Total Bookings"
          value={loading ? "..." : stats.totalBookings}
        />

        <StatCard
          title="Total Revenue"
          value={
            loading
              ? "..."
              : `₹${stats.totalRevenue.toLocaleString("en-IN")}`
          }
        />
      </div>

      {/* Recent Activities */}
      <div style={styles.activity}>
        <h3 style={styles.activityTitle}>
          Recent Activities
        </h3>

        {loading ? (
          <p style={styles.emptyText}>
            Loading activities...
          </p>
        ) : stats.recentActivities.length === 0 ? (
          <p style={styles.emptyText}>
            No recent activities
          </p>
        ) : (
          <div>
            {stats.recentActivities.map(
              (activity, index) => (
                <div
                  key={index}
                  style={styles.activityItem}
                >
                  <div>
                    <strong>
                      {activity.message}
                    </strong>

                    <p style={styles.activityDate}>
                      {new Date(
                        activity.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#2B2B2B",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  activity: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    minHeight: "180px",
  },

  activityTitle: {
    margin: "0 0 10px",
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #eee",
  },

  activityDate: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#999",
  },

  emptyText: {
    color: "#999",
    fontSize: "13px",
  },
};

export default AdminDashboard
