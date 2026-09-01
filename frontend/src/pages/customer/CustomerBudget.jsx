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
      const [weddingRes, bookingsRes] = await Promise.all([getMyWedding(),getMyBookings()])
      setWedding(weddingRes.data);
      setBookings(bookingsRes.data || [])
    } catch (error) {
      console.error("Budget fetch error:",error)
      setWedding(null);
      setBookings([]);
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!wedding) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>💰</div>
          <h2 style={styles.emptyTitle}>No wedding created yet</h2>
          <p style={styles.emptyText}>
            Create your wedding first to start tracking your budget.
          </p>
          <button style={styles.primaryButton} onClick={() => navigate("/customer/wedding")}>Create Wedding →</button>
        </div>
      </div>
    );
  }

  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const totalCommitted = approvedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalAdvancePaid = approvedBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalRemaining = approvedBookings.reduce((sum, b) => {
    const remaining = b.paymentStatus === "paid" ? (b.amount - b.advanceAmount) : b.amount;
    return sum + remaining;
  }, 0);

  const weddingBudget = wedding.totalBudget || 0;
  const budgetLeftToAllocate = Math.max(0, weddingBudget - totalCommitted);
  const usedPercent = weddingBudget > 0 ? Math.min(100, Math.round((totalCommitted / weddingBudget) * 100)) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>BUDGET</p>
        <h1 style={styles.heading}>Wedding Budget</h1>
        <p style={styles.subtext}>Track what you've planned to spend and what's actually committed.</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>💰</div>
          <div>
            <p style={styles.statLabel}>Total Budget</p>
            <p style={styles.statValue}>₹{weddingBudget.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>📌</div>
          <div>
            <p style={styles.statLabel}>Committed (Approved Bookings)</p>
            <p style={styles.statValue}>₹{totalCommitted.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>✓</div>
          <div>
            <p style={styles.statLabel}>Advance Paid</p>
            <p style={{...styles.statValue, color: "#2E7D50"}}>₹{totalAdvancePaid.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>⏳</div>
          <div>
            <p style={styles.statLabel}>Remaining to Pay</p>
            <p style={{...styles.statValue, color: "#B8935A"}}>₹{totalRemaining.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Approved Vendor Bookings</h2>

        {approvedBookings.length === 0 ? (
          <div style={styles.emptyRow}>No approved bookings yet — your budget will populate here once a vendor accepts a request.</div>
        ) : (
          <div style={styles.list}>
            {approvedBookings.map((b) => (
              <div key={b._id} style={styles.row}>
                <div>
                  <strong style={styles.rowTitle}>{b.vendor?.businessName || "Vendor"}</strong>
                  <p style={styles.rowSub}>{b.vendor?.category || ""}</p>
                </div>
                <div style={styles.rowAmounts}>
                  <span style={styles.rowAmount}>₹{(b.amount || 0).toLocaleString("en-IN")}</span>
                  <span style={{...styles.rowBadge, ...(b.paymentStatus === "paid" ? styles.paidBadge : styles.unpaidBadge)}}>
                    {b.paymentStatus === "paid" ? "Advance Paid" : "Advance Pending"}
                  </span>
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
  },

  statValue: {
    color: "#3D5A50",
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
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
  },

  rowTitle: {
    color: "#3D5A50",
    fontSize: "15px",
  },

  rowSub: {
    margin: "3px 0 0",
    color: "#999",
    fontSize: "12px",
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
  },

  rowBadge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "20px",
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
  },

  emptyCard: {
    maxWidth: "450px",
    margin: "60px auto",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "40px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },

  emptyTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#2B2B2B",
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
  },
}

export default CustomerBudget;
