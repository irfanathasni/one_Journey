import { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../services/adminService";

const UserManagement = () =>{
    const [users,setUsers] = useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState("")
    const [search, setSearch] = useState("")
    const [page,setPage] = useState(1)
    const [totalPages,setTotalPages] = useState(1)

useEffect(()=>{
    fetchUsers()
},[page])

const fetchUsers = async () => {
    setLoading(true)

    try{
        const res = await getAllUsers(page,10,search)
        setUsers(Array.isArray(res.data.data) ? res.data.data : []);
        setTotalPages(res.data.totalPages||1)
        setError("")
    }catch(err) {
        setError(err.response?.data?.message || "Failed to load users")
    }finally {
        setLoading(false)
    }
}

const handleStatusChange  = async(userId) => {
    try{
        await updateUserStatus(userId)
        fetchUsers()
    }catch(err) {
        setError(err.response?.data?.message || "Failed to update status")
    }
}
return (
  <div style={styles.container}>
    <div style={styles.header}>
      <div>
        <h2 style={styles.title}>User Management</h2>
        <p style={styles.subtitle}>Manage all registered users</p>
      </div>

    <div style={styles.searchBox}>
        <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
        <button style={styles.searchButton} onClick={() => {setPage(1);fetchUsers()}}> Search</button>
    </div>
    </div>
    {error && (<p style={{ color: "red", marginBottom: "15px" }}>{error}</p>)}
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

       <tbody>
  {loading ? (<tr><td colSpan="5" style={styles.empty}>Loading...</td></tr>
  ) : users.length === 0 ? (
    <tr>
      <td colSpan="5" style={styles.empty}>No users found</td>
    </tr>
  ) : (
    users.map((user) => (
      <tr key={user._id}>
        <td style={styles.td}>{user.name}</td>
        <td style={styles.td}>{user.email}</td>
        <td style={styles.td}>{user.phone || "-"}</td>
        <td>
        <span style={{background: user.isActive ? "#E8F8EE" : "#FDECEC",color: user.isActive ? "#2E7D32" : "#D32F2F",padding: "6px 12px",
            borderRadius: "20px",fontWeight: "600",fontSize: "13px"}}>{user.isActive ? "Active" : "Blocked"}
        </span>
        </td>
        <td>
     <button style={{background: user.isActive ? "#E53935" : "#2E7D32",color: "#fff",
        padding: "8px 18px",border: "none",borderRadius: "8px",cursor: "pointer"}}onClick={() => handleStatusChange(user._id)}>
        {user.isActive ? "Block" : "Unblock"}</button>
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
<div style={styles.pagination}>
    <button disabled={page === 1} onClick={() => setPage(page -1)} style={styles.pageButton}>
        previous
    </button>
    <span style={styles.pageInfo}>Page{page}of {totalPages}</span>
    <button disabled={page === totalPages} onClick={() => setPage(page +1)} style={styles.pageButton}>
        Next
    </button>
</div>
  </div>
)
}
const styles = {
  container: {
    padding: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    color: "#2B2B2B",
    fontFamily: "Georgia, serif",
  },

  subtitle: {
    color: "#777",
    marginTop: "5px",
    fontSize: "14px",
  },
searchBox: {
  display: "flex",
  gap: "10px",
},

searchButton: {
  background: "#B8935A",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: "500",
},
  searchInput: {
    width: "250px",
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
  },
  actionButton: {
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  background: "#B8935A",
  color: "#fff",
  cursor: "pointer",
},

  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#888",
  },
  th: {
  textAlign: "left",
  padding: "16px 20px",
  background: "#FAF7F2",
  color: "#555",
  fontSize: "14px",
  borderBottom: "1px solid #EAEAEA",
},

td: {
  padding: "16px 20px",
  borderBottom: "1px solid #F2F2F2",
  fontSize: "14px",
},
pagination: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginTop: "20px",
},

pageButton: {
  padding: "8px 16px",
  border: "1px solid #D8D2C7",
  borderRadius: "8px",
  background: "#FFFFFF",
  cursor: "pointer",
  color: "#2B2B2B",
},

pageInfo: {
  fontSize: "14px",
  color: "#555",
},
}
export default UserManagement