import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
} from "../../services/vendorService";
import VendorNavbar from "../../components/VendorNavbar";

const VendorAvailability = () => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState("all");
  const limit = 5;
  useEffect(() => {
    fetchAvailability();
  }, [currentPage, filter]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);

      const res = await getMyAvailability({
        page: currentPage,
        limit,
        filter,
      });

      setSlots(res.data || []);

      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Availability error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load availability",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      toast.error("Please select date, start time and end time.");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      setSaving(true);

      const res = await createAvailability({
        date,
        startTime,
        endTime,
      });

      toast.success(
        res.message || res.messages || "Availability slot created successfully",
      );

      setDate("");
      setStartTime("");
      setEndTime("");
      setCurrentPage(1);
      if (currentPage === 1) {
        fetchAvailability();
      }
    } catch (error) {
      console.error("Create availability error:", error);

      toast.error(
        error.response?.data?.message || "Failed to create availability",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await deleteAvailability(slotId);

      toast.success("Availability deleted successfully.");
      fetchAvailability();
    } catch (error) {
      console.error("Delete availability error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete availability",
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main className="vendor-availability-main" style={styles.main}>
        <div className="vendor-availability-header" style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VENDOR</p>

            <h1 className="vendor-availability-title" style={styles.title}>
              Manage Availability
            </h1>

            <p className="vendor-availability-subtitle" style={styles.subtitle}>
              Add the dates and time slots when you are available for wedding
              services.
            </p>
          </div>
        </div>

        <section className="vendor-availability-card" style={styles.card}>
          <h2
            className="vendor-availability-card-title"
            style={styles.cardTitle}
          >
            Add Availability
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              className="vendor-availability-form-grid"
              style={styles.formGrid}
            >
              <div>
                <label style={styles.label}>Date</label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Start Time</label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>End Time</label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="vendor-availability-add-button"
              style={styles.addButton}
            >
              {saving ? "Adding..." : "+ Add Availability"}
            </button>
          </form>
        </section>

        <section className="vendor-availability-card" style={styles.card}>
          <div
            className="vendor-availability-list-header"
            style={styles.listHeader}
          >
            <div>
              <p style={styles.eyebrow}>YOUR SCHEDULE</p>

              <h2
                className="vendor-availability-card-title"
                style={styles.cardTitle}
              >
                Available Time Slots
              </h2>
            </div>

            <span style={styles.count}>{totalItems} slots</span>
          </div>

          <div
            className="vendor-availability-filter"
            style={styles.filterContainer}
          >
            <label style={styles.filterLabel}>Filter:</label>

            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </div>

          {loading ? (
            <p style={styles.loadingText}>Loading availability...</p>
          ) : slots.length === 0 ? (
            <div className="vendor-availability-empty" style={styles.empty}>
              <div style={styles.emptyIcon}>📅</div>

              <h3 style={styles.emptyTitle}>No availability found</h3>

              <p style={styles.emptyText}>
                {filter === "all"
                  ? "Add your available dates and time slots above."
                  : `No ${filter} time slots found.`}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.slotList}>
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className="vendor-availability-slot"
                    style={styles.slot}
                  >
                    <div className="vendor-availability-slot-info">
                      <strong
                        className="vendor-availability-slot-date"
                        style={styles.slotDate}
                      >
                        📅 {formatDate(slot.date)}
                      </strong>

                      <p
                        className="vendor-availability-time"
                        style={styles.time}
                      >
                        🕐 {slot.startTime} - {slot.endTime}
                      </p>
                    </div>

                    <div className="vendor-availability-slot-action">
                      {slot.isBooked ? (
                        <span style={styles.booked}>Booked</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(slot._id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  className="vendor-availability-pagination"
                  style={styles.pagination}
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 ? styles.disabledButton : {}),
                    }}
                  >
                    ← Previous
                  </button>

                  <span style={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages
                        ? styles.disabledButton
                        : {}),
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* RESPONSIVE CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        .vendor-availability-main {
          width: 100%;
        }

        .vendor-availability-add-button {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .vendor-availability-add-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .vendor-availability-slot {
          transition: background 0.2s ease;
        }

        .vendor-availability-slot:hover {
          background: #f7f5f1;
        }

        .vendor-availability-filter select {
          cursor: pointer;
        }

        .vendor-availability-pagination button {
          transition: opacity 0.2s ease, background 0.2s ease;
        }

        .vendor-availability-pagination button:hover:not(:disabled) {
          opacity: 0.9;
        }

        @media (max-width: 900px) {
          .vendor-availability-main {
            padding: 32px 24px !important;
          }

          .vendor-availability-form-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 700px) {
          .vendor-availability-main {
            padding: 28px 18px !important;
          }

          .vendor-availability-header {
            margin-bottom: 24px !important;
          }

          .vendor-availability-title {
            font-size: 32px !important;
          }

          .vendor-availability-form-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .vendor-availability-add-button {
            width: 100%;
          }

          .vendor-availability-list-header {
            align-items: flex-start !important;
            gap: 15px !important;
          }

          .vendor-availability-filter {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .vendor-availability-filter select {
            width: 100% !important;
          }

          .vendor-availability-pagination {
            gap: 10px !important;
          }
        }

        @media (max-width: 520px) {
          .vendor-availability-main {
            padding: 24px 14px !important;
          }

          .vendor-availability-title {
            font-size: 28px !important;
            line-height: 1.2 !important;
          }

          .vendor-availability-header {
            margin-bottom: 20px !important;
          }

          .vendor-availability-message {
            font-size: 13px !important;
            padding: 11px 13px !important;
          }

          .vendor-availability-card {
            padding: 20px !important;
          }

          .vendor-availability-list-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .vendor-availability-slot {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            padding: 16px !important;
          }

          .vendor-availability-slot-action {
            width: 100%;
          }

          .vendor-availability-slot-action button {
            width: 100%;
          }

          .vendor-availability-slot-action span {
            display: inline-flex;
          }

          .vendor-availability-empty {
            padding: 35px 12px !important;
          }

          .vendor-availability-pagination {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .vendor-availability-pagination button {
            width: 100% !important;
          }

          .vendor-availability-page-info {
            text-align: center;
          }
        }

        @media (max-width: 380px) {
          .vendor-availability-main {
            padding: 20px 10px !important;
          }

          .vendor-availability-title {
            font-size: 25px !important;
          }

          .vendor-availability-subtitle {
            font-size: 13px !important;
          }

          .vendor-availability-card {
            padding: 17px !important;
          }

          .vendor-availability-card-title {
            font-size: 20px !important;
          }

          .vendor-availability-slot {
            padding: 14px !important;
          }

          .vendor-availability-slot-date {
            font-size: 13px !important;
          }

          .vendor-availability-time {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FAF9F7",
    color: "#3D5A50",
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px",
  },

  header: {
    marginBottom: "30px",
  },

  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#C97B84",
    marginBottom: "8px",
  },

  title: {
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    fontWeight: "600",
    color: "#3D5A50",
    margin: 0,
  },

  subtitle: {
    color: "#6B6560",
    marginTop: "10px",
    fontSize: "15px",
    lineHeight: "1.6",
    maxWidth: "650px",
  },

  card: {
    background: "#FFFFFF",
    padding: "28px",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #E5DFD5",
    boxShadow: "0 4px 15px rgba(61, 90, 80, 0.06)",
  },

  cardTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: "600",
    color: "#3D5A50",
    marginTop: 0,
    marginBottom: "22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#3D5A50",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #E5DFD5",
    borderRadius: "7px",
    background: "#FAF9F7",
    color: "#3D5A50",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  addButton: {
    marginTop: "24px",
    padding: "12px 22px",
    background: "#3D5A50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  count: {
    background: "#EEF3F0",
    color: "#3D5A50",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#3D5A50",
  },

  filterSelect: {
    padding: "9px 12px",
    border: "1px solid #E5DFD5",
    borderRadius: "7px",
    background: "#FAF9F7",
    color: "#3D5A50",
    fontSize: "13px",
    outline: "none",
  },

  slotList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  slot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    border: "1px solid #E5DFD5",
    borderRadius: "9px",
    background: "#FAF9F7",
    gap: "15px",
  },

  slotDate: {
    color: "#3D5A50",
    fontSize: "14px",
    overflowWrap: "anywhere",
  },

  time: {
    margin: "7px 0 0",
    color: "#6B6560",
    fontSize: "14px",
  },

  deleteButton: {
    padding: "8px 15px",
    background: "transparent",
    color: "#C97B84",
    border: "1px solid #C97B84",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  booked: {
    padding: "7px 12px",
    background: "#EEF3F0",
    color: "#3D5A50",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  empty: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#6B6560",
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  emptyTitle: {
    color: "#3D5A50",
    margin: "0 0 8px",
    fontFamily: "Georgia, serif",
    fontWeight: "600",
  },

  emptyText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.6",
  },

  error: {
    padding: "13px 16px",
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#FDF0F1",
    border: "1px solid #E8B8BE",
    color: "#A6535D",
    fontSize: "14px",
  },

  success: {
    padding: "13px 16px",
    marginBottom: "20px",
    borderRadius: "7px",
    background: "#EEF3F0",
    border: "1px solid #C7D8D1",
    color: "#3D5A50",
    fontSize: "14px",
  },

  loadingText: {
    color: "#6B6560",
    fontSize: "14px",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #E5DFD5",
  },

  paginationButton: {
    padding: "9px 15px",
    background: "#3D5A50",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.4,
    cursor: "not-allowed",
  },

  pageInfo: {
    color: "#6B6560",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  loadingCard: {
    background: "#FFFFFF",
    padding: "40px",
    borderRadius: "12px",
    border: "1px solid #E5DFD5",
    textAlign: "center",
  },
};

export default VendorAvailability;
