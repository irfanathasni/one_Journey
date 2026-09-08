import { useEffect, useState } from "react";
import { getVendorBookings, updateBookingStatus, completeBooking, requestFinalPayment } from "../../services/bookingService";
import VendorNavbar from "../../components/VendorNavbar";
import BookingStatusTimeline from "../../components/BookingStatusTimeline";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getVendorBookings()
      console.log("BOOKING DATA:",res.data)
      setBookings(res.data || [])
    } catch (error) {
      console.error("Failed to fetch vendor bookings:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      await updateBookingStatus(bookingId, status);
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update booking status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      await completeBooking(bookingId);
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to mark event as completed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRequestFinal = async (bookingId) => {
    try {
      setUpdatingId(bookingId);
      setError("");
      await requestFinalPayment(bookingId);
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request final payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCustomerName = (booking) => booking.customer?.name || "Customer";

  const getWeddingName = (booking) => {
    const brideName = booking.wedding?.brideName || "";
    const groomName = booking.wedding?.groomName || "";
    return brideName && groomName ? `${brideName} & ${groomName}` : "Wedding";
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <VendorNavbar />
        <main style={styles.main}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>💍</div>
            <h2 style={styles.loadingTitle}>Loading booking requests...</h2>
            <p style={styles.loadingText}>Please wait while we fetch your bookings.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main style={styles.main}>
        <section style={styles.header}>
          <div>
            <p style={styles.eyebrow}>YOUR BOOKINGS</p>
            <h1 style={styles.title}>Booking Requests</h1>
            <p style={styles.subtitle}>
              Manage booking requests, track events, and handle payments — all in one place.
            </p>
          </div>

          <div style={styles.totalBox}>
            <span style={styles.totalLabel}>Total Requests</span>
            <strong style={styles.totalValue}>{bookings.length}</strong>
          </div>
        </section>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>♡</div>
            <h2 style={styles.emptyTitle}>No booking requests yet</h2>
            <p style={styles.emptyText}>
              When couples request your services, their booking requests will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.bookingList}>
            {bookings.map((booking) => {
              const customerName = getCustomerName(booking);
              const weddingName = getWeddingName(booking);
              const status = booking.status || "pending";
              const isUpdating = updatingId === booking._id;
              const isExpanded = expandedId === booking._id;
              const remaining = (booking.amount || 0) - (booking.advanceAmount || 0);

              return (
                <div key={booking._id} style={styles.bookingCard}>
                  <div style={styles.cardTopRow} onClick={() => setExpandedId(isExpanded ? null : booking._id)}>
                    <div style={styles.customerSection}>
                      <div style={styles.customerAvatar}>{customerName.charAt(0).toUpperCase()}</div>
                      <div>
                        <h3 style={styles.customerName}>{customerName}</h3>
                        <p style={styles.weddingInfo}>{weddingName}</p>
                      </div>
                    </div>

                    <div style={styles.dateSection}>
                      <span style={styles.dateLabel}>SERVICE DATE</span>
                      <strong style={styles.dateValue}>{formatDate(booking.serviceDate)}</strong>
                      {booking.startTime && booking.endTime && (
                        <div style={styles.timeSlot}>
                          🕐 {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      )}
                    </div>

                    <span
                      style={{
                        ...styles.bookingStatus,
                        ...(status === "approved"
                          ? styles.approvedStatus
                          : status === "completed"
                          ? styles.completedStatus
                          : status === "rejected"
                          ? styles.rejectedStatus
                          : styles.pendingStatus),
                      }}
                    >{status}
                    </span>

                    <span style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                 {isExpanded && (
            <div style={styles.detailPanel}>
              <div style={styles.detailCardsRow}>
              <div style={styles.infoCard}>
               <p style={styles.infoCardTitle}>👤 Contact Details</p>
            <div style={styles.infoRow}>
             <span style={styles.infoLabel}>Email</span>
             <strong style={styles.infoValue}>{booking.customer?.email || "Not specified"}</strong>
           </div>
          <div style={styles.infoRow}>
           <span style={styles.infoLabel}>Phone</span>
           <strong style={styles.infoValue}>{booking.customer?.phone || "Not specified"}</strong>
        </div>
      </div>

       <div style={styles.infoCard}>
         <p style={styles.infoCardTitle}>📍 Event Details</p>
         <div style={styles.infoRow}>
           <span style={styles.infoLabel}>Guests</span>
             <strong style={styles.infoValue}>{booking.wedding?.guestCount || "Not specified"}</strong>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Venue</span>
          <strong style={styles.infoValue}>{booking.wedding?.venue || "Not specified"}</strong>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Location</span>
          <strong style={styles.infoValue}>{booking.wedding?.location || "Not specified"}</strong>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Wedding Date</span>
          <strong style={styles.infoValue}>{formatDate(booking.wedding?.weddingDate)}</strong>
        </div>
      </div>
      <div style={styles.infoCard}>
  <p style={styles.infoCardTitle}>📦 Selected Package</p>

  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>Package Type</span>
    <strong style={styles.infoValue}>
      {booking.package?.packageType || "Not specified"}
    </strong>
  </div>

  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>Package Name</span>
    <strong style={styles.infoValue}>
      {booking.package?.packageName || "Not specified"}
    </strong>
  </div>

  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>Description</span>
    <strong style={styles.infoValue}>
      {booking.package?.description || "Not specified"}
    </strong>
  </div>

  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>Package Price</span>
    <strong style={styles.infoValue}>
      ₹{Number(booking.package?.price || 0).toLocaleString("en-IN")}
    </strong>
  </div>
</div>

      <div style={styles.infoCard}>
        <p style={styles.infoCardTitle}>💰 Payment Summary</p>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Total Amount</span>
          <strong style={styles.infoValue}>₹{(booking.amount || 0).toLocaleString("en-IN")}</strong>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Advance</span>
          <strong style={{...styles.infoValue, color: booking.paymentStatus === "paid" ? "#2E7D50" : "#A66B00"}}>
            ₹{(booking.advanceAmount || 0).toLocaleString("en-IN")} · {booking.paymentStatus === "paid" ? "Paid" : "Pending"}
          </strong>
        </div>
        {status === "completed" && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Remaining</span>
            <strong style={{...styles.infoValue, color: booking.finalPaymentStatus === "paid" ? "#2E7D50" : "#A66B00"}}>
              ₹{remaining.toLocaleString("en-IN")} · {
                booking.finalPaymentStatus === "paid" ? "Paid" :
                booking.finalPaymentStatus === "requested" ? "Requested" : "Not requested"
              }
            </strong>
          </div>
        )}
      </div>
    </div>
      <BookingStatusTimeline booking={booking} role="vendor" />

    <div style={styles.actionRow}>
      {status === "pending" && (
        <>
          <button style={{...styles.acceptButton, ...(isUpdating ? styles.disabledButton : {})}} disabled={isUpdating}
            onClick={() => handleBookingStatus(booking._id, "approved")}>
            {isUpdating ? "Updating..." : "✓ Accept"}
          </button>
          <button style={{...styles.rejectButton, ...(isUpdating ? styles.disabledButton : {})}} disabled={isUpdating}
            onClick={() => handleBookingStatus(booking._id, "rejected")}>
            {isUpdating ? "Updating..." : "Reject"}
          </button>
        </>
      )}

      {status === "approved" && booking.paymentStatus === "paid" && (
        <button style={{...styles.acceptButton, ...(isUpdating ? styles.disabledButton : {})}} disabled={isUpdating}
          onClick={() => handleComplete(booking._id)}>
          {isUpdating ? "Updating..." : "Mark Event Completed"}
        </button>
      )}

      {status === "approved" && booking.paymentStatus !== "paid" && (
        <span style={styles.pendingText}>Awaiting customer's advance payment</span>
      )}

      {status === "completed" && booking.finalPaymentStatus === "not_requested" && (
        <button style={{...styles.acceptButton, ...(isUpdating ? styles.disabledButton : {})}} disabled={isUpdating}
          onClick={() => handleRequestFinal(booking._id)}>
          {isUpdating ? "Requesting..." : "Request Final Payment"}
        </button>
      )}

      {status === "completed" && booking.finalPaymentStatus === "requested" && (
        <span style={styles.pendingText}>Waiting for customer to pay remaining balance</span>
      )}

      {status === "completed" && booking.finalPaymentStatus === "paid" && (
        <span style={styles.acceptedText}>✓ Fully Paid</span>
      )}

          {status === "rejected" && <span style={styles.rejectedText}>Rejected</span>}
       </div>
     </div>
    )}                      
  </div>
 );
  })}
  </div>
 )}
</main>
   </div>
  )
}

const styles = {
  page: { 
    minHeight: "100vh", 
    background: "#FBF8F3" 
  },
  main: { 
    maxWidth: "1100px", 
    margin: "0 auto", 
    padding: "3rem 2rem" 
  },
  header: {
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-end", 
    gap: "2rem",
    marginBottom: "2.5rem", 
    paddingBottom: "2rem", 
    borderBottom: "1px solid #E5DFD5",
  },
  eyebrow: { 
    fontFamily: "Georgia, serif", 
    fontSize: "12px", 
    letterSpacing: "2px", 
    color: "#C97B84", 
    textTransform: "uppercase", 
    margin: 0 
  },
  title: { 
    fontFamily: "Georgia, serif", 
    fontSize: "38px", 
    fontWeight: 400,
     color: "#2B2B2B", 
     margin: "8px 0" 
    },
  subtitle: { 
    color: "#6B6560", 
    fontSize: "15px", 
    lineHeight: 1.6, 
    maxWidth: "600px", 
    margin: 0 
  },
  totalBox: { 
    minWidth: "150px", 
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5", 
    borderRadius: "10px", 
    padding: "1rem 1.25rem",
    textAlign: "center" 
  },
  totalLabel: { 
    display: "block", 
    fontSize: "11px", 
    color: "#6B6560", 
    textTransform: "uppercase", 
    letterSpacing: "1px", 
    marginBottom: "5px" 
  },
  totalValue: { 
    fontFamily: "Georgia, serif", 
    fontSize: "28px", 
    fontWeight: 400, 
    color: "#3D5A50" 
  },
  bookingList: { 
    display: "flex", 
    flexDirection: "column",
     gap: "14px" 
    },
  bookingCard: { 
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5", 
    borderRadius: "12px", 
    overflow: "hidden" 
  },
  cardTopRow: {
    display: "grid", 
    gridTemplateColumns: "minmax(220px, 1.5fr) minmax(150px, 1fr) 110px 24px",
    alignItems: "center", 
    gap: "20px", 
    padding: "1.25rem 1.5rem", 
    cursor: "pointer",
  },
  customerSection: { 
    display: "flex", 
    alignItems: "center", 
    gap: "12px" },
    customerAvatar: {
    width: "44px", 
    height: "44px", 
    borderRadius: "50%", 
    background: "#F3E6E6", 
    color: "#A85F69",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontFamily: "Georgia, serif", 
    fontSize: "18px", 
    flexShrink: 0,
  },
  customerName: { 
    margin: 0, 
    fontSize: "16px", 
    fontWeight: 600, color: "#2B2B2B" 
  },
  weddingInfo: { 
    margin: "4px 0 0", 
    fontSize: "13px", 
    color: "#6B6560" 
  },
  dateSection: { 
    display: "flex",
     flexDirection: "column", 
     gap: "5px" 
    },
  dateLabel: { 
    fontSize: "10px", 
    color: "#9A938B", 
    letterSpacing: "1px", 
    textTransform: "uppercase" 
  },
  dateValue: { 
    fontSize: "14px", 
    color: "#3D5A50", 
    fontWeight: 600 
  },
  timeSlot: { 
    marginTop: "4px", 
    fontSize: "13px", 
    fontWeight: "600", 
    color: "#7c3aed" 
  },
  bookingStatus: {
    display: "inline-flex", 
    alignItems: "center", 
    justifyContent: "center", 
    padding: "6px 11px",
    borderRadius: "20px", 
    fontSize: "11px", 
    fontWeight: 600, 
    textTransform: "capitalize", 
    whiteSpace: "nowrap",
  },
  pendingStatus: { 
    background: "#FFF4DD", 
    color: "#A66B00" 
  },
  approvedStatus: { 
    background: "#E5F1EB", 
    color: "#3D5A50" 
  },
  completedStatus: { 
    background: "#F0EAFB", 
    color: "#6B46C1" 
  },
  rejectedStatus: { 
    background: "#FBEAEA", 
    color: "#A33B3B" 
  },
  expandIcon: { 
    textAlign: "right", 
    color: "#B8935A", 
    fontSize: "12px" 
  },
  detailPanel: { 
    borderTop: "1px solid #EEE8DF", 
    padding: "1.25rem 1.5rem", 
    background: "#FBF8F3" 
  },
  detailLabel: { 
    fontSize: "10px", 
    color: "#9A938B", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px" 
  },
  actionRow: { 
    display: "flex", 
    gap: "10px", 
    alignItems: "center" 
  },
  acceptButton: { 
    border: "none", 
    background: "#3D5A50", 
    color: "#FFFFFF", 
    padding: "9px 16px", 
    borderRadius: "6px", 
    fontSize: "12px", 
    cursor: "pointer", 
    fontWeight: 600 
  },
  rejectButton: { 
    border: "1px solid #D7B8B8", 
    background: "#FFFFFF", 
    color: "#A33B3B", 
    padding: "9px 16px", 
    borderRadius: "6px", 
    fontSize: "12px", 
    cursor: "pointer" 
  },
  disabledButton: { 
    opacity: 0.6, 
    cursor: "not-allowed" 
  },
  acceptedText: { 
    color: "#3D5A50", 
    fontSize: "13px", 
    fontWeight: 600 
  },
  rejectedText: { 
    color: "#A33B3B", 
    fontSize: "13px", 
    fontWeight: 600 
  },
  pendingText: { 
    color: "#A66B00", 
    fontSize: "13px", 
    fontWeight: 600 
  },
  emptyCard: { 
    background: "#FFFFFF", 
    border: "1px solid #E5DFD5", 
    borderRadius: "12px", 
    padding: "4rem 2rem", 
    textAlign: "center" 
  },
  emptyIcon: { 
    fontSize: "35px", 
    color: "#C97B84", 
    marginBottom: "10px" 
  },
  emptyTitle: { 
    fontFamily: "Georgia, serif", 
    fontSize: "22px", 
    fontWeight: 400, 
    color: "#2B2B2B", 
    margin: "0 0 8px" 
  },
  emptyText: { 
    maxWidth: "450px", 
    margin: "0 auto", 
    color: "#6B6560", 
    fontSize: "14px", 
    lineHeight: 1.6 
  },
  errorBox: {
    display: "flex", 
    gap: "10px", 
    background: "#FBEAEA", 
    border: "1px solid #E8B8BE",
    color: "#A6535D", 
    padding: "12px 16px", 
    borderRadius: "8px", 
    marginBottom: "20px", 
    fontSize: "13px",
  },
  loadingCard: {
     minHeight: "60vh", 
     display: "flex", 
     flexDirection: "column", 
     alignItems: "center", 
     justifyContent: "center", 
     textAlign: "center" 
    },
  loadingIcon: { 
    fontSize: "38px", 
    marginBottom: "10px" 
  },
  loadingTitle: { 
    fontFamily: "Georgia, serif", 
    fontWeight: 400, 
    color: "#2B2B2B", 
    margin: "0 0 5px" 
  },
  loadingText: { 
    color: "#6B6560", 
    fontSize: "14px"
   },
  detailPanel: {
  borderTop: "1px solid #EEE8DF",
  padding: "1.5rem",
  background: "#FBF8F3",
},

detailCardsRow: {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "14px",
  marginBottom: "18px",
},

infoCard: {
  background: "#FFFFFF",
  border: "1px solid #E5DFD5",
  borderRadius: "10px",
  padding: "16px 18px",
},

infoCardTitle: {
  margin: "0 0 12px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#3D5A50",
  letterSpacing: "0.3px",
},

infoRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  padding: "7px 0",
  borderBottom: "1px solid #F3EFE8",
  fontSize: "12px",
},

infoLabel: {
  color: "#9A938B",
  flexShrink: 0,
},

infoValue: {
  color: "#2B2B2B",
  textAlign: "right",
},
};

export default VendorBookings;
