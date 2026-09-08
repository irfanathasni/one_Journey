import { useEffect, useState } from "react";
import { getVendorReports } from "../../services/adminService";

const Reports = () => {
  const [reports, setReports] = useState([]);

  const [filter, setFilter] = useState("month");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports("month");
  }, []);

  const fetchReports = async (selectedFilter = filter) => {
    try {
      setLoading(true);
      setError("");

      let params = {};

      if (selectedFilter === "day") {
        params = {
          period: "day",
        };
      }

      if (selectedFilter === "month") {
        params = {
          period: "month",
        };
      }

      if (selectedFilter === "year") {
        params = {
          period: "year",
        };
      }

      if (selectedFilter === "custom") {
        if (!startDate || !endDate) {
          setError("Please select both start and end dates.");
          setLoading(false);
          return;
        }

        params = {
          startDate,
          endDate,
        };
      }

      const res = await getVendorReports(params);

      setReports(res.data?.reports || []);
    } catch (err) {
      console.error(
        "Vendor reports error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load vendor reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);

    if (value !== "custom") {
      fetchReports(value);
    }
  };

  const handleCustomFilter = () => {
    fetchReports("custom");
  };

  const totalBookings = reports.reduce(
    (total, vendor) => total + (vendor.totalBookings || 0),
    0
  );

  const totalCompleted = reports.reduce(
    (total, vendor) => total + (vendor.completedBookings || 0),
    0
  );

  const totalPayments = reports.reduce(
    (total, vendor) => total + (vendor.totalPayments || 0),
    0
  );

  return (
    <div>
      <h1 style={styles.heading}>Vendor Reports</h1>

      <p style={styles.subheading}>
        Vendor-wise booking and payment performance.
      </p>

    
      <div style={styles.filterCard}>
        <div style={styles.filterButtons}>
          <button onClick={() => handleFilterChange("day")}
            style={{...styles.filterButton,
              ...(filter === "day"
                ? styles.activeFilter
                : {}),
            }}>Day
          </button>

          <button onClick={() => handleFilterChange("month")}
            style={{
              ...styles.filterButton,
              ...(filter === "month"
                ? styles.activeFilter
                : {}),
            }}>Month
          </button>

          <button onClick={() => handleFilterChange("year")}
            style={{
              ...styles.filterButton,
              ...(filter === "year"
                ? styles.activeFilter
                : {}),
            }}>Year
          </button>

          <button
            onClick={() => handleFilterChange("custom")}
            style={{
              ...styles.filterButton,
              ...(filter === "custom"
                ? styles.activeFilter
                : {}),
            }}>Custom Range
          </button>
        </div>

        {filter === "custom" && (
          <div style={styles.customFilter}>
            <div style={styles.dateGroup}>
              <label style={styles.dateLabel}>Start Date</label>

              <input type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput} />
            </div>

            <div style={styles.dateGroup}>
              <label style={styles.dateLabel}>End Date</label>
              <input type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
            </div>

            <button onClick={handleCustomFilter} style={styles.applyButton}>
              Apply
            </button>
          </div>
        )}
      </div>

      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      {/* Summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Total Vendors
          </p>

          <h2 style={styles.summaryValue}>
            {loading ? "..." : reports.length}
          </h2>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Total Bookings
          </p>

          <h2 style={styles.summaryValue}>
            {loading ? "..." : totalBookings}
          </h2>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Completed Events
          </p>

          <h2 style={styles.summaryValue}>
            {loading ? "..." : totalCompleted}
          </h2>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>
            Total Payments
          </p>

          <h2 style={styles.summaryValue}>
            {loading
              ? "..."
              : `₹${totalPayments.toLocaleString("en-IN")}`}
          </h2>
        </div>
      </div>

      {/* Vendor Report Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>
          Vendor Performance
        </h3>

        {loading ? (
          <p style={styles.emptyText}>
            Loading vendor reports...
          </p>
        ) : reports.length === 0 ? (
          <p style={styles.emptyText}>
            No vendor report data available for the
            selected period.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Vendor</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Bookings</th>
                  <th style={styles.th}>Completed</th>
                  <th style={styles.th}>Total Payments</th>
                  <th style={styles.th}>Paid Advance</th>
                  <th style={styles.th}>Final Payments</th>
                  <th style={styles.th}>Completion Rate</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((vendor) => (
                  <tr key={vendor.vendorId}>
                    <td style={styles.td}>
                      <strong>
                        {vendor.businessName}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      {vendor.category || "-"}
                    </td>

                    <td style={styles.td}>
                      {vendor.totalBookings}
                    </td>

                    <td style={styles.td}>
                      {vendor.completedBookings}
                    </td>

                    <td style={styles.td}>
                      ₹
                      {(
                        vendor.totalPayments || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      ₹
                      {(
                        vendor.paidAdvance || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      ₹
                      {(
                        vendor.finalPayments || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={styles.rateBadge}
                      >
                        {vendor.completionRate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

  filterCard: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "20px",
  },

  filterButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  filterButton: {
    padding: "9px 18px",
    border: "1px solid #DDD",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },

  activeFilter: {
    background: "#3D5A50",
    color: "#fff",
    borderColor: "#3D5A50",
  },

  customFilter: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-end",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  dateGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  dateLabel: {
    fontSize: "12px",
    color: "#666",
  },

  dateInput: {
    padding: "9px",
    border: "1px solid #DDD",
    borderRadius: "6px",
    fontSize: "13px",
  },

  applyButton: {
    padding: "9px 20px",
    background: "#3D5A50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  errorText: {
    color: "red",
    fontSize: "13px",
    marginBottom: "15px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",
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
    margin: 0,
  },

  tableCard: {
    background: "#fff",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "20px",
  },

  tableTitle: {
    margin: "0 0 20px",
    fontSize: "16px",
    color: "#2B2B2B",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #E5DFD5",
    fontSize: "12px",
    color: "#666",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #EEE",
    fontSize: "13px",
    color: "#333",
    whiteSpace: "nowrap",
  },

  rateBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "12px",
    background: "#EEF4F1",
    color: "#3D5A50",
    fontSize: "11px",
    fontWeight: 600,
  },

  emptyText: {
    color: "#999",
    fontSize: "13px",
  },
};

export default Reports;
