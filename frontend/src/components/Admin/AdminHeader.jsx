const AdminHeader = () => {
  return (
    <>
      <div className="admin-header" style={styles.header}>
        <h3 style={styles.title}>Platform Overview</h3>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .admin-header {
              padding: 14px 16px !important;
            }

            .admin-header h3 {
              font-size: 18px !important;
            }
          }

          @media (max-width: 480px) {
            .admin-header {
              padding: 12px 14px !important;
            }

            .admin-header h3 {
              font-size: 17px !important;
            }
          }
        `}
      </style>
    </>
  );
};

const styles = {
  header: {
    background: "#FFFFFF",
    padding: "1rem 2rem",
    borderBottom: "1px solid #E5DFD5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },

  title: {
    margin: 0,
    color: "#2B2B2B",
    fontSize: "20px",
    fontWeight: "600",
  },
};

export default AdminHeader;
