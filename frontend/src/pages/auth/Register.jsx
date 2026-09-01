import { useState } from "react"
import{ useNavigate , Link}  from "react-router-dom"
import  axiosInstance  from "../../services/axiosInstance"
import { isValidEmail, isValidPassword, isValidPhone } from "../../utils/validators"

const Register = () => {
    const [formData,setFormData] = useState({
        name:"",
        email:"",
        phone:"",
        password:"",
        role:"customer"
    })
const [error,setError] = useState("")
const [success,setSuccess] = useState("")
const [loading,setLoading] = useState(false)
const navigate = useNavigate()
const handleChange = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value})
}
const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if(!formData.name ||!formData.email || !formData.phone ||!formData.password) {
        setError("All fields are required.")
        return
    }
    if(!isValidEmail(formData.email)) {
        setError("Please enter a valid email address")
        return
    }
    if(!isValidPhone(formData.phone)){
        setError("Please enter a valid 10-digit phone number")
        return
    }
    if(!isValidPassword(formData.password)) {
        setError("Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character")
        return
    }
    setLoading(true)


    try{
        const res = await axiosInstance.post("/auth/register",formData)
        setSuccess(res.data.message)
        setTimeout(() =>navigate("/verify-otp" ,{ state :{ email :formData.email }}),1500)
    }catch(err) {
        setError(err.response?.data?.message || "Registration Failed")
    } finally {
        setLoading(false)
    }
}

 return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>One Journey</p>
        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subtext}>Start planning your wedding today.</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input name="name" placeholder="Name.." value={formData.name} onChange={handleChange} style={styles.input} required />
          </div>
            <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone</label>
            <input name="phone" placeholder="Your Phone number please.." value={formData.phone} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" placeholder="eg:Password@123" value={formData.password} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>I am a</label>
            <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
              <option value="customer">Customer, planning a wedding</option>
              <option value="vendor">Vendor, offering services</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
         <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
     minHeight: "100vh",
      display: "flex",
       alignItems: "center",
        justifyContent: "center", 
        background: "#FBF8F3",
         padding: "1rem" 
        },
  card: { 
    width: "100%", 
    maxWidth: "420px", 
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
  successBox: {
     background: "#E9F2EC",
      color: "#3D5A50", 
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
  footerText: {
     textAlign: "center", 
     fontSize: "14px", 
     color: "#6B6560",
      marginTop: "20px" 
    },
  link: { 
    color: "#C97B84",
     fontWeight: 500, 
     textDecoration: "none"
     },
}
export default Register