const StatCard = ({ title ,value}) => {
    return(
        <div style={styles.card}>
        <h4 style={styles.title}>{title}</h4>
        <h2 style={styles.value}>{value}</h2>
        </div>
    )
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #E5DFD5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  title: {
    fontSize: "14px",
    color: "#6B6560",
    marginBottom: "10px",
  },

  value: {
    fontSize: "30px",
    color: "#2B2B2B",
    margin: 0,
  },
}

export default StatCard