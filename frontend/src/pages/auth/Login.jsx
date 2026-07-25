import { useState } from "react"
import { useDispatch  } from  "react-redux"
import { useNavigate } from "react-router-dom"
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
            dispatch(setCredentials({user:null,token:data.token,role:data.role}))
            
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
        try{
            const res = await axiosInstance.post("/auth/google" ,{idToken:CredentialResponse.credential})
            dispatch(setCredentials({user:null,token:res.data.accessToken,role:res.data.role}))
            if(res.data.role ==="customer") navigate("/customer/dashboard")
            else if(res.data.role ==="vendor")navigate("/vendor/dashboard")
        }catch(error) {
            setError(err.response?.data?.message || "Google login failed")
        }
    }

    return(
        <div>
            <h2>Login</h2>
            {error &&<p style={{color :"red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="password" value={formData.password} onChange={handleChange} required />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in.." : "Login"}
                </button>
            </form>
        <div style={{marginTop:"16px"}}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google Login Failed")}
        />
        </div>
    </div>
    )
}
export default Login