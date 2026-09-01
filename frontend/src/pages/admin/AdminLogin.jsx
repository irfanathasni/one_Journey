import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { setCredentials } from "../../features/auth/authSlice";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", formData);

      if (res.data.role !== "admin") {
        setLoading(false);
        return setError("You are not authorized to access the admin panel.");
      }

      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        role: res.data.role,
      }));

      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topAccent} />
        <p style={styles.eyebrow}>One Journey</p>
        <h1 style={styles.heading}>Admin Panel</h1>
        <p style={styles.subtext}>Sign in to manage vendors and platform activity.</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password}
              onChange={handleChange} style={styles.input}
              required />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width:"100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF8F3",
    padding: "1rem",
    boxSizing:"border-box" ,
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "2.5rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "3px",
    background: "#B8935A",
    borderRadius: "0 0 3px 3px",
  },
  eyebrow: {
    fontFamily: "Georgia, serif",
    fontSize: "11px",
    color: "#B8935A",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: "8px 0 0",
    textAlign: "center",
  },
  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "26px",
    fontWeight: 400,
    color: "#2B2B2B",
    textAlign: "center",
    margin: "8px 0 4px",
  },
  subtext: {
    fontSize: "13px",
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
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#2B2B2B", fontWeight: 500 },
  input: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #D8D2C7",
    borderRadius: "6px",
    outline: "none",
    background:"#FFFFFF",
    color:"#2B2B2B"
  },
  button: {
    marginTop: "8px",
    padding: "11px",
    background: "#B8935A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
  },
};

export default AdminLogin;