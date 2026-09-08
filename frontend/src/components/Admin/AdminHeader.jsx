const AdminHeader = () => {
  return (
    <div style={styles.header}>
      <h3>Platform Overview</h3>
    </div>
  )
}

const styles = {
  header: {
    background: "#FFFFFF",
    padding: "1rem 2rem",
    borderBottom: "1px solid #E5DFD5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default AdminHeader;