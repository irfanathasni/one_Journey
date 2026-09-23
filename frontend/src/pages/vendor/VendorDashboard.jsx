import { useEffect, useState } from "react";

import {
  createVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
} from "../../services/vendorService";

import { getVendorDashboard } from "../../services/bookingService";

import { VENDOR_STATUS } from "../../constants/vendorStatus";
import VendorNavbar from "../../components/VendorNavbar";
import { getActiveCategories } from "../../services/categoryService";

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    description: "",
  });

  const [error, setError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      activeBookings: 0,
      totalRevenue: 0,
    },
    todayEvents: [],
    upcomingEvents: [],
  });

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
    fetchDashboard();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyVendorProfile();

      setVendor(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch vendor profile:",
        err.response?.data || err,
      );

      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const res = await getActiveCategories();

      setCategories(res.data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch categories:",
        error.response?.data || error,
      );

      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const res = await getVendorDashboard();

      if (res?.data) {
        setDashboardData({
          stats: res.data.stats || {
            totalRequests: 0,
            pendingRequests: 0,
            activeBookings: 0,
            totalRevenue: 0,
          },

          todayEvents: res.data.todayEvents || [],

          upcomingEvents: res.data.upcomingEvents || [],
        });
      }
    } catch (error) {
      console.error(
        "Failed to fetch vendor dashboard:",
        error.response?.data || error,
      );

      setDashboardData({
        stats: {
          totalRequests: 0,
          pendingRequests: 0,
          activeBookings: 0,
          totalRevenue: 0,
        },
        todayEvents: [],
        upcomingEvents: [],
      });
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const res = await createVendorProfile(formData);

      setVendor(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit vendor profile",
      );
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setError("");
    setUpdatingProfile(true);

    try {
      const res = await updateVendorProfile(formData);

      setVendor(res.data);
      setShowEditForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingIcon}>💍</div>

        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={styles.page}>
        <VendorNavbar />

        <div style={styles.createContainer}>
          <div style={styles.createCard}>
            <p style={styles.eyebrow}>ONE JOURNEY</p>

            <h1 style={styles.createTitle}>Create Your Vendor Profile</h1>

            <p style={styles.createSubtitle}>
              Tell couples about your wedding services and start receiving
              booking requests.
            </p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleCreate} style={styles.form}>
              {/* BUSINESS NAME */}

              <div style={styles.field}>
                <label style={styles.label}>Business Name</label>

                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              {/* CATEGORY */}

              <div style={styles.field}>
                <label style={styles.label}>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}

              <div style={styles.field}>
                <label style={styles.label}>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="5"
                  placeholder="Tell couples about your services..."
                />
              </div>

              <button type="submit" style={styles.primaryButton}>
                Create Vendor Profile →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (vendor.verificationStatus === VENDOR_STATUS.PENDING) {
    return (
      <div style={styles.page}>
        <VendorNavbar />

        <main style={styles.main}>
          <section style={styles.createCard}>
            <p style={styles.eyebrow}>VENDOR APPLICATION</p>

            <h1 style={styles.createTitle}>Your profile is under review</h1>

            <p style={styles.createSubtitle}>
              Your vendor profile has been submitted successfully. You can
              access your vendor dashboard once an admin approves your
              application.
            </p>

            <div style={styles.statusBox}>
              Status:{" "}
              <strong
                style={{
                  textTransform: "capitalize",
                }}
              >
                {vendor.verificationStatus}
              </strong>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (vendor.verificationStatus === VENDOR_STATUS.REJECTED) {
    return (
      <div style={styles.page}>
        <VendorNavbar />

        <main style={styles.main}>
          <section style={styles.createCard}>
            <p style={styles.eyebrow}>VENDOR APPLICATION</p>

            <h1 style={styles.createTitle}>Your application was rejected</h1>

            {vendor.rejectionReason && (
              <div style={styles.errorBox}>
                <strong>Reason:</strong> {vendor.rejectionReason}
              </div>
            )}

            <p style={styles.createSubtitle}>
              Please update your profile and submit it again for admin review.
            </p>

            <form onSubmit={handleCreate} style={styles.form}>
              {/* BUSINESS NAME */}

              <div style={styles.field}>
                <label style={styles.label}>Business Name</label>

                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* CATEGORY */}

              <div style={styles.field}>
                <label style={styles.label}>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}

              <div style={styles.field}>
                <label style={styles.label}>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="5"
                />
              </div>

              <button type="submit" style={styles.primaryButton}>
                Resubmit for Review →
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  const { stats, todayEvents, upcomingEvents } = dashboardData;

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <span style={styles.verifiedBadge}>
              {vendor.verificationStatus === "approved"
                ? "✓ Verified"
                : vendor.verificationStatus}
            </span>

            <p style={styles.categoryEyebrow}>
              {vendor.category?.toUpperCase()}
            </p>

            <h1 style={styles.heroTitle}>{vendor.businessName}</h1>

            <p style={styles.heroSubtitle}>
              Manage your bookings, availability, and vendor profile.
            </p>
          </div>
        </section>

        <section style={styles.statsGrid}>
          <StatCard
            icon="◫"
            label="New Requests"
            value={loadingDashboard ? "..." : stats.pendingRequests}
          />

          <StatCard
            icon="✓"
            label="Active Bookings"
            value={loadingDashboard ? "..." : stats.activeBookings}
          />

          <StatCard
            icon="₹"
            label="Total Revenue"
            value={
              loadingDashboard
                ? "..."
                : `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`
            }
          />
        </section>

        <section style={styles.eventsSection}>
          <div style={styles.activityHeader}>
            <h3 style={styles.activityTitle}>Today's Events</h3>
          </div>

          {loadingDashboard ? (
            <p>Loading events...</p>
          ) : todayEvents.length === 0 ? (
            <div style={styles.emptyEvents}>
              <div style={styles.emptyEventIcon}>📅</div>

              <strong>No events today</strong>

              <p>Your confirmed events for today will appear here.</p>
            </div>
          ) : (
            <div>
              {todayEvents.map((booking) => (
                <EventCard key={booking._id} booking={booking} current />
              ))}
            </div>
          )}
        </section>

        <section style={styles.eventsSection}>
          <div style={styles.activityHeader}>
            <h3 style={styles.activityTitle}>Upcoming Events</h3>
          </div>

          {loadingDashboard ? (
            <p>Loading upcoming events...</p>
          ) : upcomingEvents.length === 0 ? (
            <div style={styles.emptyEvents}>
              <div style={styles.emptyEventIcon}>📅</div>

              <strong>No upcoming events</strong>

              <p>
                Confirmed events will appear here once customers book your
                services.
              </p>
            </div>
          ) : (
            <div>
              {upcomingEvents.map((booking) => (
                <EventCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <p style={styles.statLabel}>{label}</p>

      <h3 style={styles.statValue}>{value}</h3>
    </div>
  );
};

const EventCard = ({ booking, current = false }) => {
  const [expanded, setExpanded] = useState(false);

  const brideName = booking.wedding?.brideName || "";

  const groomName = booking.wedding?.groomName || "";

  const weddingName =
    brideName && groomName ? `${brideName} & ${groomName}` : "Wedding Event";

  const eventDate = booking.serviceDate
    ? new Date(booking.serviceDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not specified";

  const venue = booking.wedding?.venue || "Venue not specified";

  const location = booking.wedding?.location || "Location not specified";

  const customerName = booking.customer?.name || "Customer";

  const customerEmail = booking.customer?.email || "Email not specified";

  const customerPhone = booking.customer?.phone || "Phone not specified";

  const packageName = booking.package?.packageName || "Package not specified";

  const guestCount = booking.wedding?.guestCount || 0;

  const paymentStatus =
    booking.finalPaymentStatus === "paid"
      ? "Fully Paid"
      : booking.paymentStatus === "paid"
        ? "Advance Paid"
        : "Payment Pending";

  return (
    <div
      style={{
        ...styles.eventCard,
        ...(current ? styles.currentEventCard : {}),
      }}
    >
      <div style={styles.eventCardHeader}>
        <div style={{ flex: 1 }}>
          {current && <span style={styles.currentBadge}>EVENT TODAY</span>}

          <h4 style={styles.eventTitle}>{weddingName}</h4>

          <p style={styles.eventDate}>
            {eventDate}
            {" • "}
            {booking.startTime || "--"} - {booking.endTime || "--"}
          </p>
        </div>

        <div style={styles.eventCardRight}>
          {/* STATUS */}

          <span style={styles.eventStatus}>
            {booking.status === "completed" ? "Completed" : "Confirmed"}
          </span>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={styles.expandButton}
            aria-label={expanded ? "Hide event details" : "Show event details"}
          >
            {expanded ? "🔼" : "🔽"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={styles.expandedDetails}>
          <div style={styles.eventDetailsGrid}>
            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Venue</span>

              <strong style={styles.eventDetailStrong}>{venue}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Location</span>

              <strong style={styles.eventDetailStrong}>{location}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Customer</span>

              <strong style={styles.eventDetailStrong}>{customerName}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Email</span>

              <strong style={styles.eventDetailStrong}>{customerEmail}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Phone</span>

              <strong style={styles.eventDetailStrong}>{customerPhone}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Package</span>

              <strong style={styles.eventDetailStrong}>{packageName}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Guests</span>

              <strong style={styles.eventDetailStrong}>{guestCount}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Payment</span>

              <strong style={styles.eventDetailStrong}>{paymentStatus}</strong>
            </div>

            <div style={styles.eventDetail}>
              <span style={styles.eventDetailLabel}>Booking Amount</span>

              <strong style={styles.eventDetailStrong}>
                ₹{Number(booking.amount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
    color: "#263D36",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "50px 30px 70px",
    boxSizing: "border-box",
  },

  hero: {
    marginBottom: "20px",
  },

  eyebrow: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#B8935A",
    fontWeight: 600,
    margin: "0 0 10px",
  },

  verifiedBadge: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "20px",
    background: "#F0EDE6",
    color: "#3D5A50",
    fontSize: "11px",
    fontWeight: 600,
    marginBottom: "12px",
  },

  categoryEyebrow: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#B8935A",
    fontWeight: 600,
    margin: "0 0 8px",
  },

  heroTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "40px",
    lineHeight: 1.05,
    fontWeight: 400,
    color: "#173E35",
    margin: "0 0 10px",
    maxWidth: "600px",
  },

  heroSubtitle: {
    color: "#746F69",
    fontSize: "15px",
    lineHeight: 1.6,
    maxWidth: "550px",
    marginBottom: 0,
  },

  heroButtons: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "35px",
  },

  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "12px",
    padding: "22px",
    boxShadow: "0 5px 20px rgba(55, 48, 40, 0.04)",
  },

  statIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#F5EBD9",
    color: "#A97A31",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
    fontSize: "17px",
  },

  statLabel: {
    margin: "0 0 7px",
    fontSize: "12px",
    color: "#77716B",
  },

  statValue: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "27px",
    fontWeight: 400,
    color: "#173E35",
  },

  activityHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  activityTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    fontWeight: 400,
    color: "#173E35",
    margin: 0,
  },

  requestRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "10px",
  },

  requestAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#EEF0EC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3D5A50",
    fontWeight: 600,
    flexShrink: 0,
  },

  requestInfo: {
    flex: 1,
    minWidth: 0,
  },

  requestMeta: {
    margin: "3px 0 0",
    fontSize: "12px",
    color: "#999",
  },

  requestStatusLine: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#B8935A",
    fontWeight: 600,
  },

  strikethrough: {
    textDecoration: "line-through",
    color: "#999",
  },

  requestActions: {
    display: "flex",
    gap: "8px",
  },

  rejectBtn: {
    border: "1px solid #DCD5CA",
    background: "#FFFFFF",
    color: "#454943",
    borderRadius: "6px",
    padding: "9px 15px",
    fontSize: "12px",
    cursor: "pointer",
  },

  reviewBtn: {
    border: "none",
    background: "#173E35",
    color: "#FFFFFF",
    borderRadius: "6px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  archivedText: {
    fontSize: "12px",
    color: "#999",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  reapplySection: {
    marginTop: "40px",
  },

  reapplyCard: {
    background: "#FFF8EE",
    border: "1px solid #E8D8BC",
    borderRadius: "12px",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  reapplyTitle: {
    margin: "0 0 6px",
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#173E35",
  },

  reapplyText: {
    margin: 0,
    fontSize: "13px",
    color: "#77716B",
  },

  sectionEyebrow: {
    margin: "0 0 5px",
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#B8935A",
    fontWeight: 600,
  },

  primaryButton: {
    background: "#174D40",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    padding: "11px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  secondaryButton: {
    background: "#FFFFFF",
    color: "#174D40",
    border: "1px solid #174D40",
    borderRadius: "7px",
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  createContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "70px 25px",
  },

  createCard: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 10px 35px rgba(55, 48, 40, 0.05)",
    marginBottom: "25px",
  },

  createTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#173E35",
    fontSize: "30px",
    margin: "8px 0",
  },

  createSubtitle: {
    color: "#77716B",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "25px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    color: "#454943",
    fontWeight: 600,
  },

  input: {
    padding: "12px 13px",
    border: "1px solid #DCD5CA",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    background: "#FFFFFF",
    boxSizing: "border-box",
  },

  textarea: {
    padding: "12px 13px",
    border: "1px solid #DCD5CA",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "7px",
    padding: "11px 13px",
    fontSize: "13px",
    marginBottom: "15px",
  },

  statusBox: {
    background: "#FFF8EE",
    border: "1px solid #E8D8BC",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF8F3",
    color: "#6B6560",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  eventsSection: {
    marginTop: "10px",
    marginBottom: "35px",
  },

  eventGroup: {
    marginBottom: "25px",
  },

  eventGroupTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#173E35",
    margin: "0 0 12px",
  },

  eventCard: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "12px",
    boxShadow: "0 5px 20px rgba(55, 48, 40, 0.04)",
  },

  currentEventCard: {
    border: "1px solid #B8935A",
    background: "#FFFDF8",
  },

  eventCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  eventCardRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  currentBadge: {
    display: "inline-block",
    background: "#F5EBD9",
    color: "#A66B00",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "1px",
    padding: "4px 8px",
    borderRadius: "12px",
    marginBottom: "7px",
  },

  eventTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    fontWeight: 400,
    color: "#173E35",
  },

  eventDate: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#77716B",
  },

  eventStatus: {
    background: "#EEF0EC",
    color: "#3D5A50",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "10px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  expandButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },

  expandedDetails: {
    borderTop: "1px solid #EEE8DF",
    paddingTop: "15px",
    marginTop: "18px",
  },

  eventDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },

  eventDetail: {
    background: "#FAF9F7",
    border: "1px solid #EEE8DF",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  eventDetailLabel: {
    fontSize: "10px",
    color: "#999",
  },

  eventDetailStrong: {
    fontSize: "12px",
    color: "#454943",
    wordBreak: "break-word",
  },

  emptyEvents: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    color: "#77716B",
  },

  emptyEventIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },
};

export default VendorDashboard;
