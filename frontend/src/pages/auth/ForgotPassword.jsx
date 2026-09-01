import { useState } from "react"
import { Link } from "react-router-dom"
import { isValidEmail }  from "../../utils/validators"
import { forgotPassword } from "../../services/authService"

const ForgotPassword = () => {
    const [email,setEmail] = useState("")
    const [error,setError] =useState("")
    const [success,setSuccess] = useState("")
    const [loading,setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Submit clicked,email: ",email)
        setError("")
        setSuccess("")

        if(!isValidEmail(email)) {
            setError("Please enter a valid email address")
            return
        }
        setLoading(true)
        try {
        console.log("Calling forgotPassword Api..")
            const res = await forgotPassword(email)
        console.log("Api Response",res)
            setSuccess(res.message)
        }catch(err) {
        console.log("ApI error:",err)
            setError(err.response?.data?.message || "Failed to send reset link")
        }finally {
            setLoading(false)
        }
    }

return (
    <div style={styles.page}>
        <div style={styles.card}>
            <p style={styles.eyebrow}>One Journey</p>
            <h1 style={styles.heading}>Forgot Password</h1>
            <p style={styles.subtext}>Enter Your email and we'll send you a reset link</p>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success&& <div style={styles.successBox}>{success}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    style={styles.input} placeholder=".....@example.com" required />
                </div>
                <button type="Submit" disabled={loading} style={styles.button}>
                    {loading ? "Sending..." :"send reset link"}
                </button>
            </form>
                <p style={styles.footerText}>
                    Remember Your Password? <Link to="/login" style={styles.link}>Log In</Link>
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
    padding: "2.5rem 2rem" },
  eyebrow: { 
    fontFamily: "Georgia, serif", 
    fontSize: "12px", color: "#C97B84", 
    letterSpacing: "2px", 
    textTransform: "uppercase", 
    margin: 0, textAlign: "center" },
    heading: { fontFamily: "Georgia, serif", 
    fontSize: "26px", 
    fontWeight: 400, color: "#2B2B2B", 
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
};

export default ForgotPassword;