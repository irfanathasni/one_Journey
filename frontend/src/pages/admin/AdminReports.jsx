import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/adminService";

const Reports = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalAdvanceCollected: 0,
    totalBookings: 0,
    monthlyRevenue: [],
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data.data);
      setError("");
    } catch (err) {
      console.error("Reports error:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const maxMonthlyRevenue = Math.max(1, ...stats.monthlyRevenue.map((m) => m.revenue));
  const maxCategoryRevenue = Math.max(1, ...stats.categoryBreakdown.map((c) => c.revenue));
  const totalCategoryRevenue = stats.categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0);

  if (loading) {
    return <p style={styles.emptyText}>Loading reports...</p>;
  }

  return (
    <div>
      <h1 style={styles.heading}>Reports & Analytics</h1>
      <p style={styles.subheading}>Platform-wide revenue and booking performance.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total Revenue</p>
          <h2 style={styles.summaryValue}>₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
          <p style={styles.summaryHint}>From all approved bookings</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Advance Collected</p>
          <h2 style={{ ...styles.summaryValue, color: "#2E7D50" }}>
            ₹{stats.totalAdvanceCollected.toLocaleString("en-IN")}
          </h2>
          <p style={styles.summaryHint}>Payments actually received so far</p>
        </div>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Total Bookings</p>
          <h2 style={styles.summaryValue}>{stats.totalBookings}</h2>
          <p style={styles.summaryHint}>Across all statuses</p>
        </div>
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chart}>
          <h3 style={styles.chartTitle}>Revenue Trend (Last 6 Months)</h3>

          {stats.monthlyRevenue.length === 0 ? (
            <p style={styles.emptyText}>No revenue data yet.</p>
          ) : (
            <div style={styles.barChart}>
              {stats.monthlyRevenue.map((m, i) => (
                <div key={i} style={styles.barColumn}>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.bar,
                        height: `${Math.max(4, (m.revenue / maxMonthlyRevenue) * 100)}%`,
                      }}
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

        <div style={styles.chart}>
          <h3 style={styles.chartTitle}>Revenue by Category</h3>

          {stats.categoryBreakdown.length === 0 ? (
            <p style={styles.emptyText}>No category data yet.</p>
          ) : (
            <div style={styles.categoryList}>
              {stats.categoryBreakdown.map((c, i) => (
                <div key={i} style={styles.categoryRow}>
                  <div style={styles.categoryHeader}>
                    <span style={styles.categoryName}>{c.category}</span>
                    <span style={styles.categoryValue}>
                      ₹{c.revenue.toLocaleString("en-IN")} · {c.count} bookings
                    </span>
                  </div>
                  <div style={styles.categoryTrack}>
                    <div
                      style={{
                        ...styles.categoryFill,
                        width: `${Math.max(4, (c.revenue / maxCategoryRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Category Breakdown Table</h3>

        {stats.categoryBreakdown.length === 0 ? (
          <p style={styles.emptyText}>No data yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Bookings</th>
                <th style={styles.th}>Revenue</th>
                <th style={styles.th}>Share</th>
              </tr>
            </thead>
            <tbody>
              {stats.categoryBreakdown.map((c, i) => (
                <tr key={i}>
                  <td style={styles.td}>{c.category}</td>
                  <td style={styles.td}>{c.count}</td>
                  <td style={styles.td}>₹{c.revenue.toLocaleString("en-IN")}</td>
                  <td style={styles.td}>
                    {totalCategoryRevenue > 0
                      ? `${Math.round((c.revenue / totalCategoryRevenue) * 100)}%`
                      : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  heading: {
    fontSize: "28px",
    marginBottom: "6px",
    color: "#2B2B2B",
  },
  subheading: {
    color: "#8C8C8C",
    fontSize: "14px",
    marginBottom: "24px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px",
  },
  summaryValue: {
    fontSize: "24px",
    color: "#2B2B2B",
    margin: "0 0 4px",
  },
  summaryHint: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  chart: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    minHeight: "280px",
    boxSizing: "border-box",
  },
  chartTitle: {
    margin: "0 0 20px",
    fontSize: "16px",
    color: "#2B2B2B",
  },
  emptyText: {
    color: "#999",
    fontSize: "13px",
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
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  categoryRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  categoryName: {
    color: "#2B2B2B",
    fontWeight: 600,
  },
  categoryValue: {
    color: "#999",
  },
  categoryTrack: {
    height: "8px",
    background: "#F0EDE6",
    borderRadius: "10px",
    overflow: "hidden",
  },
  categoryFill: {
    height: "100%",
    background: "#B8935A",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #E5DFD5",
    color: "#999",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #EEE",
    color: "#2B2B2B",
  },
};

export default Reports;
