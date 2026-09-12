import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";
import {
  createPayment,
  markPaymentFailed,
  verifyPayment,
} from "../../services/paymentService";
import { createReview } from "../../services/reviewService";
import BookingStatusTimeline from "../../components/BookingStatusTimeline";

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyBookings();

      setBookings(res.data || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (status === "approved") return "✓ Approved";
    if (status === "completed") return "🎉 Completed";
    if (status === "rejected") return "✕ Rejected";

    return "⏳ Pending";
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      alert("Please select a rating");
      return;
    }

    setSubmittingReview(true);

    try {
      await createReview({
        bookingId: reviewingBooking._id,
        rating,
        comment,
      });

      setReviewedBookings([
        ...reviewedBookings,
        reviewingBooking._id,
      ]);

      setReviewingBooking(null);
      setRating(0);
      setComment("");

      alert("Review submitted. Thank you!");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePayment = async (
    booking,
    paymentType = "advance"
  ) => {
    try {
      const { order, keyId } = await createPayment(
        booking._id,
        paymentType
      );

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "One Journey Wedding Planner",
        description: `${
          paymentType === "final" ? "Final" : "Advance"
        } payment for ${
          booking.vendor?.businessName || "vendor"
        }`,
        order_id: order.id,

        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,
              razorpay_payment_id:
                response.razorpay_payment_id,
              razorpay_signature:
                response.razorpay_signature,
              bookingId: booking._id,
              paymentType,
            });

            alert(
              paymentType === "final"
                ? "Final payment successful!"
                : "Payment successful! Advance paid."
            );

            fetchBookings();
          } catch (err) {
            alert(
              "Payment Verification failed. Contact Support if amount was deducted."
            );
          }
        },

        modal: {
          ondismiss: async () => {
            await markPaymentFailed(
              booking._id,
              paymentType
            );
          },
        },

        theme: {
          color: "#3D5A50",
        },
      };

      const razorpayObject = new window.Razorpay(
        options
      );

      razorpayObject.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to start payment"
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>💍</div>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  return (
    <div
      style={styles.page}
      className="customer-bookings-page"
    >
      {/* HEADER */}
      <div
        style={styles.header}
        className="customer-bookings-header"
      >
        <div>
          <p style={styles.eyebrow}>MY JOURNEY</p>

          <h1
            style={styles.title}
            className="customer-bookings-title"
          >
            My Bookings
          </h1>

          <p style={styles.subtitle}>
            Track your vendor booking requests and their
            status.
          </p>
        </div>

        <div
          style={styles.countBox}
          className="customer-bookings-count"
        >
          <span>Total Bookings</span>
          <strong>{bookings.length}</strong>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* EMPTY */}
      {!error && bookings.length === 0 && (
        <div
          style={styles.empty}
          className="customer-bookings-empty"
        >
          <div style={styles.emptyIcon}>💍</div>

          <h2>No bookings yet</h2>

          <p>
            Your vendor booking requests will appear here.
          </p>
        </div>
      )}

      {/* BOOKINGS LIST */}
      <div style={styles.list}>
        {bookings.map((booking) => {
          const status = booking.status || "pending";

          const remaining =
            (booking.amount || 0) -
            (booking.advanceAmount || 0);

          return (
            <div
              key={booking._id}
              style={styles.card}
              className="customer-booking-card"
            >
              {/* CARD HEADER */}
              <div
                style={styles.cardHeader}
                className="customer-booking-card-header"
              >
                <div
                  style={styles.vendorInfo}
                  className="customer-booking-vendor-info"
                >
                  <p style={styles.smallLabel}>
                    VENDOR
                  </p>

                  <h2
                    style={styles.vendorName}
                    className="customer-booking-vendor-name"
                  >
                    {booking.vendor?.businessName ||
                      "Vendor"}
                  </h2>

                  <p style={styles.category}>
                    {booking.vendor?.category || ""}
                  </p>
                </div>

                <span
                  style={{
                    ...styles.status,
                    ...(status === "approved"
                      ? styles.approved
                      : status === "completed"
                      ? styles.completed
                      : status === "rejected"
                      ? styles.rejected
                      : styles.pending),
                  }}
                  className="customer-booking-status"
                >
                  {formatStatus(status)}
                </span>
              </div>

              {/* BOOKING DETAILS */}
              <div
                style={styles.details}
                className="customer-booking-details"
              >
                <div style={styles.detail}>
                  <span style={styles.icon}>💍</span>

                  <div style={styles.detailContent}>
                    <p style={styles.label}>Wedding</p>

                    <strong>
                      {booking.wedding?.brideName ||
                        ""}{" "}
                      &{" "}
                      {booking.wedding?.groomName ||
                        ""}
                    </strong>
                  </div>
                </div>

                <div style={styles.detail}>
                  <span style={styles.icon}>📅</span>

                  <div style={styles.detailContent}>
                    <p style={styles.label}>
                      Service Date
                    </p>

                    <strong>
                      {formatDate(
                        booking.serviceDate
                      )}
                    </strong>
                  </div>
                </div>

                <div style={styles.detail}>
                  <span style={styles.icon}>⏰</span>

                  <div style={styles.detailContent}>
                    <p style={styles.label}>Time</p>

                    <strong>
                      {booking.startTime &&
                      booking.endTime
                        ? `${booking.startTime} - ${booking.endTime}`
                        : "Not specified"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* PACKAGE */}
              <div
                style={styles.packageSection}
                className="customer-booking-package"
              >
                <div
                  style={styles.packageInfo}
                  className="customer-booking-package-info"
                >
                  <p style={styles.packageLabel}>
                    SELECTED PACKAGE
                  </p>

                  <strong style={styles.packageName}>
                    {booking.package?.packageName ||
                      "Package"}
                  </strong>

                  <p style={styles.packageType}>
                    {booking.package?.packageType ||
                      ""}
                  </p>
                </div>

                <div
                  style={styles.packagePrice}
                  className="customer-booking-package-price"
                >
                  ₹
                  {Number(
                    booking.package?.price ||
                      booking.amount ||
                      0
                  ).toLocaleString("en-IN")}
                </div>
              </div>

              {/* TIMELINE */}
              <BookingStatusTimeline
                booking={booking}
                role="customer"
              />

              {/* FOOTER */}
              <div
                style={styles.footer}
                className="customer-booking-footer"
              >
                <span>
                  Booking requested on{" "}
                  {formatDate(booking.createdAt)}
                </span>

                {status === "approved" && (
                  <span style={styles.successText}>
                    Your booking has been approved 🎉
                  </span>
                )}

                {status === "completed" && (
                  <span style={styles.successText}>
                    Event completed 🎉
                  </span>
                )}

                {status === "rejected" && (
                  <span style={styles.rejectText}>
                    This booking request was rejected.
                  </span>
                )}

                {status === "pending" && (
                  <span style={styles.pendingText}>
                    Waiting for vendor response...
                  </span>
                )}
              </div>

              {/* ADVANCE PAYMENT */}
              {status === "approved" &&
                booking.paymentStatus !== "paid" && (
                  <div style={styles.paymentSection}>
                    <div style={styles.paymentInfo}>
                      <span>Package Total</span>

                      <strong>
                        ₹
                        {Number(
                          booking.amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div style={styles.paymentInfo}>
                      <span>
                        Advance Payment (50%)
                      </span>

                      <strong>
                        ₹
                        {Number(
                          booking.advanceAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <button
                      onClick={() =>
                        handlePayment(
                          booking,
                          "advance"
                        )
                      }
                      style={styles.payButton}
                    >
                      Pay Advance ₹
                      {Number(
                        booking.advanceAmount || 0
                      ).toLocaleString("en-IN")}
                    </button>
                  </div>
                )}

              {/* ADVANCE PAID */}
              {status === "approved" &&
                booking.paymentStatus === "paid" && (
                  <span style={styles.paidBadge}>
                    ✓ Advance Paid
                  </span>
                )}

              {/* FINAL PAYMENT */}
              {status === "completed" &&
                booking.finalPaymentStatus ===
                  "requested" && (
                  <div style={styles.paymentSection}>
                    <div style={styles.paymentInfo}>
                      <span>
                        Total Package Amount
                      </span>

                      <strong>
                        ₹
                        {Number(
                          booking.amount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div style={styles.paymentInfo}>
                      <span>Advance Paid</span>

                      <strong>
                        ₹
                        {Number(
                          booking.advanceAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div style={styles.paymentInfo}>
                      <span>
                        Remaining Amount
                      </span>

                      <strong>
                        ₹
                        {Number(remaining).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <button
                      onClick={() =>
                        handlePayment(
                          booking,
                          "final"
                        )
                      }
                      style={styles.payButton}
                    >
                      Pay Remaining ₹
                      {Number(remaining).toLocaleString(
                        "en-IN"
                      )}
                    </button>
                  </div>
                )}

              {/* FINAL PAYMENT NOT REQUESTED */}
              {status === "completed" &&
                booking.finalPaymentStatus ===
                  "not_requested" && (
                  <span style={styles.pendingText}>
                    Waiting for vendor to request final
                    payment
                  </span>
                )}

              {/* FULLY PAID */}
              {status === "completed" &&
                booking.finalPaymentStatus === "paid" && (
                  <span style={styles.paidBadge}>
                    ✓ Fully Paid
                  </span>
                )}

              {/* REVIEW BUTTON */}
              {status === "completed" &&
                booking.finalPaymentStatus === "paid" &&
                !reviewedBookings.includes(
                  booking._id
                ) && (
                  <button
                    onClick={() =>
                      setReviewingBooking(booking)
                    }
                    style={styles.reviewButtonCustomer}
                  >
                    ⭐ Leave a Review
                  </button>
                )}

              {/* REVIEW SUBMITTED */}
              {reviewedBookings.includes(
                booking._id
              ) && (
                <span style={styles.paidBadge}>
                  ✓ Review Submitted
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* REVIEW MODAL */}
      {reviewingBooking && (
        <div
          style={styles.modalOverlay}
          onClick={() =>
            setReviewingBooking(null)
          }
        >
          <div
            style={styles.modalCard}
            className="customer-review-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h2
              style={styles.modalTitle}
              className="customer-review-modal-title"
            >
              Rate{" "}
              {reviewingBooking.vendor?.businessName}
            </h2>

            <div style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    ...styles.star,
                    color:
                      n <= rating
                        ? "#B8935A"
                        : "#DDD",
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              style={styles.reviewTextarea}
              rows="4"
            />

            <div
              style={styles.modalActions}
              className="customer-review-modal-actions"
            >
              <button
                onClick={handleSubmitReview}
                style={styles.primaryButton}
                disabled={submittingReview}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

              <button
                onClick={() =>
                  setReviewingBooking(null)
                }
                style={styles.secondaryButtonModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .customer-bookings-page {
            padding: 30px 20px !important;
          }

          .customer-bookings-header {
            align-items: flex-start !important;
            gap: 20px;
          }

          .customer-bookings-title {
            font-size: 30px !important;
          }

          .customer-bookings-count {
            padding: 15px 20px !important;
            flex-shrink: 0;
          }

          .customer-booking-card {
            padding: 20px !important;
          }

          .customer-booking-details {
            grid-template-columns: 1fr 1fr !important;
          }

          .customer-booking-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px;
          }

          .customer-booking-package {
            gap: 15px;
          }

          .customer-review-modal {
            max-width: 90% !important;
          }
        }

        @media (max-width: 480px) {
          .customer-bookings-page {
            padding: 22px 15px !important;
          }

          .customer-bookings-header {
            flex-direction: column !important;
            align-items: stretch !important;
            margin-bottom: 25px !important;
          }

          .customer-bookings-title {
            font-size: 27px !important;
          }

          .customer-bookings-count {
            align-self: flex-start;
            padding: 12px 18px !important;
          }

          .customer-booking-card {
            padding: 16px !important;
            border-radius: 12px !important;
          }

          .customer-booking-card-header {
            flex-direction: column !important;
            gap: 12px;
          }

          .customer-booking-vendor-info {
            width: 100%;
            min-width: 0;
          }

          .customer-booking-vendor-name {
            font-size: 21px !important;
            line-height: 1.3;
            word-break: break-word;
          }

          .customer-booking-status {
            align-self: flex-start;
          }

          .customer-booking-details {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            padding: 18px 0 !important;
          }

          .customer-booking-package {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .customer-booking-package-info {
            width: 100%;
            min-width: 0;
          }

          .customer-booking-package-price {
            font-size: 17px !important;
          }

          .customer-booking-footer {
            font-size: 11px !important;
          }

          .paymentInfo {
            gap: 12px;
          }

          .paymentInfo span {
            max-width: 60%;
          }

          .paymentInfo strong {
            text-align: right;
            white-space: nowrap;
          }

          .customer-review-modal {
            padding: 20px !important;
            max-width: calc(100% - 30px) !important;
            box-sizing: border-box;
          }

          .customer-review-modal-title {
            font-size: 19px !important;
            line-height: 1.35;
            word-break: break-word;
          }

          .customer-review-modal-actions {
            flex-direction: column !important;
          }

          .customer-review-modal-actions button {
            width: 100%;
            box-sizing: border-box;
          }

          .starRow {
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .customer-bookings-page {
            padding: 18px 12px !important;
          }

          .customer-bookings-title {
            font-size: 24px !important;
          }

          .customer-booking-card {
            padding: 14px !important;
          }

          .customer-booking-vendor-name {
            font-size: 19px !important;
          }

          .customer-booking-details {
            gap: 12px !important;
          }

          .customer-review-modal {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8F6F1",
    padding: "40px",
    boxSizing: "border-box",
  },

  header: {
    maxWidth: "1100px",
    margin: "0 auto 35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  eyebrow: {
    color: "#C47F84",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  title: {
    fontFamily: "Georgia, serif",
    color: "#3D5A50",
    fontSize: "36px",
    margin: 0,
  },

  subtitle: {
    color: "#777",
    marginTop: "10px",
    lineHeight: 1.5,
  },

  countBox: {
    background: "#FFFFFF",
    padding: "18px 25px",
    borderRadius: "12px",
    border: "1px solid #E5DFD5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },

  list: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "25px",
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    borderBottom: "1px solid #EEE",
    paddingBottom: "18px",
  },

  vendorInfo: {
    minWidth: 0,
  },

  smallLabel: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#999",
    margin: 0,
  },

  vendorName: {
    margin: "5px 0",
    color: "#3D5A50",
    fontFamily: "Georgia, serif",
    wordBreak: "break-word",
  },

  category: {
    margin: 0,
    color: "#888",
    wordBreak: "break-word",
  },

  status: {
    padding: "7px 13px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  approved: {
    background: "#E6F3EC",
    color: "#2E7D50",
  },

  completed: {
    background: "#F0EAFB",
    color: "#6B46C1",
  },

  rejected: {
    background: "#FBEAEA",
    color: "#B44B4B",
  },

  pending: {
    background: "#FFF4DD",
    color: "#A06A00",
  },

  details: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    padding: "22px 0",
  },

  detail: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    minWidth: 0,
  },

  detailContent: {
    minWidth: 0,
  },

  icon: {
    fontSize: "22px",
    flexShrink: 0,
  },

  label: {
    fontSize: "12px",
    color: "#999",
    margin: "0 0 4px",
  },

  footer: {
    borderTop: "1px solid #EEE",
    paddingTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px",
    color: "#999",
  },

  successText: {
    color: "#2E7D50",
    fontWeight: "600",
    textAlign: "right",
  },

  rejectText: {
    color: "#B44B4B",
    fontWeight: "600",
    textAlign: "right",
  },

  pendingText: {
    color: "#A06A00",
    fontWeight: "600",
  },

  empty: {
    maxWidth: "700px",
    margin: "80px auto",
    textAlign: "center",
    background: "#FFF",
    padding: "50px",
    borderRadius: "15px",
    boxSizing: "border-box",
  },

  emptyIcon: {
    fontSize: "45px",
  },

  error: {
    maxWidth: "1100px",
    margin: "0 auto 20px",
    padding: "15px",
    background: "#FBEAEA",
    color: "#B44B4B",
    borderRadius: "8px",
    boxSizing: "border-box",
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  payButton: {
    marginTop: "14px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#B8935A",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  paidBadge: {
    marginTop: "14px",
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#E6F3EC",
    color: "#2E7D50",
    fontSize: "12px",
    fontWeight: 600,
  },

  reviewButtonCustomer: {
    marginTop: "14px",
    width: "100%",
    padding: "12px",
    border: "1px solid #B8935A",
    borderRadius: "8px",
    background: "#FFFFFF",
    color: "#B8935A",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(43,43,43,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },

  modalCard: {
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "28px",
    maxWidth: "420px",
    width: "100%",
    boxSizing: "border-box",
  },

  modalTitle: {
    margin: "0 0 18px",
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "#2B2B2B",
  },

  starRow: {
    display: "flex",
    gap: "8px",
    fontSize: "32px",
    marginBottom: "16px",
    cursor: "pointer",
  },

  star: {
    cursor: "pointer",
    transition: "color 0.15s",
  },

  reviewTextarea: {
    width: "100%",
    padding: "12px",
    border: "1px solid #DCD5CA",
    borderRadius: "7px",
    fontSize: "13px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    marginBottom: "16px",
    resize: "vertical",
  },

  modalActions: {
    display: "flex",
    gap: "10px",
  },

  primaryButton: {
    flex: 1,
    padding: "12px",
    background: "#3D5A50",
    color: "#FFF",
    border: "none",
    borderRadius: "7px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  secondaryButtonModal: {
    padding: "12px 20px",
    background: "#FFF",
    color: "#3D5A50",
    border: "1px solid #3D5A50",
    borderRadius: "7px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  packageSection: {
    marginTop: "18px",
    padding: "16px",
    background: "#FAF8F3",
    border: "1px solid #E5DFD5",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    boxSizing: "border-box",
  },

  packageInfo: {
    minWidth: 0,
  },

  packageLabel: {
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#999",
    margin: "0 0 5px",
    fontWeight: 700,
  },

  packageName: {
    display: "block",
    color: "#3D5A50",
    fontSize: "15px",
    wordBreak: "break-word",
  },

  packageType: {
    margin: "4px 0 0",
    color: "#888",
    fontSize: "12px",
  },

  packagePrice: {
    color: "#B8935A",
    fontSize: "18px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  paymentSection: {
    marginTop: "15px",
    padding: "16px",
    background: "#F8F6F1",
    borderRadius: "10px",
    border: "1px solid #E5DFD5",
    boxSizing: "border-box",
  },

  paymentInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "10px",
    fontSize: "13px",
    color: "#777",
  },
};

export default CustomerBookings;