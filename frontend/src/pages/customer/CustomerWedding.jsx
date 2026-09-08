import { useEffect, useState } from "react";
import { getMyWedding,createWedding } from "../../services/weddingService";

const CustomerWedding = () => {
  const [wedding, setWedding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData,setFormData] = useState({
    brideName:"",
    groomName:"",
    weddingDate:""
    ,venue:"",
    location:"",
    guestCount:"",
    totalBudget:""})
    const[error,setError] = useState("")
    const[creating,setCreating] = useState(false)

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

  const handleChange = (e) => {
  setFormData({...formData,[e.target.name]: e.target.value});
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setCreating(true);

  try {
    const res = await createWedding({
      brideName: formData.brideName,
      groomName: formData.groomName,
      weddingDate: formData.weddingDate,
      venue: formData.venue,
      location: formData.location,
      guestCount: Number(formData.guestCount) || 0,
      totalBudget: Number(formData.totalBudget) || 0,
    });

    setWedding(res.data);
  } catch (error) {
    console.error("Create wedding error:", error.response?.data || error);

    setError(
      error.response?.data?.message ||
      "Failed to create wedding"
    );
  } finally {
    setCreating(false);
  }
};

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }
if (!wedding) {
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>ONE JOURNEY</p>

        <h1 style={styles.title}>
          Create Your Wedding 💍
        </h1>

        <p style={styles.subtitle}>
          Tell us about your big day and start your wedding journey.
        </p>
      </div>

      <div style={styles.card}>
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Bride Name</label>

            <input type="text" name="brideName"
              value={formData.brideName}
              onChange={handleChange}
              placeholder="Enter bride name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Groom Name</label>

            <input
              type="text"
              name="groomName"
              value={formData.groomName}
              onChange={handleChange}
              placeholder="Enter groom name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Wedding Date</label>

            <input
              type="date"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Venue</label>

            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Enter wedding venue"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Location</label>
             <input type="text" name="location" value={formData.location}
               onChange={handleChange} placeholder="Enter wedding location"
              style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Guest Count</label>
            <input type="number" name="guestCount" value={formData.guestCount}
              onChange={handleChange} placeholder="Number of guests" style={styles.input}
              min="0" />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Total Budget</label>
            <input type="number" name="totalBudget" value={formData.totalBudget}
              onChange={handleChange} placeholder="Enter total budget" style={styles.input}
              min="0" />
          </div>

          <button type="submit" style={styles.primaryButton} disabled={creating}>
            {creating
              ? "Creating Wedding..."
              : "Create Wedding →"}
          </button>

        </form>
      </div>
    </div>
  );
}

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>One Journey</p>
        <h1 style={styles.title}>My Wedding</h1>
        <p style={styles.subtitle}>
          Everything about your special day in one place.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.names}>
          <h2 style={styles.namesTitle}> 
            {wedding.brideName} & {wedding.groomName}
          </h2>

          <span style={styles.status}>
            {wedding.status}
          </span>
        </div>

        <div style={styles.details}>
          <div style={styles.detailItem}>
            <span style={styles.label}>Wedding Date</span>
            <strong>
              {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.label}>Venue</span>
            <strong>{wedding.venue || "Not added yet"}</strong>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.label}>Location</span>
           <strong>{wedding.location || "Not added yet"}</strong>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.label}>Guest Count</span>
            <strong>{wedding.guestCount || 0}</strong>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.label}>Total Budget</span>
            <strong>
              ₹{(wedding.totalBudget || 0).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "40px",
    minHeight: "100vh",
    background: "#FBF8F3",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: "30px",
  },

  eyebrow: {
    margin: 0,
    fontSize: "12px",
    color: "#B8935A",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },

  title: {
    margin: "8px 0",
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: 400,
    color: "#2B2B2B",
  },

  subtitle: {
    margin: 0,
    color: "#6B6560",
    fontSize: "14px",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "28px",
    maxWidth: "900px",
  },
  names: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E5DFD5",
    paddingBottom: "20px",
    marginBottom: "25px",
  },

  namesTitle: {
  margin: 0,
  fontFamily: "Georgia, serif",
  fontSize: "26px",
  fontWeight: 400,
  color: "#3D5A50",
},

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#F5E9E8",
    color: "#3D5A50",
    fontSize: "12px",
    textTransform: "capitalize",
  },

  details: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "18px",
    background: "#FBF8F3",
    borderRadius: "8px",
  },

  label: {
    fontSize: "12px",
    color: "#8A837B",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  loading: {
    padding: "40px",
    color: "#6B6560",
  },

  empty: {
    padding: "60px 40px",
    textAlign: "center",
    color: "#6B6560",
  },
  form: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "18px",
},

field: {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
},

input: {
  padding: "11px 12px",
  border: "1px solid #D8D2C7",
  borderRadius: "7px",
  fontSize: "14px",
  outline: "none",
  background: "#FFFFFF",
},

primaryButton: {
  gridColumn: "1 / -1",
  padding: "12px 18px",
  background: "#3D5A50",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "7px",
  fontSize: "14px",
  cursor: "pointer",
},

errorBox: {
  background: "#FBEAEA",
  color: "#A33B3B",
  padding: "10px 14px",
  borderRadius: "7px",
  marginBottom: "18px",
  fontSize: "13px",
},
};

export default CustomerWedding