import { useEffect, useState } from "react";
import { getMyWedding } from "../../services/weddingService";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  useEffect(() => {
    fetchWedding();
  }, []);

  const fetchWedding = async () => {
    try {
      const res = await getMyWedding();
      setWedding(res.data);
    } catch (error) {
      setWedding(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.max(0,Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading...
      </div>
    )
  }

const daysLeft = (() => {
  if (!wedding?.weddingDate) return 0;

  const weddingDate = new Date(wedding.weddingDate)
  if (isNaN(weddingDate.getTime())) return 0;
  const today = new Date();
  const diff = weddingDate.getTime() - today.getTime();
  return Math.max(
    0,
    Math.ceil(diff / (1000 * 60 * 60 * 24))
  );
})()
if (!wedding) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>ONE JOURNEY</p>

        <h1 style={styles.heading}>
          Start Your Wedding Journey 💍
        </h1>

        <p style={styles.subtext}>
          You haven't created your wedding yet.
          Create your wedding and start planning your big day.
        </p>

        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>💍</div>

          <h2 style={styles.emptyTitle}>
            No wedding created yet
          </h2>

          <p style={styles.emptyText}>
            Create your wedding to start managing
            vendors, budget, timeline and bookings.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/customer/wedding")}>
            Create Wedding →
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Dashboard</p>
          <h1 style={styles.heading}>Welcome back </h1>
          <p style={styles.subtext}>Here's a quick overview of your wedding planning.</p>
        </div>
      </div>
      <div style={styles.countdownCard}>
        <div>
          <p style={styles.smallLabel}>Your big day is coming</p>
          <h2 style={styles.coupleName}>{wedding.brideName} & {wedding.groomName}</h2>
          <p style={styles.date}>
            {new Date(
              wedding.weddingDate
            ).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div style={styles.daysBox}>
          <span style={styles.daysNumber}>{daysLeft}</span>
          <span style={styles.daysText}>days to go</span>
        </div>
      </div>
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>💰</div>
          <div>
            <p style={styles.statLabel}>Total Budget</p>
            <p style={styles.statValue}>₹{(wedding.totalBudget || 0).toLocaleString()} </p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>👥</div>
          <div>
            <p style={styles.statLabel}>Guests </p>
            <p style={styles.statValue}>{wedding.guestCount || 0}</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.cardIcon}>📋</div>
          <div>
            <p style={styles.statLabel}> Wedding Status</p>
            <p style={styles.statusValue}>{wedding.status || "Planning"}</p>
          </div>
        </div>
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Planning Overview</h2>
       <div style={styles.taskGrid}>

     <div style={styles.taskCard} onClick={() => navigate("/customer/vendors")}>
       <span style={styles.taskIcon}>🏪</span>
       <div>
         <h3 style={styles.taskTitle}>Vendors</h3>
         <p style={styles.taskText}>Find and manage your wedding vendors.</p>
       </div>
     </div>

      <div style={styles.taskCard} onClick={() => navigate("/customer/budget")}>
          <span style={styles.taskIcon}>💰</span>
        <div>
          <h3 style={styles.taskTitle}>Budget</h3>
           <p style={styles.taskText}>Keep track of your wedding expenses.</p>
        </div>
       </div>

        <div style={styles.taskCard} onClick={() => navigate("/customer/bookings")}>
           <span style={styles.taskIcon}>📋</span>
           <div>
           <h3 style={styles.taskTitle}>Bookings</h3>
           <p style={styles.taskText}>Manage your vendor bookings.</p>
         </div>
       </div>
      </div>
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

  countdownCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "25px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  smallLabel: {
    color: "#B8935A",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 7px",
  },

  coupleName: {
    fontFamily: "Georgia, serif",
    fontSize: "26px",
    fontWeight: 400,
    color: "#3D5A50",
    margin: 0,
  },

  date: {
    color: "#6B6560",
    fontSize: "14px",
    marginTop: "7px",
  },

  daysBox: {
    textAlign: "center",
    padding: "10px 25px",
    borderLeft: "1px solid #E5DFD5",
  },

  daysNumber: {
    display: "block",
    fontFamily: "Georgia, serif",
    fontSize: "40px",
    color: "#B8935A",
  },

  daysText: {
    fontSize: "13px",
    color: "#6B6560",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "35px",
  },

  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  cardIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#F5E9E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  statLabel: {
    color: "#6B6560",
    fontSize: "12px",
    margin: "0 0 5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  statValue: {
    color: "#3D5A50",
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
  },

  statusValue: {
    color: "#B8935A",
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
    textTransform: "capitalize",
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

  taskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  taskCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "18px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },

  taskIcon: {
    fontSize: "25px",
  },

  taskTitle: {
    margin: "0 0 5px",
    fontSize: "15px",
    color: "#3D5A50",
  },

  taskText: {
    margin: 0,
    fontSize: "13px",
    color: "#6B6560",
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
};

export default CustomerDashboard