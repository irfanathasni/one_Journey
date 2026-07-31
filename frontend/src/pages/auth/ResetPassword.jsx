import { useState }from "react"
import{ useParams, useNavigate }from "react-router-dom"
import { isValidPassword } from "../../utils/validators"
import { resetPassword } from "../../services/authService"
import { Link } from "react-router-dom"
const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [ password , setPassword ] = useState("")
    const [confirmPassword , setConfirmPassword] = useState("")
    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")
    const [loading,setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if(!isValidPassword) {
            setError("Password must be at least 6 charactor long")
            return
        }

        if(password !== confirmPassword ) {
            setError("Password do not match")
            return
        }
    setLoading(true)
    try {
        const res = await resetPassword(token,password)
        setSuccess(res.message)
        setTimeout(() => navigate("/login"),1500)
        }catch(err) {
            setError(err.response?.data?.message || "Failed to reset password")
        }finally {
            setLoading(false)
        }
    }
return (
      <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>One Journey</p>
        <h1 style={styles.heading}>Reset password</h1>
        <p style={styles.subtext}>Enter your new password below.</p>
     {error && <div style={styles.errorBox}>{error}</div>}
    {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
         <div style={styles.field}>
            <label style={styles.label}>New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={styles.input} placeholder="At least 6 characters" required/>
          </div>
           <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input} required />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
         <p style={styles.footerText}>
          Remember your password? <Link to="/login" style={styles.link}>Log in</Link>
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
    maxWidth: "400px", 
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
export default ResetPassword