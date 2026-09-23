import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getVendorBookings,
  updateBookingStatus,
  completeBooking,
  requestFinalPayment,
} from "../../services/bookingService";
import VendorNavbar from "../../components/VendorNavbar";
import BookingStatusTimeline from "../../components/BookingStatusTimeline";

const VendorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 400);

    return () => clearTimeout(timer);
  }, [currentPage, statusFilter, search, sortBy]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await getVendorBookings({
        page: currentPage,
        limit: 5,

        ...(statusFilter && {
          status: statusFilter,
        }),

        ...(search.trim() && {
          search: search.trim(),
        }),

        sortBy,
      });

      setBookings(res.data || []);

      setPagination(
        res.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          limit: 5,
        },
      );
    } catch (error) {
      console.error(
        "Failed to fetch vendor bookings:",
        error.response?.data || error,
      );

      toast.error(
        error.response?.data?.message || "Failed to load booking requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);

      await updateBookingStatus(bookingId, status);
      toast.success(
        status === "approved"
          ? "Booking accepted successfully."
          : "Booking rejected successfully.",
      );
      await fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update booking status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      setUpdatingId(bookingId);

      await completeBooking(bookingId);
      toast.success("Event marked as compleated successfully.");
      await fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark event as completed.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRequestFinal = async (bookingId) => {
    try {
      setUpdatingId(bookingId);

      await requestFinalPayment(bookingId);
      toast.success("Final payment requested successfully.");

      await fetchBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request final payment.",
      );
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

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <VendorNavbar />

        <main className="vendor-bookings-main" style={styles.main}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingIcon}>💍</div>

            <h2 style={styles.loadingTitle}>Loading booking requests...</h2>

            <p style={styles.loadingText}>
              Please wait while we fetch your bookings.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main className="vendor-bookings-main" style={styles.main}>
        <section className="vendor-booking-header" style={styles.header}>
          <div style={styles.headerContent}>
            <p style={styles.eyebrow}>YOUR BOOKINGS</p>

            <h1 className="vendor-booking-title" style={styles.title}>
              Booking Requests
            </h1>

            <p className="vendor-booking-subtitle" style={styles.subtitle}>
              Manage booking requests, track events, and handle payments — all
              in one place.
            </p>
          </div>

          <div className="vendor-booking-total" style={styles.totalBox}>
            <span style={styles.totalLabel}>Total Requests</span>

            <strong style={styles.totalValue}>{pagination.totalItems}</strong>
          </div>
        </section>

        <div className="vendor-booking-filter-bar" style={styles.filterBar}>
          <div
            className="vendor-booking-search-wrapper"
            style={styles.filterGroup}
          >
            <label style={styles.filterLabel}>Search</label>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>

              <input
                className="vendor-booking-search-input"
                type="text"
                placeholder="Customer or couple name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                  setExpandedId(null);
                }}
                style={styles.searchInput}
              />
            </div>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>

            <select
              className="vendor-booking-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
                setExpandedId(null);
              }}
              style={styles.filterSelect}
            >
              <option value="">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort By</label>

            <select
              className="vendor-booking-sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
                setExpandedId(null);
              }}
              style={styles.filterSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="serviceDateAsc">Service Date: Earliest</option>
              <option value="serviceDateDesc">Service Date: Latest</option>
            </select>
          </div>
          <div className="vendor-booking-result-info" style={styles.resultInfo}>
            <span style={styles.resultCount}>{pagination.totalItems}</span>
            <span> bookings found</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="vendor-booking-empty" style={styles.emptyCard}>
            <div style={styles.emptyIcon}>♡</div>

            <h2 style={styles.emptyTitle}>
              {statusFilter ? "No bookings found" : "No booking requests yet"}
            </h2>

            <p style={styles.emptyText}>
              {statusFilter
                ? `There are no ${statusFilter} bookings at the moment.`
                : "When couples request your services, their booking requests will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.bookingList}>
              {bookings.map((booking) => {
                const customerName = getCustomerName(booking);
                const weddingName = getWeddingName(booking);
                const status = booking.status || "pending";
                const isUpdating = updatingId === booking._id;
                const isExpanded = expandedId === booking._id;

                const remaining =
                  (booking.amount || 0) - (booking.advanceAmount || 0);

                return (
                  <div key={booking._id} style={styles.bookingCard}>
                    <div
                      className="vendor-booking-top-row"
                      style={styles.cardTopRow}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : booking._id)
                      }
                    >
                      <div style={styles.customerSection}>
                        <div
                          className="vendor-booking-customer-avatar"
                          style={styles.customerAvatar}
                        >
                          {customerName.charAt(0).toUpperCase()}
                        </div>

                        <div style={styles.customerInfo}>
                          <h3
                            className="vendor-booking-customer-name"
                            style={styles.customerName}
                          >
                            {customerName}
                          </h3>

                          <p
                            className="vendor-booking-wedding"
                            style={styles.weddingInfo}
                          >
                            {weddingName}
                          </p>
                        </div>
                      </div>

                      <div style={styles.dateSection}>
                        <span style={styles.dateLabel}>SERVICE DATE</span>

                        <strong
                          className="vendor-booking-date-value"
                          style={styles.dateValue}
                        >
                          {formatDate(booking.serviceDate)}
                        </strong>

                        {booking.startTime && booking.endTime && (
                          <div
                            className="vendor-booking-time"
                            style={styles.timeSlot}
                          >
                            🕐 {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </div>
                        )}
                      </div>

                      <span
                        className="vendor-booking-status"
                        style={{
                          ...styles.bookingStatus,
                          ...(status === "approved"
                            ? styles.approvedStatus
                            : status === "completed"
                              ? styles.completedStatus
                              : status === "rejected"
                                ? styles.rejectedStatus
                                : status === "cancelled"
                                  ? styles.cancelledStatus
                                  : styles.pendingStatus),
                        }}
                      >
                        {status}
                      </span>

                      <span style={styles.expandIcon}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {isExpanded && (
                      <div
                        className="vendor-booking-detail-panel"
                        style={styles.detailPanel}
                      >
                        <div
                          className="vendor-detail-cards"
                          style={styles.detailCardsRow}
                        >
                          {/* CONTACT */}
                          <div
                            className="vendor-booking-info-card"
                            style={styles.infoCard}
                          >
                            <p style={styles.infoCardTitle}>
                              👤 Contact Details
                            </p>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Email</span>

                              <strong
                                className="vendor-booking-info-value"
                                style={styles.infoValue}
                              >
                                {booking.customer?.email || "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Phone</span>

                              <strong style={styles.infoValue}>
                                {booking.customer?.phone || "Not specified"}
                              </strong>
                            </div>
                          </div>

                          {/* EVENT */}
                          <div style={styles.infoCard}>
                            <p style={styles.infoCardTitle}>📍 Event Details</p>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Guests</span>

                              <strong style={styles.infoValue}>
                                {booking.wedding?.guestCount || "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Venue</span>

                              <strong style={styles.infoValue}>
                                {booking.wedding?.venue || "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Location</span>

                              <strong style={styles.infoValue}>
                                {booking.wedding?.location || "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Wedding Date</span>

                              <strong style={styles.infoValue}>
                                {formatDate(booking.wedding?.weddingDate)}
                              </strong>
                            </div>
                          </div>

                          {/* PACKAGE */}
                          <div style={styles.infoCard}>
                            <p style={styles.infoCardTitle}>
                              📦 Selected Package
                            </p>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Package Type</span>

                              <strong
                                className="vendor-booking-info-value"
                                style={styles.infoValue}
                              >
                                {booking.package?.packageType ||
                                  "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Package Name</span>

                              <strong
                                className="vendor-booking-info-value"
                                style={styles.infoValue}
                              >
                                {booking.package?.packageName ||
                                  "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Description</span>

                              <strong
                                className="vendor-booking-info-value"
                                style={{ ...styles.infoValue, maxWidth: "65%" }}
                              >
                                {booking.package?.description ||
                                  "Not specified"}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>
                                Package Price
                              </span>

                              <strong style={styles.infoValue}>
                                ₹
                                {Number(
                                  booking.package?.price || 0,
                                ).toLocaleString("en-IN")}
                              </strong>
                            </div>
                          </div>

                          {/* PAYMENT */}
                          <div style={styles.infoCard}>
                            <p style={styles.infoCardTitle}>
                              💰 Payment Summary
                            </p>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Total Amount</span>

                              <strong style={styles.infoValue}>
                                ₹{(booking.amount || 0).toLocaleString("en-IN")}
                              </strong>
                            </div>

                            <div
                              className="vendor-booking-info-row"
                              style={styles.infoRow}
                            >
                              <span style={styles.infoLabel}>Advance</span>

                              <strong
                                style={{
                                  ...styles.infoValue,
                                  color:
                                    booking.paymentStatus === "paid"
                                      ? "#2E7D50"
                                      : "#A66B00",
                                }}
                              >
                                ₹
                                {(booking.advanceAmount || 0).toLocaleString(
                                  "en-IN",
                                )}{" "}
                                ·{" "}
                                {booking.paymentStatus === "paid"
                                  ? "Paid"
                                  : "Pending"}
                              </strong>
                            </div>

                            {status === "completed" && (
                              <div
                                className="vendor-booking-info-row"
                                style={styles.infoRow}
                              >
                                <span style={styles.infoLabel}>Remaining</span>

                                <strong
                                  style={{
                                    ...styles.infoValue,
                                    color:
                                      booking.finalPaymentStatus === "paid"
                                        ? "#2E7D50"
                                        : "#A66B00",
                                  }}
                                >
                                  ₹{remaining.toLocaleString("en-IN")} ·{" "}
                                  {booking.finalPaymentStatus === "paid"
                                    ? "Paid"
                                    : booking.finalPaymentStatus === "requested"
                                      ? "Requested"
                                      : "Not requested"}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>

                        <BookingStatusTimeline
                          booking={booking}
                          role="vendor"
                        />

                        {/* ACTIONS */}
                        <div
                          className="vendor-booking-action-row"
                          style={styles.actionRow}
                        >
                          {status === "pending" && (
                            <>
                              <button
                                style={{
                                  ...styles.acceptButton,
                                  ...(isUpdating ? styles.disabledButton : {}),
                                }}
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleBookingStatus(booking._id, "approved");
                                }}
                              >
                                {isUpdating ? "Updating..." : "✓ Accept"}
                              </button>

                              <button
                                style={{
                                  ...styles.rejectButton,
                                  ...(isUpdating ? styles.disabledButton : {}),
                                }}
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleBookingStatus(booking._id, "rejected");
                                }}
                              >
                                {isUpdating ? "Updating..." : "Reject"}
                              </button>
                            </>
                          )}

                          {status === "approved" &&
                            booking.paymentStatus === "paid" && (
                              <button
                                style={{
                                  ...styles.acceptButton,
                                  ...(isUpdating ? styles.disabledButton : {}),
                                }}
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleComplete(booking._id);
                                }}
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Mark Event Completed"}
                              </button>
                            )}

                          {status === "approved" &&
                            booking.paymentStatus !== "paid" && (
                              <span style={styles.pendingText}>
                                Awaiting customer's advance payment
                              </span>
                            )}

                          {status === "completed" &&
                            booking.finalPaymentStatus === "not_requested" && (
                              <button
                                style={{
                                  ...styles.acceptButton,
                                  ...(isUpdating ? styles.disabledButton : {}),
                                }}
                                disabled={isUpdating}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleRequestFinal(booking._id);
                                }}
                              >
                                {isUpdating
                                  ? "Requesting..."
                                  : "Request Final Payment"}
                              </button>
                            )}

                          {status === "completed" &&
                            booking.finalPaymentStatus === "requested" && (
                              <span style={styles.pendingText}>
                                Waiting for customer to pay remaining balance
                              </span>
                            )}

                          {status === "completed" &&
                            booking.finalPaymentStatus === "paid" && (
                              <span style={styles.acceptedText}>
                                ✓ Fully Paid
                              </span>
                            )}

                          {status === "rejected" && (
                            <span style={styles.rejectedText}>Rejected</span>
                          )}

                          {status === "cancelled" && (
                            <span style={styles.rejectedText}>Cancelled</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div
                className="vendor-booking-pagination"
                style={styles.pagination}
              >
                <button
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === 1 ? styles.paginationDisabled : {}),
                  }}
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  ← Previous
                </button>

                <div style={styles.pageNumbers}>
                  <span style={styles.pageText}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>

                <button
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === pagination.totalPages
                      ? styles.paginationDisabled
                      : {}),
                  }}
                  disabled={currentPage === pagination.totalPages}
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages),
                    )
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* RESPONSIVE CSS */}
      <style>
        {`
  * {
    box-sizing: border-box;
  }

  .vendor-booking-top-row {
    transition: background 0.2s ease;
  }

  .vendor-booking-top-row:hover {
    background: #fffdf9;
  }

  @media (max-width: 900px) {
    .vendor-booking-top-row {
      grid-template-columns: minmax(180px, 1.4fr) minmax(140px, 1fr) 90px 20px !important;
      gap: 12px !important;
      padding: 1rem !important;
    }
  }

  @media (max-width: 700px) {
    .vendor-booking-top-row {
      grid-template-columns: 1fr auto !important;
      gap: 14px !important;
      padding: 1rem !important;
    }

    .vendor-booking-top-row > div:nth-child(2) {
      grid-column: 1 / 2;
    }

    .vendor-booking-top-row > span:nth-child(3) {
      grid-column: 2 / 3;
      grid-row: 1;
      align-self: start;
    }

    .vendor-booking-top-row > span:nth-child(4) {
      grid-column: 2 / 3;
      grid-row: 2;
      align-self: center;
    }

    .vendor-booking-action-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .vendor-booking-action-row button {
      width: 100%;
      min-height: 42px;
    }

    .vendor-booking-action-row span {
      display: block;
      width: 100%;
      line-height: 1.5;
    }
  }

  @media (max-width: 600px) {
    .vendor-bookings-main {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }

    .vendor-booking-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .vendor-booking-total {
      width: 100% !important;
    }

    .vendor-detail-cards {
      grid-template-columns: 1fr !important;
    }

    .vendor-booking-filter-bar {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .vendor-booking-filter-select {
      width: 100% !important;
    }
    .vendor-booking-search-input {
     width: 100% !important;
    }

    .vendor-booking-result-info {
      text-align: left !important;
    }

    .vendor-booking-pagination {
      gap: 8px !important;
    }

    .vendor-booking-pagination button {
      flex: 1;
    }
  }

  @media (max-width: 480px) {
    .vendor-booking-top-row {
      grid-template-columns: 1fr auto !important;
      gap: 10px !important;
    }

    .vendor-booking-customer-avatar {
      width: 38px !important;
      height: 38px !important;
      font-size: 16px !important;
    }

    .vendor-booking-customer-name {
      font-size: 14px !important;
    }

    .vendor-booking-wedding {
      font-size: 12px !important;
    }

    .vendor-booking-date-value {
      font-size: 13px !important;
    }

    .vendor-booking-time {
      font-size: 11px !important;
    }

    .vendor-booking-status {
      font-size: 10px !important;
      padding: 5px 8px !important;
    }

    .vendor-booking-detail-panel {
      padding: 1rem !important;
    }

    .vendor-booking-info-card {
      padding: 13px !important;
    }

    .vendor-booking-info-row {
      flex-direction: column !important;
      gap: 4px !important;
    }

    .vendor-booking-info-value {
      width: 100% !important;
      max-width: 100% !important;
      text-align: left !important;
      overflow-wrap: anywhere;
    }

    .vendor-booking-empty {
      padding: 3rem 1.25rem !important;
    }

    .vendor-booking-title {
      font-size: 30px !important;
    }

    .vendor-booking-subtitle {
      font-size: 13px !important;
    }
  }

  @media (max-width: 360px) {
    .vendor-booking-top-row {
      padding: 0.85rem !important;
    }

    .vendor-booking-title {
      font-size: 27px !important;
    }

    .vendor-booking-detail-panel {
      padding: 0.75rem !important;
    }
      .vendor-booking-search-wrapper,
      .vendor-booking-search-input,
      .vendor-booking-search-wrapper .vendor-booking-search-input {
      width: 100% !important;
    }

      .vendor-booking-filter-select,
      .vendor-booking-sort-select {
      width: 100% !important;
    }

    .vendor-booking-result-info {
      margin-left: 0 !important;
      justify-content: flex-start;
    }
      }
    `}
      </style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "3rem 2rem",
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

  headerContent: {
    minWidth: 0,
  },

  eyebrow: {
    fontFamily: "Georgia, serif",
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#C97B84",
    textTransform: "uppercase",
    margin: 0,
  },

  title: {
    fontFamily: "Georgia, serif",
    fontSize: "38px",
    fontWeight: 400,
    color: "#2B2B2B",
    margin: "8px 0",
  },

  subtitle: {
    color: "#6B6560",
    fontSize: "15px",
    lineHeight: 1.6,
    maxWidth: "600px",
    margin: 0,
  },

  totalBox: {
    minWidth: "150px",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    textAlign: "center",
  },

  totalLabel: {
    display: "block",
    fontSize: "11px",
    color: "#6B6560",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "5px",
  },

  totalValue: {
    fontFamily: "Georgia, serif",
    fontSize: "28px",
    fontWeight: 400,
    color: "#3D5A50",
  },

  bookingList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  bookingCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    overflow: "hidden",
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
    gap: "12px",
    minWidth: 0,
  },

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

  customerInfo: {
    minWidth: 0,
  },

  customerName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#2B2B2B",
    overflowWrap: "anywhere",
  },

  weddingInfo: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#6B6560",
    overflowWrap: "anywhere",
  },

  dateSection: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
  },

  dateLabel: {
    fontSize: "10px",
    color: "#9A938B",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  dateValue: {
    fontSize: "14px",
    color: "#3D5A50",
    fontWeight: 600,
  },

  timeSlot: {
    marginTop: "4px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#7c3aed",
    overflowWrap: "anywhere",
  },

  bookingStatus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    justifySelf: "start",
    padding: "6px 11px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  pendingStatus: {
    background: "#FFF4DD",
    color: "#A66B00",
  },

  approvedStatus: {
    background: "#E5F1EB",
    color: "#3D5A50",
  },

  completedStatus: {
    background: "#F0EAFB",
    color: "#6B46C1",
  },

  rejectedStatus: {
    background: "#FBEAEA",
    color: "#A33B3B",
  },
  cancelledStatus: {
    background: "#FBEAEA",
    color: "#A33B3B",
  },

  expandIcon: {
    textAlign: "right",
    color: "#B8935A",
    fontSize: "12px",
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
    minWidth: 0,
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
    overflowWrap: "anywhere",
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  acceptButton: {
    border: "none",
    background: "#3D5A50",
    color: "#FFFFFF",
    padding: "9px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
  },

  rejectButton: {
    border: "1px solid #D7B8B8",
    background: "#FFFFFF",
    color: "#A33B3B",
    padding: "9px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  acceptedText: {
    color: "#3D5A50",
    fontSize: "13px",
    fontWeight: 600,
  },

  rejectedText: {
    color: "#A33B3B",
    fontSize: "13px",
    fontWeight: 600,
  },

  pendingText: {
    color: "#A66B00",
    fontSize: "13px",
    fontWeight: 600,
  },

  emptyCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "12px",
    padding: "4rem 2rem",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "35px",
    color: "#C97B84",
    marginBottom: "10px",
  },

  emptyTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 400,
    color: "#2B2B2B",
    margin: "0 0 8px",
  },

  emptyText: {
    maxWidth: "450px",
    margin: "0 auto",
    color: "#6B6560",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  loadingCard: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  loadingIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  loadingTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#2B2B2B",
    margin: "0 0 5px",
  },

  loadingText: {
    color: "#6B6560",
    fontSize: "14px",
  },
  filterBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
    padding: "16px",
    marginBottom: "20px",
    background: "#FCFAF7",
    border: "1px solid #E8E0D7",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5B514A",
    letterSpacing: "0.2px",
  },

  searchBox: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "20px",
    color: "#8A817A",
    pointerEvents: "none",
    lineHeight: 1,
  },

  searchInput: {
    width: "260px",
    height: "40px",
    padding: "0 12px 0 36px",
    border: "1px solid #DCD4CC",
    borderRadius: "8px",
    background: "#FFFFFF",
    color: "#2B2B2B",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },

  filterSelect: {
    minWidth: "170px",
    height: "40px",
    padding: "0 34px 0 12px",
    border: "1px solid #DCD4CC",
    borderRadius: "8px",
    background: "#FFFFFF",
    color: "#3A3430",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
  },

  resultInfo: {
    marginLeft: "auto",
    height: "40px",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#81766E",
    whiteSpace: "nowrap",
  },

  resultCount: {
    fontWeight: "700",
    color: "#3D5A50",
    marginRight: "4px",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
    padding: "16px",
  },

  pageNumbers: {
    minWidth: "120px",
    textAlign: "center",
  },

  pageText: {
    fontSize: "13px",
    color: "#6B6560",
    fontWeight: 600,
  },

  paginationButton: {
    border: "1px solid #D7D0C7",
    background: "#FFFFFF",
    color: "#3D5A50",
    padding: "8px 14px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  paginationDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
};

export default VendorBookings;
