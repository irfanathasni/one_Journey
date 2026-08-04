import  { useState }  from "react"
import  { createVendorProfile, getMyVendorProfile } from "../../services/vendorService"
import { useEffect } from "react"
import Navbar from "../../components/Navbar";
import { VENDOR_STATUS } from "../../constants/vendorStatus";

const VendorDashboard =() =>{
  const [vendor,setVendor] = useState(null)
  const[loading,setLoading] = useState(true)
  const [formData,setFormData] = useState({businessName:"",category:"",description:""})
  const [error,setError] = useState("")
  const [showReapplyForm,setShowReapplyForm] = useState(false)

  useEffect(()=> {
    fetchProfile()
  },[])

  const fetchProfile = async () => {
    try{
      const res = await getMyVendorProfile()
      setVendor(res.data)
    }catch(err){
      setVendor(null)
    }finally{
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData,[e.target.name]:e.target.value})
  }
  const handleCreate = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await createVendorProfile(formData)
      setVendor(res.data)
      setShowReapplyForm(false)
    }catch(err) {
      setError(err.response?.data?.message || "Failed to Submit")
    }
  }
  if(loading) return <div style={styles.page}>Loading..</div>
    return (
    <div style={styles.page}>
      <Navbar />
    {!vendor ? (
      <div style={styles.card}>
      </div>
      ) : (
        <>
        <div style={styles.hero}>
          <p style={styles.eyebrow}>Vendor Dashboard</p>
          <h1 style={styles.heading}>{vendor.businessName}</h1>
          <p style={styles.subtext}>{vendor.category}</p>
        </div>

      <div style={styles.grid}>
        <div style={styles.statCard}>
        <p style={styles.statLabel}>Verification status</p>
        <p style={{...styles.statValue, color: vendor.verificationStatus === VENDOR_STATUS.APPROVED ? "#3D5A50" :
                    vendor.verificationStatus === VENDOR_STATUS.REJECTED ? "#A33B3B" : "#C97B84"}}>
                {   vendor.verificationStatus === VENDOR_STATUS.APPROVED ? "Approved" :
                    vendor.verificationStatus === VENDOR_STATUS.REJECTED ? "Rejected" : "Pending review"}
        </p>

              {vendor.verificationStatus === VENDOR_STATUS.REJECTED && vendor.rejectionReason && (
                <p style={{ fontSize: "13px", color: "#A33B3B", marginTop: "6px" }}>
                  Reason: {vendor.rejectionReason}
                </p>
              )}
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Account status</p>
              <p style={{ ...styles.statValue, color: "#3D5A50" }}>{vendor.status}</p>
            </div>
          </div>
           {vendor.verificationStatus === VENDOR_STATUS.REJECTED && (
            <div style={{ maxWidth: "420px", margin: "2rem auto" }}>
              {!showReapplyForm ? (
                <button onClick={() => {setFormData({
                      businessName: vendor.businessName,
                      category: vendor.category,
                      description: vendor.description || "",
                    })
                    setShowReapplyForm(true);
                  }}
                  style={styles.button}>Update and reapply</button>
              ) : (
        <div style={styles.card}>
          <h2 style={styles.heading}>Update your profile</h2>
          {error && <div style={styles.errorBox}>{error}</div>}
    <form onSubmit={handleCreate} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Business name</label>
           <input name="businessName" value={formData.businessName} onChange={handleChange} style={styles.input} required />
        </div>
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} style={styles.input}>
              <option value="Photography">Photography</option>
              <option value="EventManagement">Event Management</option>
              <option value="Catering">Catering</option>
              <option value="WeddingHall">Wedding Hall</option>
              <option value="BridalMakeup">Bridal Makeup</option>
              <option value="PreMarriageCounselling">Pre-Marriage Counselling</option>
            </select>
          </div>
        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <input name="description" value={formData.description} onChange={handleChange} style={styles.input} />
        </div>
          <button type="submit" style={styles.button}>Resubmit for review</button>
    </form>
        </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
const styles = {
  page: { 
    minHeight: "100vh",
    background: "#FBF8F3",
    padding: "2rem"
    },
  card: { 
    maxWidth: "420px",
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
    margin: 0,
    textAlign: "center" 
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
     padding: "2.5rem 1rem", 
     borderBottom: "1px solid #E5DFD5", 
     marginBottom: "2rem" 
    },
  grid: {
     display: "grid", 
     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px", 
    maxWidth: "700px", 
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

export default VendorDashboard;