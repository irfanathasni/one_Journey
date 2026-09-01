import { useEffect, useState } from "react";
import {createAvailability,
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyAvailability();

      setSlots(res.data || []);
    } catch (error) {
      console.error("Availability error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load availability"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!date || !startTime || !endTime) {
      setError("Please select date, start time and end time.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setSaving(true);

      const res = await createAvailability({date,startTime,endTime });
      setSuccess(
        res.message ||
        res.messages ||
        "Availability slot created successfully"
      );

      setDate("");
      setStartTime("");
      setEndTime("");

      fetchAvailability();

    } catch (error) {
      console.error("Create availability error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to create availability"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      setError("");
      setSuccess("");

      await deleteAvailability(slotId);

      setSlots((prev) =>
        prev.filter((slot) => slot._id !== slotId)
      );

      setSuccess("Availability deleted successfully.");

    } catch (error) {
      console.error("Delete availability error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to delete availability"
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
      <main style={styles.main}>

        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VENDOR</p>
            <h1 style={styles.title}>Manage Availability</h1>
            <p style={styles.subtitle}>
              Add the dates and time slots when you are available
              for wedding services.
            </p>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            ✓ {success}
          </div>
        )}

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Add Availability</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Date</label>
                <input type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input} />
              </div>

              <div>
                <label style={styles.label}>Start Time</label>
                <input type="time" value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}style={styles.input} />
              </div>

              <div>
                <label style={styles.label}>End Time</label>
                <input type="time" value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.input} />
              </div>
            </div>

            <button type="submit" disabled={saving} style={styles.addButton}>
              {saving
                ? "Adding..."
                : "+ Add Availability"}
            </button>

          </form>

        </section>
        <section style={styles.card}>
          <div style={styles.listHeader}>
            <div>
              <p style={styles.eyebrow}>YOUR SCHEDULE</p>
              <h2 style={styles.cardTitle}>Available Time Slots</h2>
            </div>
            <span style={styles.count}>{slots.length} slots</span>
          </div>
          {loading ? (
            <p>Loading availability...</p>
          ) : slots.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                📅
              </div>
              <h3>No availability added</h3>
              <p> Add your available dates and time slots above.</p>
            </div>
          ) : (
            <div style={styles.slotList}>
              {slots.map((slot) => (
                <div key={slot._id} style={styles.slot}>
                  <div>
                    <strong>
                      📅 {formatDate(slot.date)}
                    </strong>
                    <p style={styles.time}>
                      🕐 {slot.startTime} - {slot.endTime}
                    </p>
                  </div>

                  <div>
                    {slot.isBooked ? (
                      <span style={styles.booked}>
                        Booked
                      </span>
                    ) : (
                      <button onClick={() => handleDelete(slot._id)}
                        style={styles.deleteButton}>Delete
                      </button>
                    )}
                  </div>
                </div>

              ))}

            </div>
          )}

        </section>

      </main>
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

  loadingCard: {
    background: "#FFFFFF",
    padding: "40px",
    borderRadius: "12px",
    border: "1px solid #E5DFD5",
    textAlign: "center",
  },
}
export default VendorAvailability;