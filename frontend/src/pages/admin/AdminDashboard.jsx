import StatCard from "../../components/Admin/StatCard";
import { useEffect, useState } from "react";
import {  getDashboardStats} from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    totalBookings: 0,
    totalRevenue:0,
    monthlyRevenue:[],
    recentActivities :[]
  })

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
      console.error("Dashboard error:",
        err.response?.data || err);

      setError(
        err.response?.data?.message || "Failed to load dashboard")
    } finally {
      setLoading(false);
    }
  };
  const maxMonthlyRevenue = Math.max(1, ...stats.monthlyRevenue.map((m) => m.revenue))

  return (
    <div>
      <h1 style={styles.heading}>Platform Overview</h1>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={styles.grid}>
        <StatCard title="Total Users" value={loading ? "..." : stats.totalUsers} />
        <StatCard title="Total Vendors" value={loading ? "..." : stats.totalVendors} />
        <StatCard title="Pending Vendors" value={loading ? "..." : stats.pendingVendors} />
        <StatCard title="Total Bookings" value={loading ? "..." : stats.totalBookings} />
      </div>

      <div style={styles.chart}>
         <h3 style={{ margin: "0 0 20px" }}>Revenue Trend (Last 6 Months)</h3>
        {loading ? (
          <p style={{ color: "#999", fontSize: "13px" }}>Loading...</p>
        ) : stats.monthlyRevenue.length === 0 ? (
           <p style={{ color: "#999", fontSize: "13px" }}>No revenue data yet.</p>
      ) : (
       <div style={styles.barChart}>
           {stats.monthlyRevenue.map((m, i) => (
          <div key={i} style={styles.barColumn}>
          <div style={styles.barTrack}>
            <div style={{...styles.bar,height: `${Math.max(4, (m.revenue / maxMonthlyRevenue) * 100)}%`}}
              title={`₹${m.revenue.toLocaleString("en-IN")}`}
            />
          </div>
          <span style={styles.barValue}>₹{(m.revenue / 1000).toFixed(1)}k</span>
          <span style={styles.barLabel}>{m.label}</span>
        </div>
      ))}
    </div>
  )}
</div>
<div style={styles.activity}>
  <h3>Recent Activities</h3>

  {stats.recentActivities.length === 0 ? (
    <p>No recent activities</p>
  ) : (
    <div>
      {stats.recentActivities.map((activity, index) => (
        <div
          key={index}
          style={styles.activityItem}
        >
          <div>
            <strong>{activity.message}</strong>

            <p>
              {new Date(activity.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
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
  grid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
    gap:"20px",
    marginBottom:"30px"
  },
  chart:{
    background:"#fff",
  border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
    minHeight: "250px",
  },

  activity: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    minHeight: "180px",
  },
  activityItem: {
  display: "flex",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #eee",
},

activityItem: {
  display: "flex",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #eee",
},
barChart: {
  display: "flex",
  alignItems: "flex-end",
  gap: "14px",
  height: "190px",
},
barColumn: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
},
barTrack: {
  flex: 1,
  width: "100%",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
},
bar: {
  width: "60%",
  background: "#3D5A50",
  borderRadius: "4px 4px 0 0",
  minHeight: "4px",
  transition: "height 0.3s ease",
},
barValue: {
  fontSize: "11px",
  color: "#3D5A50",
  fontWeight: 600,
  marginTop: "6px",
},
barLabel: {
  fontSize: "10px",
  color: "#999",
  marginTop: "2px",
  textAlign: "center",
},
}

export default AdminDashboard;