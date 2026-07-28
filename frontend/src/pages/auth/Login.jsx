import { useState } from "react"
import { useDispatch  } from  "react-redux"
import { useNavigate ,Link} from "react-router-dom"
import { loginUser } from "../../services/authService"
import { setCredentials } from "../../features/auth/authSlice"
import { isValidEmail, isValidPassword } from "../../utils/validators"
import { GoogleLogin } from "@react-oauth/google"
import axiosInstance from "../../services/axiosInstance"
const Login = () => {
    const [formData,setFormData] = useState({email:"" , password :""})
    const [error, setError] = useState("")
    const [loading,setLoading] = useState(false)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]:e.target.value})
    }
    const redirectByRole = (role) =>{
        if(role ==="customer") navigate("/customer/dashboard")
        else if(role ==="vendor") navigate("/vendor/dashboard")
        else if(role ==="admin") navigate("/admin/dashboard")
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if(!formData.email || !formData.password) {
            setError("All field are required")
            return
        }
        if(!isValidEmail(formData.email)) {
            setError("Plese enter a valid email address")
            return
        }
        if(!isValidPassword(formData.password)) {
            setError("Password must be at least 6 charactors long")
            return
        }
        setLoading(true)
    
        try {
            const data = await loginUser(formData)
            dispatch(setCredentials({
              user:null,
              token:data.accessToken,
              refreshToken:data.refreshToken,
              role:data.role}))
            
            if(data.role === "customer") navigate("/customer/dashboard")
            else if(data.role === "vendor") navigate("/vendor/dashboard")
            else if(data.role === "admin")navigate("/admin/dashboard")
        }catch (err) {
    setError(err.response?.data?.message || "Login failed")
    }finally {
        setLoading(false)
        }
    }
    const handleGoogleSuccess = async (CredentialResponse) => {
        console.log("Google credential received:",CredentialResponse)
        try{
            const res = await axiosInstance.post("/auth/google" ,{idToken:CredentialResponse.credential})
            console.log("Backend response:",res.data)
            dispatch(setCredentials({user:null,token:res.data.accessToken,role:res.data.role}))
            if(res.data.role ==="customer") navigate("/customer/dashboard")
            else if(res.data.role ==="vendor")navigate("/vendor/dashboard")
        }catch(error) {
            setError(error.response?.data?.message || "Google login failed")
        }
    }

   return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>One Journey</p>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.subtext}>Log in to keep planning your wedding.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} style={styles.input}
              required />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
          <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed.")} />
        </div>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF8F3",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "2.5rem 2rem",
  },
  eyebrow: {
    fontFamily: "Georgia, serif",
    fontSize: "12px",
    color: "#C97B84",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: 0,
    textAlign: "center",
  },
  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: 400,
    color: "#2B2B2B",
    textAlign: "center",
    margin: "8px 0 4px",
  },
  subtext: {
    fontSize: "14px",
    color: "#6B6560",
    textAlign: "center",
    margin: "0 0 24px",
  },
  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "6px",
    marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#2B2B2B", fontWeight: 500 },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #D8D2C7",
    borderRadius: "6px",
    outline: "none",
  }, button: {
    marginTop: "8px",
    padding: "11px",
    background: "#3D5A50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
  divider: { display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" },
  dividerLine: { flex: 1, height: "1px", background: "#E5DFD5" },
  dividerText: { fontSize: "12px", color: "#6B6560" },
  footerText: { textAlign: "center", fontSize: "14px", color: "#6B6560", marginTop: "20px" },
  link: { color: "#C97B84", fontWeight: 500, textDecoration: "none" },
}

export default Login
