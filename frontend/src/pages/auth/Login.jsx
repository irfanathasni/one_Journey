import { useState } from "react"
import { useDispatch  } from  "react-redux"
import { useNavigate ,Link} from "react-router-dom"
import { loginUser } from "../../services/authService"
import { setCredentials } from "../../features/auth/authSlice"
import { isValidEmail} from "../../utils/validators"
import { GoogleLogin } from "@react-oauth/google"
import axiosInstance from "../../services/axiosInstance"

const Login = () => {
    const [formData,setFormData] = useState({email:"" , password :""})
    const [error, setError] = useState("")
    const [showRoleModal,setShowRoleModal] = useState(false)
    const [pendingIdToken,setPendingIdToken] = useState(null)
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

    const email = formData.email.trim().toLowerCase()
    const password = formData.password
        
          if(!email || !password) {
            setError("All field are required")
            return
        }
        if(!isValidEmail(email)) {
            setError("Plese enter a valid email address")
            return
        }
       
        setLoading(true)
    
        try {
            const data = await loginUser({email,password})
            dispatch(setCredentials({
              user:data.user,
              token:data.accessToken,
              role:data.role
            }))
          redirectByRole(data.role)
        }catch (err) {
    setError(err.response?.data?.message || "Login failed")
    }finally {
        setLoading(false)
        }
    }
    const handleGoogleSuccess = async (credentialResponse) => {
    try{
        const idToken = credentialResponse.credential
        const res = await axiosInstance.post("/auth/google", { idToken })

        if(res.data.needsRole) {setPendingIdToken(idToken)
            setShowRoleModal(true)
            return
        }

        dispatch(setCredentials({user:res.data.user,token:res.data.accessToken,role:res.data.role}))
        redirectByRole(res.data.role)
    }catch(error) {
        setError(error.response?.data?.message || "Google login failed")
    }
}

const handleRoleSelect = async (role) => {
    try{
        const res = await axiosInstance.post("/auth/google", { idToken: pendingIdToken, role })
        dispatch(setCredentials({user:res.data.user,token:res.data.accessToken,role:res.data.role}))
        setShowRoleModal(false)
        redirectByRole(res.data.role)
    }catch(error) {
        setError(error.response?.data?.message || "Signup failed")
        setShowRoleModal(false)
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
            <input type="email" name="email" placeholder="name@example.com"
              value={formData.email} onChange={handleChange} style={styles.input} required />
          </div>

         <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange}
              style={styles.input} required />
        </div>

        <div style={{ textAlign: "right" }}>
          <Link to="/forgot-password" style={{ fontSize: "13px", color: "#C97B84", textDecoration: "none" }}>Forgot password</Link>
        </div>
      
         <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
           <span style={styles.dividerLine}></span>
          </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed.")} />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
          
        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
      {showRoleModal && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <h2 style={styles.modalTitle}>Welcome! 💍</h2>
      <p style={styles.modalText}>How would you like to continue?</p>
      <div style={styles.modalButtons}>
        <button style={styles.modalRoleBtn} onClick={() => handleRoleSelect("customer")}>
          I'm a Customer<br/><span style={styles.modalRoleSub}>Planning a wedding</span>
        </button>
        <button style={styles.modalRoleBtn} onClick={() => handleRoleSelect("vendor")}>
          I'm a Vendor<br/><span style={styles.modalRoleSub}>Offering services</span>
        </button>
      </div>
    </div>
  </div>
)}
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
  divider: { 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    margin: "20px 0" 
  },
  dividerLine: { 
    flex: 1, 
    height: "1px", 
    background: "#E5DFD5" 
  },
  dividerText: { 
    fontSize: "12px", 
    color: "#6B6560" 
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
  roleToggle: { 
    marginBottom: "14px", 
    textAlign: "center" 
  },
  roleHint: { 
    fontSize: "12px", 
    color: "#6B6560", 
    margin: "0 0 8px" 
  },
  roleButtons: { 
    display: "flex", 
    gap: "8px",
    justifyContent: "center" 
  },
  roleBtn: {
  padding: "8px 18px",
  border: "1px solid #D8D2C7",
  borderRadius: "20px",
  background: "#FFFFFF",
  color: "#6B6560",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
},
roleBtnActive: {
  background: "#3D5A50",
  color: "#FFFFFF",
  border: "1px solid #3D5A50",
},
modalOverlay: {
  position: "fixed", 
  top:0, 
  left:0, 
  right:0, 
  bottom:0,
  background: "rgba(43,43,43,0.5)", 
  display:"flex",
  alignItems:"center", 
  justifyContent:"center", 
  zIndex:1000, padding:"20px",
},
modalCard: {
  background:"#FFFFFF", 
  borderRadius:"14px", 
  padding:"32px",
  maxWidth:"380px", 
  width:"100%", 
  textAlign:"center",
},
modalTitle: { 
  fontFamily:"Georgia, serif", 
  fontSize:"22px", 
  color:"#2B2B2B", 
  margin:"0 0 6px" 
},
modalText: { 
  color:"#6B6560", 
  fontSize:"14px", 
  margin:"0 0 22px" 
},
modalButtons: { 
  display:"flex", 
  flexDirection:"column", 
  gap:"10px" 
},
modalRoleBtn: {
  padding:"14px", 
  border:"1px solid #D8D2C7", 
  borderRadius:"8px",
  background:"#FAF9F7", 
  color:"#3D5A50", 
  fontSize:"14px", 
  fontWeight:600,
  cursor:"pointer", 
  lineHeight:1.6,
},
modalRoleSub: { 
  fontSize:"12px", 
  color:"#6B6560", 
  fontWeight:400 
},
}

export default Login
