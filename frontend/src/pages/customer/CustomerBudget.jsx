import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWedding } from "../../services/weddingService";
import { getMyBookings } from "../../services/bookingService";

const CustomerBudget = () => {
  const [wedding, setWedding] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [weddingRes, bookingsRes] = await Promise.all([
        getMyWedding(),
        getMyBookings(),
      ]);

      setWedding(weddingRes.data);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error("Budget fetch error:", error);
      setWedding(null);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!wedding) {
    return (
      <div style={styles.page}>
        <div
          style={styles.emptyCard}
          className="customer-budget-empty-card"
        >
          <div style={styles.emptyIcon}>💰</div>

          <h2 style={styles.emptyTitle}>
            No wedding created yet
          </h2>

          <p style={styles.emptyText}>
            Create your wedding first to start tracking your budget.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/customer/wedding")}
          >
            Create Wedding →
          </button>
        </div>
      </div>
    );
  }

  const approvedBookings = bookings.filter(
    (b) => b.status === "approved"
  );

  const totalCommitted = approvedBookings.reduce(
    (sum, b) => sum + (b.amount || 0),
    0
  );

  const totalAdvancePaid = approvedBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce(
      (sum, b) => sum + (b.advanceAmount || 0),
      0
    );

  const totalRemaining = approvedBookings.reduce(
    (sum, b) => {
      const remaining =
        b.paymentStatus === "paid"
          ? b.amount - b.advanceAmount
          : b.amount;

      return sum + remaining;
    },
    0
  );

  const weddingBudget = wedding.totalBudget || 0;

  const budgetLeftToAllocate = Math.max(
    0,
    weddingBudget - totalCommitted
  );

  const usedPercent =
    weddingBudget > 0
      ? Math.min(
          100,
          Math.round(
            (totalCommitted / weddingBudget) * 100
          )
        )
      : 0;

  return (
    <div
      style={styles.page}
      className="customer-budget-page"
    >
      {/* HEADER */}
      <div
        style={styles.header}
        className="customer-budget-header"
      >
        <p style={styles.eyebrow}>BUDGET</p>

        <h1
          style={styles.heading}
          className="customer-budget-heading"
        >
          Wedding Budget
        </h1>

        <p style={styles.subtext}>
          Track what you've planned to spend and what's
          actually committed.
        </p>
      </div>

      {/* STAT CARDS */}
      <div
        style={styles.grid}
        className="customer-budget-grid"
      >
        <div
          style={styles.statCard}
          className="customer-budget-stat-card"
        >
          <div style={styles.cardIcon}>💰</div>

          <div className="customer-budget-stat-content">
            <p style={styles.statLabel}>
              Total Budget
            </p>

            <p style={styles.statValue}>
              ₹{weddingBudget.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div
          style={styles.statCard}
          className="customer-budget-stat-card"
        >
          <div style={styles.cardIcon}>📌</div>

          <div className="customer-budget-stat-content">
            <p style={styles.statLabel}>
              Committed (Approved Bookings)
            </p>

            <p style={styles.statValue}>
              ₹{totalCommitted.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div
          style={styles.statCard}
          className="customer-budget-stat-card"
        >
          <div style={styles.cardIcon}>✓</div>

          <div className="customer-budget-stat-content">
            <p style={styles.statLabel}>
              Advance Paid
            </p>

            <p
              style={{
                ...styles.statValue,
                color: "#2E7D50",
              }}
            >
              ₹{totalAdvancePaid.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div
          style={styles.statCard}
          className="customer-budget-stat-card"
        >
          <div style={styles.cardIcon}>⏳</div>

          <div className="customer-budget-stat-content">
            <p style={styles.statLabel}>
              Remaining to Pay
            </p>

            <p
              style={{
                ...styles.statValue,
                color: "#B8935A",
              }}
            >
              ₹{totalRemaining.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* APPROVED BOOKINGS */}
      <div
        style={styles.section}
        className="customer-budget-section"
      >
        <h2 style={styles.sectionTitle}>
          Approved Vendor Bookings
        </h2>

        {approvedBookings.length === 0 ? (
          <div
            style={styles.emptyRow}
            className="customer-budget-empty-row"
          >
            No approved bookings yet — your budget will
            populate here once a vendor accepts a request.
          </div>
        ) : (
          <div style={styles.list}>
            {approvedBookings.map((b) => (
              <div
                key={b._id}
                style={styles.row}
                className="customer-budget-row"
              >
                <div
                  style={styles.rowInfo}
                  className="customer-budget-row-info"
                >
                  <strong style={styles.rowTitle}>
                    {b.vendor?.businessName || "Vendor"}
                  </strong>

                  <p style={styles.rowSub}>
                    {b.vendor?.category || ""}
                  </p>
                </div>

                <div
                  style={styles.rowAmounts}
                  className="customer-budget-row-amounts"
                >
                  <span style={styles.rowAmount}>
                    ₹
                    {(b.amount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span
                    style={{
                      ...styles.rowBadge,
                      ...(b.paymentStatus === "paid"
                        ? styles.paidBadge
                        : styles.unpaidBadge),
                    }}
                  >
                    {b.paymentStatus === "paid"
                      ? "Advance Paid"
                      : "Advance Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .customer-budget-page {
            padding: 30px 25px !important;
          }

          .customer-budget-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 768px) {
          .customer-budget-page {
            padding: 28px 20px !important;
          }

          .customer-budget-heading {
            font-size: 29px !important;
          }

          .customer-budget-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 14px !important;
          }

          .customer-budget-stat-card {
            padding: 16px !important;
          }

          .customer-budget-stat-content {
            min-width: 0;
          }

          .customer-budget-stat-card .customer-budget-stat-content p {
            overflow-wrap: anywhere;
          }

          .customer-budget-row {
            padding: 15px 17px !important;
          }

          .customer-budget-row-info {
            min-width: 0;
          }

          .customer-budget-row-info strong,
          .customer-budget-row-info p {
            overflow-wrap: anywhere;
          }

          .customer-budget-row-amounts {
            flex-shrink: 0;
          }
        }

        @media (max-width: 560px) {
          .customer-budget-page {
            padding: 22px 15px !important;
          }

          .customer-budget-header {
            margin-bottom: 22px !important;
          }

          .customer-budget-heading {
            font-size: 27px !important;
          }

          .customer-budget-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .customer-budget-stat-card {
            padding: 16px !important;
          }

          .customer-budget-section {
            margin-top: 5px !important;
          }

          .customer-budget-section h2 {
            font-size: 20px !important;
            line-height: 1.3;
          }

          .customer-budget-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px !important;
          }

          .customer-budget-row-info {
            width: 100%;
          }

          .customer-budget-row-amounts {
            width: 100%;
            align-items: flex-start !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            flex-wrap: wrap;
            gap: 8px !important;
          }

          .customer-budget-row-amounts .customer-budget-row-amount {
            white-space: nowrap;
          }

          .customer-budget-empty-row {
            padding: 22px 17px !important;
            line-height: 1.6;
          }

          .customer-budget-empty-card {
            margin: 35px auto !important;
            padding: 30px 20px !important;
          }
        }

        @media (max-width: 360px) {
          .customer-budget-page {
            padding: 18px 12px !important;
          }

          .customer-budget-heading {
            font-size: 24px !important;
          }

          .customer-budget-stat-card {
            padding: 14px !important;
          }

          .customer-budget-stat-card .customer-budget-stat-content {
            min-width: 0;
          }

          .customer-budget-stat-card .customer-budget-stat-content p {
            font-size: 10px !important;
          }

          .customer-budget-stat-card .customer-budget-stat-content p:last-child {
            font-size: 16px !important;
          }

          .customer-budget-section h2 {
            font-size: 18px !important;
          }

          .customer-budget-row {
            padding: 14px !important;
          }

          .customer-budget-row-amounts {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .customer-budget-empty-card {
            padding: 25px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
    padding: "35px 45px",
    boxSizing: "border-box",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF8F3",
    color: "#6B6560",
  },

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    fontFamily: "Georgia, serif",
    fontSize: "12px",
    color: "#B8935A",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: "0 0 6px",
  },

  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: 400,
    color: "#2B2B2B",
    margin: 0,
  },

  subtext: {
    color: "#6B6560",
    fontSize: "14px",
    marginTop: "8px",
    lineHeight: 1.5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
    boxSizing: "border-box",
    minWidth: 0,
  },

  cardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#F5E9E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  statLabel: {
    color: "#6B6560",
    fontSize: "11px",
    margin: "0 0 5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    lineHeight: 1.4,
  },

  statValue: {
    color: "#3D5A50",
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
    overflowWrap: "anywhere",
  },

  progressCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "22px 25px",
    marginBottom: "30px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#3D5A50",
    marginBottom: "10px",
  },

  progressTrack: {
    height: "8px",
    background: "#EEE8DF",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#B8935A",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },

  progressHint: {
    fontSize: "12px",
    color: "#999",
    marginTop: "10px",
    marginBottom: 0,
  },

  section: {
    marginTop: "10px",
  },

  sectionTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 400,
    color: "#2B2B2B",
    marginBottom: "18px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  row: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    minWidth: 0,
  },

  rowInfo: {
    minWidth: 0,
    maxWidth: "100%",
  },

  rowTitle: {
    color: "#3D5A50",
    fontSize: "15px",
    overflowWrap: "anywhere",
  },

  rowSub: {
    margin: "3px 0 0",
    color: "#999",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  rowAmounts: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "6px",
  },

  rowAmount: {
    fontFamily: "Georgia, serif",
    fontSize: "17px",
    color: "#3D5A50",
    whiteSpace: "nowrap",
  },

  rowBadge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  paidBadge: {
    background: "#E6F3EC",
    color: "#2E7D50",
  },

  unpaidBadge: {
    background: "#FFF4DD",
    color: "#A06A00",
  },

  emptyRow: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    color: "#6B6560",
    fontSize: "14px",
    lineHeight: 1.6,
    boxSizing: "border-box",
  },

  emptyCard: {
    maxWidth: "450px",
    margin: "60px auto",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "40px",
    textAlign: "center",
    boxSizing: "border-box",
    width: "100%",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },

  emptyTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#2B2B2B",
    lineHeight: 1.3,
  },

  emptyText: {
    color: "#6B6560",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  primaryButton: {
    marginTop: "20px",
    padding: "12px 24px",
    background: "#3D5A50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    maxWidth: "100%",
  },
};

export default CustomerBudget;