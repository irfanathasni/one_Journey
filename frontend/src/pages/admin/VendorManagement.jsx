import { useEffect, useState } from "react";
import {
  getAllVendors,
  approveVendor,
  rejectVendor,
  updateVendorStatus,
} from "../../services/adminService";

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchVendors();
  }, [page, filter]);

  const fetchVendors = async () => {
    setLoading(true);

    try {
      const res = await getAllVendors(
        page,
        10,
        search,
        filter
      );

      console.log("VENDOR RESPONSE:", res);

      setVendors(
        Array.isArray(res.data) ? res.data : []
      );

      setTotalPages(res.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Vendor fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load vendors"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchVendors();
  };

  const handleStatusChange = async (
    vendorId,
    currentStatus
  ) => {
    try {
      const newStatus =
        currentStatus === "active"
          ? "blocked"
          : "active";

      await updateVendorStatus(
        vendorId,
        newStatus
      );

      fetchVendors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update vendor status"
      );
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      await approveVendor(vendorId);
      fetchVendors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to approve vendor"
      );
    }
  };

  const openRejectModal = (vendorId) => {
    setSelectedVendorId(vendorId);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      await rejectVendor(
        selectedVendorId,
        rejectionReason.trim()
      );

      setShowRejectModal(false);
      setSelectedVendorId(null);
      setRejectionReason("");

      await fetchVendors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reject vendor"
      );
    }
  };

  return (
    <>
      <div
        className="vendor-management"
        style={styles.container}
      >
        {/* Header */}
        <div
          className="vendor-header"
          style={styles.header}
        >
          <div>
            <h2 style={styles.title}>
              Vendor Management
            </h2>

            <p style={styles.subtitle}>
              Manage all registered vendors
            </p>
          </div>

          {/* Search */}
          <div
            className="vendor-search"
            style={styles.searchBox}
          >
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={styles.searchInput}
            />

            <button
              style={styles.searchButton}
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter */}
        <div
          className="vendor-filter-bar"
          style={styles.filterBar}
        >
          {[
            "",
            "pending",
            "approved",
            "rejected",
          ].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              style={{
                ...styles.filterButton,
                background:
                  filter === status
                    ? "#B8935A"
                    : "#FFFFFF",
                color:
                  filter === status
                    ? "#FFFFFF"
                    : "#2B2B2B",
              }}
            >
              {status === ""
                ? "All"
                : status.charAt(0).toUpperCase() +
                  status.slice(1)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        {/* Table */}
        <div
          className="vendor-table-container"
          style={styles.tableContainer}
        >
          <p style={styles.count}>
            Vendors count: {vendors.length}
          </p>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Business</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>
                  Verification
                </th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={styles.empty}
                  >
                    Loading...
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={styles.empty}
                  >
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td style={styles.td}>
                      {vendor.businessName}
                    </td>

                    <td style={styles.td}>
                      {vendor.user?.name || "-"}
                    </td>

                    <td style={styles.td}>
                      {vendor.user?.email || "-"}
                    </td>

                    <td style={styles.td}>
                      {vendor.category}
                    </td>

                    {/* Verification */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            vendor.verificationStatus ===
                            "approved"
                              ? "#E8F8EE"
                              : vendor.verificationStatus ===
                                "rejected"
                              ? "#FDECEC"
                              : "#FFF4DD",

                          color:
                            vendor.verificationStatus ===
                            "approved"
                              ? "#2E7D32"
                              : vendor.verificationStatus ===
                                "rejected"
                              ? "#D32F2F"
                              : "#B8935A",
                        }}
                      >
                        {vendor.verificationStatus}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            vendor.status === "active"
                              ? "#E8F8EE"
                              : "#FDECEC",

                          color:
                            vendor.status === "active"
                              ? "#2E7D32"
                              : "#D32F2F",
                        }}
                      >
                        {vendor.status === "active"
                          ? "Active"
                          : "Blocked"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {vendor.verificationStatus ===
                          "pending" && (
                          <>
                            <button
                              style={
                                styles.approveButton
                              }
                              onClick={() =>
                                handleApprove(
                                  vendor._id
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              style={
                                styles.rejectButton
                              }
                              onClick={() =>
                                openRejectModal(
                                  vendor._id
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          style={{
                            ...styles.statusButton,
                            background:
                              vendor.status === "active"
                                ? "#E53935"
                                : "#2E7D32",
                          }}
                          onClick={() =>
                            handleStatusChange(
                              vendor._id,
                              vendor.status
                            )
                          }
                        >
                          {vendor.status === "active"
                            ? "Block"
                            : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="vendor-pagination"
          style={styles.pagination}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{
              ...styles.pageButton,
              opacity: page === 1 ? 0.5 : 1,
              cursor:
                page === 1
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Previous
          </button>

          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{
              ...styles.pageButton,
              opacity:
                page === totalPages ? 0.5 : 1,
              cursor:
                page === totalPages
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div
            className="vendor-reject-modal"
            style={styles.modal}
          >
            <h2 style={styles.modalTitle}>
              Reject Vendor
            </h2>

            <p style={styles.modalText}>
              Please provide a reason for rejecting
              this vendor.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(e.target.value)
              }
              placeholder="Enter rejection reason..."
              rows="5"
              style={styles.modalTextarea}
            />

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedVendorId(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.confirmRejectButton}
                onClick={handleReject}
              >
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style>
        {`
          .vendor-management {
            width: 100%;
            box-sizing: border-box;
          }

          .vendor-table-container {
            width: 100%;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }

          .vendor-table-container table {
            min-width: 1000px;
          }

          @media (max-width: 768px) {
            .vendor-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 18px;
            }

            .vendor-search {
              width: 100%;
            }

            .vendor-search input {
              flex: 1;
              width: auto !important;
              min-width: 0;
            }

            .vendor-search button {
              flex-shrink: 0;
            }

            .vendor-filter-bar {
              flex-wrap: wrap !important;
              gap: 8px !important;
            }

            .vendor-table-container {
              border-radius: 10px;
            }

            .vendor-pagination {
              gap: 12px !important;
              flex-wrap: wrap;
            }

            .vendor-reject-modal {
              width: calc(100% - 32px) !important;
              max-width: 450px;
              box-sizing: border-box;
            }
          }

          @media (max-width: 480px) {
            .vendor-management {
              padding: 12px !important;
            }

            .vendor-search {
              flex-direction: column;
              gap: 10px !important;
            }

            .vendor-search input {
              width: 100% !important;
              box-sizing: border-box;
            }

            .vendor-search button {
              width: 100%;
            }

            .vendor-filter-bar button {
              flex: 1;
              min-width: 70px;
            }

            .vendor-pagination {
              justify-content: space-between !important;
              gap: 8px !important;
            }

            .vendor-pagination button {
              padding: 8px 12px !important;
            }

            .vendor-pagination span {
              font-size: 13px;
            }

            .vendor-reject-modal {
              padding: 20px !important;
            }

            .vendor-reject-modal textarea {
              font-size: 14px;
            }

            .vendor-reject-modal .modal-actions {
              flex-direction: column-reverse;
            }

            .vendor-reject-modal .modal-actions button {
              width: 100%;
            }
          }
        `}
      </style>
    </>
  );
};

const styles = {
  container: {
    padding: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
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

  searchInput: {
    width: "250px",
    padding: "10px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
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

  filterBar: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  filterButton: {
    border: "1px solid #D8D2C7",
    borderRadius: "8px",
    padding: "9px 18px",
    cursor: "pointer",
  },

  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.05)",
  },

  count: {
    margin: "0",
    padding: "14px 20px",
    color: "#777",
    fontSize: "13px",
    borderBottom: "1px solid #F2F2F2",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "16px 20px",
    background: "#FAF7F2",
    color: "#555",
    fontSize: "14px",
    borderBottom: "1px solid #EAEAEA",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "16px 20px",
    borderBottom: "1px solid #F2F2F2",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "13px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  approveButton: {
    background: "#2E7D32",
    color: "#fff",
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  rejectButton: {
    background: "#D32F2F",
    color: "#fff",
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statusButton: {
    color: "#fff",
    padding: "7px 12px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  error: {
    color: "#D32F2F",
    marginBottom: "15px",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#888",
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
    color: "#2B2B2B",
  },

  pageInfo: {
    fontSize: "14px",
    color: "#555",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "16px",
    boxSizing: "border-box",
  },

  modal: {
    width: "450px",
    maxWidth: "100%",
    background: "#fff",
    borderRadius: "14px",
    padding: "25px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.2)",
    boxSizing: "border-box",
  },

  modalTitle: {
    margin: "0 0 8px",
    color: "#2B2B2B",
  },

  modalText: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "18px",
  },

  modalTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    resize: "vertical",
    outline: "none",
    fontSize: "14px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "9px 18px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },

  confirmRejectButton: {
    padding: "9px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#D32F2F",
    color: "#fff",
    cursor: "pointer",
  },
};

export default VendorManagement;