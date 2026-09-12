const StatCard = ({ title, value }) => {
  return (
    <>
      <div className="stat-card" style={styles.card}>
        <h4 style={styles.title}>{title}</h4>

        <h2 style={styles.value}>
          {value}
        </h2>
      </div>

      <style>
        {`
          @media (max-width: 480px) {
            .stat-card {
              padding: 16px !important;
            }

            .stat-card h4 {
              font-size: 13px !important;
            }

            .stat-card h2 {
              font-size: 26px !important;
              overflow-wrap: anywhere;
              word-break: break-word;
            }
          }
        `}
      </style>
    </>
  );
};

const styles = {
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "20px",
    border: "1px solid #E5DFD5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
  },

  title: {
    fontSize: "14px",
    color: "#6B6560",
    margin: "0 0 10px",
    fontWeight: "600",
  },

  value: {
    fontSize: "30px",
    color: "#2B2B2B",
    margin: 0,
    overflowWrap: "anywhere",
  },
};

export default StatCard;
