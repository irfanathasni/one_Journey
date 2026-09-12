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
    <>
      <div className="admin-dashboard">
        <h1 style={styles.heading}>Platform Overview</h1>

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        {/* Dashboard Stats */}
        <div className="dashboard-stats" style={styles.grid}>
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
                    <div style={styles.activityContent}>
                      <strong style={styles.activityMessage}>
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

      <style>
        {`
          .admin-dashboard {
            width: 100%;
            box-sizing: border-box;
          }

          .dashboard-stats {
            width: 100%;
          }

          @media (max-width: 768px) {
            .dashboard-stats {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 14px !important;
            }
          }

          @media (max-width: 480px) {
            .dashboard-stats {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
          }
        `}
      </style>
    </>
  );
};

const styles = {
  heading: {
    fontSize: "28px",
    margin: "0 0 20px",
    color: "#2B2B2B",
  },

  error: {
    color: "#C0392B",
    marginBottom: "15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  activity: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    minHeight: "180px",
    boxSizing: "border-box",
    width: "100%",
    overflow: "hidden",
  },

  activityTitle: {
    margin: "0 0 10px",
    color: "#2B2B2B",
  },

  activityItem: {
    display: "flex",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #eee",
    width: "100%",
    boxSizing: "border-box",
  },

  activityContent: {
    minWidth: 0,
    width: "100%",
  },

  activityMessage: {
    display: "block",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    color: "#2B2B2B",
  },

  activityDate: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#999",
    overflowWrap: "anywhere",
  },

  emptyText: {
    color: "#999",
    fontSize: "13px",
  },
};

export default AdminDashboard;
