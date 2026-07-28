import { useEffect } from "react"
import { useState } from "react"
import { createWedding, getMyWedding } from "../../services/weddingService"

const CustomerDashboard = () => {
    const [wedding,setWedding] = useState(null)
    const [loading,setLoading] = useState(true)
    const [formData,setFormData] = useState({brideName:"",groomName:'',weddingDate:""})
    const [error,setError] = useState("")
    
    useEffect(()=>{
        fetchWedding()
    },[])
    const fetchWedding = async () => {
        try {
            const res = await getMyWedding()
            setWedding(res.data)
        }catch(err) {
            setWedding(null)
        }finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({...formData,[e.target.name]:e.target.value})
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setError("")
        try{
            const res = await createWedding(formData)
            setWedding(res.data)
        }catch(err) {
            setError(err.response?.data?.message || "Failed to create wedding")
        }
    }

    const getDaysLeft = (datastr) =>{
        const diff = new Date(datastr) - new Date()
        return Math.max(0,Math.ceil(diff /(1000 * 60 * 60 * 24)))
    }
    if(loading) return <div style={styles.page}>Loading..</div>

    return (
    <div style={styles.page}>
      {!wedding ? (     
        <div style={styles.card}>
          <p style={styles.eyebrow}>One Journey</p>
          <h1 style={styles.heading}>Create your wedding</h1>
          <p style={styles.subtext}>Let's start planning your special day.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Bride's name</label>
              <input name="brideName" value={formData.brideName} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Groom's name</label>
              <input name="groomName" value={formData.groomName} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Wedding date</label>
              <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} style={styles.input} required />
            </div>
            <button type="submit" style={styles.button}>Create wedding</button>
          </form>
        </div>
      ) : (
         <>
          <div style={styles.hero}>
            <p style={styles.eyebrow}>Your wedding day</p>
            <h1 style={styles.heroHeading}>{wedding.brideName} & {wedding.groomName}</h1>
            <p style={styles.dateText}>
              {new Date(wedding.weddingDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={styles.countdown}>
              {getDaysLeft(wedding.weddingDate)} <span style={styles.countdownLabel}>days to go</span>
            </p>
          </div>

          <div style={styles.grid}>
            {[
              { label: "Budget", value: `₹${wedding.totalBudget.toLocaleString()}`, accent: "#3D5A50" },
              { label: "Guest count", value: `${wedding.guestCount} confirmed`, accent: "#C97B84" },
              { label: "Status", value: wedding.status, accent: "#3D5A50" },
            ].map((item) => (
              <div key={item.label} style={styles.statCard}>
                <p style={styles.statLabel}>{item.label}</p>
                <p style={{ ...styles.statValue, color: item.accent }}>{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
const styles = {
  page: { minHeight: "100vh",
    background: "#FBF8F3",
    padding: "2rem" 
    },
  card: { 
    maxWidth: "400px", 
    margin: "4rem auto",
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "2.5rem 2rem" 
    },
  eyebrow: {
    fontFamily: "Georgia, serif", 
    fontSize: "12px",
    color: "#C97B84",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: 0, textAlign: "center"
    },
  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "26px",
    fontWeight: 400,
    color: "#2B2B2B", 
    textAlign: "center", 
    margin: "8px 0 4px" 
    },
  subtext: {
    fontSize: "14px",
    color: "#6B6560",
    textAlign: "center",
    margin: "0 0 24px" 
    },
  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "6px",
    marginBottom: "16px" 
        },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px" 
    },
  field: { 
    display: "flex",
    flexDirection: "column",
    gap: "6px" 
    },
  label: { 
    fontSize: "13px",
    color: "#2B2B2B", 
    fontWeight: 500 
    },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #D8D2C7", 
    borderRadius: "6px",
    outline: "none" 
    },
  button: {
    marginTop: "8px",
    padding: "11px",
    background: "#3D5A50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer" 
            },
  hero: { 
    textAlign: "center", 
    padding: "3rem 1rem",
    borderBottom: "1px solid #E5DFD5",
    marginBottom: "2rem" 
    },
  heroHeading: {
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    fontWeight: 400, 
    color: "#2B2B2B",
    margin: "8px 0" 
    },
  dateText: {
    fontSize: "16px",
    color: "#6B6560",
    margin: "4px 0" 
    },
  countdown: {
    fontFamily: "Georgia, serif",
    fontSize: "48px",
    fontWeight: 400, 
    color: "#3D5A50",
    margin: "16px 0 0" 
    },
  countdownLabel: {
    fontSize: "18px",
    color: "#6B6560" 
    },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
    gap: "16px",
    maxWidth: "900px",
    margin: "0 auto" 
    },
  statCard: {
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5", 
    borderRadius: "8px",
    padding: "1.25rem"
     },
  statLabel: { 
    fontSize: "13px",
    color: "#6B6560",
    margin: "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
     },
  statValue: {
    fontSize: "20px",
    fontWeight: 500,
    margin: 0
     },
};

export default CustomerDashboard;