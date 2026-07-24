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
        setError("password must be at least 6 characters long")
        return
    }
    setLoading(true)

    try{
        const res = await axiosInstance.post("/auth/register",formData)
        setSuccess(res.data.message)
        setTimeout(() =>navigate("/login"),1000)
    }catch(err) {
        setError(err.response?.data?.message || "Registration Failed")
    } finally {
        setLoading(false)
    }
}

return (
    <div>
        <h2>Register</h2>
        {error && <p style={{ color:"red"}}>{error}</p>}
        {success && <p style={{ color:"green"}}>{success}</p>}
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
            <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <select name="role" value={formData.role} onChange={handleChange}>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
            </select>
            <button type="submit" disabled={loading}>
                {loading ? "Registering..." :"Register"}
            </button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
)
}
export default Register