import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { getAllVendors, approveVendor, rejectVendor } from "../../services/adminService";

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendors();
  }, [filter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getAllVendors(filter);
      setVendors(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      await approveVendor(vendorId);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve vendor.");
    }
  };

  const handleReject = async (vendorId) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectVendor(vendorId, reason);
      fetchVendors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject vendor.");
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.hero}>
        <p style={styles.eyebrow}>One Journey — Admin</p>
        <h1 style={styles.heading}>Vendor Management</h1>
        <p style={styles.subtext}>Review and manage vendor applications.</p>
      </div>

      <div style={styles.filterBar}>
        {["", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              ...styles.filterButton,
              background: filter === s ? "#B8935A" : "#FFFFFF",
              color: filter === s ? "#FFFFFF" : "#2B2B2B",
            }}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : vendors.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6B6560" }}>No vendors found.</p>
      ) : (
        <div style={styles.grid}>
          {vendors.map((vendor) => (
            <div key={vendor._id} style={styles.card}>
              <p style={styles.businessName}>{vendor.businessName}</p>
              <p style={styles.category}>{vendor.category}</p>
              <p style={styles.ownerInfo}>{vendor.user?.name} — {vendor.user?.email}</p>

              <p style={{
                ...styles.statusBadge,
                color: vendor.verificationStatus === "approved" ? "#3D5A50" :
                       vendor.verificationStatus === "rejected" ? "#A33B3B" : "#B8935A",
              }}>
                {vendor.verificationStatus}
              </p>

              {vendor.verificationStatus === "rejected" && vendor.rejectionReason && (
                <p style={styles.rejectionReason}>Reason: {vendor.rejectionReason}</p>
              )}

              {vendor.verificationStatus === "pending" && (
                <div style={styles.actions}>
                  <button onClick={() => handleApprove(vendor._id)} style={styles.approveButton}>
                    Approve
                  </button>
                  <button onClick={() => handleReject(vendor._id)} style={styles.rejectButton}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh", 
    width: "100%", 
    background: "#FBF8F3", 
    padding: "2rem", 
    boxSizing: "border-box" 
   },
  hero: { 
   textAlign: "center", 
   padding: "2rem 1rem", 
   borderBottom: "1px solid #E5DFD5", 
   marginBottom: "1.5rem" 
   },
  eyebrow: { 
   fontFamily: "Georgia, serif", 
   fontSize: "12px", 
   color: "#B8935A", 
   letterSpacing: "2px", 
   textTransform: "uppercase", 
   margin: 0 
   },
  heading: { 
   fontFamily: "Georgia, serif", 
   fontSize: "30px", 
   fontWeight: 400, 
   color: "#2B2B2B", 
   margin: "8px 0 4px" 
   },
  subtext: {
    fontSize: "14px", 
    color: "#6B6560", 
    margin: 0 
   },
  filterBar: {
    display: "flex", 
    justifyContent: "center",
    gap: "10px", 
    marginBottom: "1.5rem" 
   },
  filterButton: {
    padding: "8px 16px", 
    border: "1px solid #D8D2C7", 
    borderRadius: "20px", 
    fontSize: "13px", 
    cursor: "pointer" 
   },
  errorBox: {
    background: "#FBEAEA", 
    color: "#A33B3B", 
    fontSize: "13px", 
    padding: "10px 14px", 
    borderRadius: "6px", 
    maxWidth: "500px", 
    margin: "0 auto 16px" 
   },
  grid: { 
   display: "grid", 
   gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
   gap: "16px", 
   maxWidth: "1000px", 
   margin: "0 auto" 
   },
  card: {
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5", 
    borderRadius: "8px", 
    padding: "1.25rem" 
   },
  businessName: {
    fontSize: "17px", 
    fontWeight: 600, 
    color: "#2B2B2B",
    margin: "0 0 4px" 
   },
  category: {
    fontSize: "13px", 
    color: "#6B6560", 
    margin: "0 0 8px" 
   },
  ownerInfo: {
   fontSize: "13px", 
   color: "#6B6560", 
   margin: "0 0 10px" 
   },
  statusBadge: { 
   fontSize: "13px", 
   fontWeight: 600, 
   textTransform: "uppercase", 
   margin: "0 0 8px" 
   },
  rejectionReason: { 
   fontSize: "13px", 
   color: "#A33B3B", 
   marginBottom: "10px" 
   },
  actions: { 
   display: "flex", 
   gap: "8px", 
   marginTop: "12px" 
   },
  approveButton: { 
   flex: 1, 
   padding: "8px", 
   background: "#3D5A50", 
   color: "#FFFFFF", 
   border: "none", 
   borderRadius: "6px", 
   cursor: "pointer", 
   fontSize: "13px" 
   },
  rejectButton: { 
   flex: 1, 
   padding: "8px", 
   background: "transparent", 
   color: "#A33B3B", 
   border: "1px solid #A33B3B", 
   borderRadius: "6px", 
   cursor: "pointer", 
   fontSize: "13px" 
},
};

export default AdminDashboard;