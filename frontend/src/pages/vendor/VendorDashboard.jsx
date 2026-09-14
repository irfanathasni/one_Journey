import { useEffect, useState } from "react";
import {
  createVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  addPackage,
  deletePackage,
} from "../../services/vendorService";
import {
  getVendorBookings,
  updateBookingStatus,
  completeBooking,
  requestFinalPayment,
} from "../../services/bookingService";
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
    price: "",
  });

  const [error, setError] = useState("");
  const [showReapplyForm, setShowReapplyForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [packageForm, setPackageForm] = useState({
    packageType: "Normal",
    packageName: "",
    description: "",
    price: "",
  });

  const [addingPackage, setAddingPackage] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyVendorProfile();
      setVendor(res.data);
    } catch (err) {
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
        error.response?.data || error
      );

      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const res = await getVendorBookings();

      const bookingData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setBookings(bookingData);
    } catch (error) {
      console.error(
        "Failed to fetch vendor bookings:",
        error.response?.data || error
      );

      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      fetchBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update booking"
      );
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await completeBooking(bookingId);
      fetchBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to mark event as completed"
      );
    }
  };

  const handleRequestFinalPayment = async (bookingId) => {
    try {
      await requestFinalPayment(bookingId);
      fetchBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to request final payment"
      );
    }
  };

  const totalRequests = bookings.length;

  const pendingRequests = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "approved" ||
      booking.status === "completed"
  ).length;

  const totalEarned = bookings
    .filter(
      (booking) => booking.status === "approved" || booking.status === "completed"
    )
    .reduce(
      (total, booking) =>
        total + (Number(booking.amount) || 0),
      0
    );

  const profileCompletion = vendor
    ? Math.round(
        ([vendor.businessName, vendor.category, vendor.description].filter(
          Boolean
        ).length /
          3) *
          100
      )
    : 0;

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
      setShowReapplyForm(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit"
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
      setError(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();

    setAddingPackage(true);

    try {
      const res = await addPackage({
        packageType: packageForm.packageType,
        packageName: packageForm.packageName,
        description: packageForm.description,
        price: Number(packageForm.price),
      });

      setVendor(res.data);

      setPackageForm({
        packageType: "Normal",
        packageName: "",
        description: "",
        price: "",
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to add package"
      );
    } finally {
      setAddingPackage(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const res = await deletePackage(packageId);

      setVendor(res.data);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to remove package"
      );
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

        <div className="vendor-create-container" style={styles.createContainer}>
          <div style={styles.createCard}>
            <p style={styles.eyebrow}>ONE JOURNEY</p>

            <h1 style={styles.createTitle}>
              Create Your Vendor Profile
            </h1>

            <p style={styles.createSubtitle}>
              Tell couples about your wedding services
              and start receiving booking requests.
            </p>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <form
              onSubmit={handleCreate}
              style={styles.form}
            >
              <div style={styles.field}>
                <label style={styles.label}>
                  Business Name
                </label>

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

              <div style={styles.field}>
                <label style={styles.label}>
                  Category
                </label>

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

              <div style={styles.field}>
                <label style={styles.label}>Price (₹)</label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 25000"
                  min="0"
                  required
                />
              </div>

              <button
                type="submit"
                className="vendor-full-button"
                style={styles.primaryButton}
              >Create Vendor Profile →</button>
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
              Your vendor profile has been submitted
              successfully. You can access your vendor
              dashboard once an admin approves your
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
                <strong>Reason:</strong>{" "}
                {vendor.rejectionReason}
              </div>
            )}

            <p style={styles.createSubtitle}>
              Please update your profile and submit it
              again for admin review.
            </p>

            <form onSubmit={handleCreate} style={styles.form}>
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
                    <option
                      key={category._id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  style={styles.textarea}
                  rows="5"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 25000"
                  min="0"
                  required
                />
              </div>

              <button
                type="submit"
                className="vendor-full-button"
                style={styles.primaryButton}
              >
                Resubmit for Review →
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main
        className="vendor-dashboard-main"
        style={styles.main}>

        <section
          className="vendor-dashboard-hero"
          style={styles.hero}
        >
          <div>
            <span style={styles.verifiedBadge}>
              {vendor.verificationStatus ===
              "approved"
                ? "✓ Verified"
                : vendor.verificationStatus}
            </span>

            <p style={styles.categoryEyebrow}>
              {vendor.category?.toUpperCase()}
            </p>

            <h1
              className="vendor-dashboard-hero-title"
              style={styles.heroTitle}
            >{vendor.businessName}
            </h1>

            <p style={styles.heroSubtitle}>
              Manage your bookings, availability,
              and vendor profile.
            </p>

            <div style={styles.heroButtons}>
              <button
                className="vendor-responsive-button"
                style={styles.secondaryButton}
                onClick={() => {
                  setFormData({
                    businessName:
                      vendor.businessName || "",
                    category:
                      vendor.category || "",
                    description:
                      vendor.description || "",
                    price: vendor.price || "",
                  });

                  setShowEditForm(true);
                  setError("");
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {showEditForm && (
          <section style={styles.createCard}>
            <p style={styles.eyebrow}>EDIT PROFILE</p>
            <h2 style={styles.createTitle}>Update Your Vendor Profile</h2>
            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={styles.form}>
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

              <div style={styles.field}>
                <label style={styles.label}>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 25000"
                  min="0"
                  required
                />
              </div>

              <div
                className="vendor-dashboard-edit-buttons"
                style={{display: "flex",gap: "10px",}}>
                <button
                  type="submit"
                  className="vendor-responsive-button"
                  style={styles.primaryButton}
                  disabled={updatingProfile}
                >
                  {updatingProfile
                    ? "Saving..."
                    : "Save Changes →"}
                </button>

                <button
                  type="button"
                  className="vendor-responsive-button"
                  style={styles.secondaryButton}
                  onClick={() =>
                    setShowEditForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="vendor-dashboard-stats" style={styles.statsGrid}>
          <StatCard icon="◫" label="New Requests"
            value={loadingBookings ? "..." : pendingRequests} />

          <StatCard
            icon="✓"
            label="Active Bookings"
            value={
              loadingBookings
                ? "..."
                : activeBookings
            }
          />

          <StatCard
            icon="₹"
            label="Total Revenue"
            value={
              loadingBookings
                ? "..."
                : `₹${totalEarned.toLocaleString(
                    "en-IN"
                  )}`
            }
          />
        </section>

        <section style={styles.activity}>
          <div style={styles.activityHeader}>
            <h3 style={styles.activityTitle}>Upcoming Events</h3>
          </div>

          {loadingBookings ? (
            <p>Loading...</p>
          ) : (
            (() => {
              const upcoming = bookings
                .filter(
                  (b) =>
                    (b.status === "approved" ||
                      b.status === "completed") &&
                    b.serviceDate &&
                    new Date(b.serviceDate) >=
                      new Date()
                )
                .sort(
                  (a, b) =>
                    new Date(a.serviceDate) -
                    new Date(b.serviceDate)
                )
                .slice(0, 3);

              return upcoming.length === 0 ? (
                <p>No upcoming events</p>
              ) : (
                upcoming.map((booking) => (
                  <div
                    key={booking._id}
                    className="vendor-dashboard-request-row"
                    style={styles.requestRow}
                  >
                    <div
                      style={styles.requestAvatar}
                    >
                      📅
                    </div>

                    <div
                      style={styles.requestInfo}
                    >
                      <strong>
                        {booking.wedding
                          ?.brideName}{" "}
                        &{" "}
                        {
                          booking.wedding
                            ?.groomName
                        }
                      </strong>

                      <p
                        style={styles.requestMeta}
                      >
                        {new Date(
                          booking.serviceDate
                        ).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                        {" • "}
                        {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                    </div>

                    <span
                      style={styles.archivedText}
                    >
                      {booking.status ===
                      "completed"
                        ? "Completed"
                        : "Confirmed"}
                    </span>
                  </div>
                ))
              );
            })()
          )}
        </section>

        {/* EVENTS */}

        <section style={styles.eventsSection}>
          {loadingBookings ? (
            <p>Loading events...</p>
          ) : (
            (() => {
              const today = new Date();

              today.setHours(0, 0, 0, 0);

              const tomorrow = new Date(today);

              tomorrow.setDate(
                tomorrow.getDate() + 1
              );

              const confirmedBookings =
                bookings.filter(
                  (booking) =>
                    (booking.status === "approved" ||
                      booking.status ===
                        "completed") &&
                    booking.serviceDate
                );

              const currentEvents =
                confirmedBookings.filter(
                  (booking) => {
                    const eventDate = new Date(
                      booking.serviceDate
                    );

                    eventDate.setHours(
                      0,
                      0,
                      0,
                      0
                    );

                    return (
                      eventDate.getTime() ===
                      today.getTime()
                    );
                  }
                );

              const upcomingEvents =
                confirmedBookings
                  .filter((booking) => {
                    const eventDate = new Date(
                      booking.serviceDate
                    );

                    eventDate.setHours(
                      0,
                      0,
                      0,
                      0
                    );

                    return eventDate >= tomorrow;
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.serviceDate) -
                      new Date(b.serviceDate)
                  )
                  .slice(0, 5);

              if (
                currentEvents.length === 0 &&
                upcomingEvents.length === 0
              ) {
                return (
                  <div style={styles.emptyEvents}>
                    <div
                      style={
                        styles.emptyEventIcon
                      }
                    >
                      📅
                    </div>

                    <strong>
                      No upcoming events
                    </strong>

                    <p>
                      Confirmed events will appear
                      here once customers book your
                      services.
                    </p>
                  </div>
                );
              }

              return (
                <div>
                  {currentEvents.length > 0 && (
                    <div style={styles.eventGroup}>
                      <h4
                        style={
                          styles.eventGroupTitle
                        }
                      >
                        Happening Today
                      </h4>

                      {currentEvents.map(
                        (booking) => (
                          <EventCard
                            key={booking._id}
                            booking={booking}
                            current
                          />
                        )
                      )}
                    </div>
                  )}

                  {upcomingEvents.length > 0 && (
                    <div style={styles.eventGroup}>
                      <h4
                        style={
                          styles.eventGroupTitle
                        }
                      >
                        Upcoming Events
                      </h4>

                      {upcomingEvents.map(
                        (booking) => (
                          <EventCard
                            key={booking._id}
                            booking={booking}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </section>


        {vendor.verificationStatus ===
          VENDOR_STATUS.REJECTED && (
          <section style={styles.reapplySection}>
            {!showReapplyForm ? (
              <div
                className="vendor-dashboard-reapply"
                style={styles.reapplyCard}
              >
                <div>
                  <p style={styles.sectionEyebrow}>PROFILE UPDATE</p>
                  <h3 style={styles.reapplyTitle}>
                    Update your profile and
                    reapply
                  </h3>

                  <p style={styles.reapplyText}>
                    Make the required changes and
                    submit your vendor profile again
                    for review.
                  </p>
                </div>

                <button
                  className="vendor-responsive-button"
                  style={styles.primaryButton}
                  onClick={() => {
                    setFormData({
                      businessName:
                        vendor.businessName,
                      category:
                        vendor.category,
                      description:
                        vendor.description || "",
                      price: vendor.price || "",
                    });

                    setShowReapplyForm(true);
                  }}
                >
                  Update & Reapply →
                </button>
              </div>
            ) : (
              <div style={styles.createCard}>
                <p style={styles.eyebrow}>UPDATE PROFILE</p>

                <h2 style={styles.createTitle}>Update Your Vendor Profile</h2>
                {error && (
                  <div style={styles.errorBox}>
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleCreate}
                  style={styles.form}
                >
                  <div style={styles.field}>
                    <label style={styles.label}>Business Name</label>
                    <input name="businessName"
                      value={
                        formData.businessName
                      }
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

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
                      {categories.map(
                        (category) => (
                          <option
                            key={category._id}
                            value={category.name}
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

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

                  <div style={styles.field}>
                    <label style={styles.label}>Price (₹)</label>

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="e.g. 25000"
                      min="0"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="vendor-full-button"
                    style={styles.primaryButton}>
                    Resubmit for Review →
                  </button>
                </form>
              </div>
            )}
          </section>
        )}


        <section style={styles.createCard}>
          <p style={styles.eyebrow}>PACKAGES</p>
          <h2 style={styles.createTitle}>Service Packages</h2>
          <p style={styles.createSubtitle}>
            Create packages that couples can
            choose when booking your service.
          </p>

          {vendor.packages &&
            vendor.packages.length > 0 && (
              <div
                className="vendor-dashboard-package-list"
                style={{
                  marginBottom: "25px",
                }}
              >
                {vendor.packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className="vendor-dashboard-package-row"
                    style={styles.pricingRow}
                  >
                    <div className="vendor-package-info">
                      <strong>
                        {pkg.packageName}
                      </strong>

                      <p
                        style={styles.requestMeta}
                      >
                        {pkg.packageType}
                      </p>

                      <p
                        style={styles.requestMeta}
                      >
                        {pkg.description}
                      </p>
                    </div>

                    <strong className="vendor-package-price">
                      ₹
                      {Number(
                        pkg.price
                      ).toLocaleString("en-IN")}
                    </strong>

                    <button
                      onClick={() =>
                        handleDeletePackage(
                          pkg._id
                        )
                      }
                      style={
                        styles.pricingDeleteBtn
                      }
                      aria-label="Delete package"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

          <form
            onSubmit={handleAddPackage}
            style={styles.form}
          >
            <div style={styles.field}>
              <label style={styles.label}>
                Package Type
              </label>

              <select
                value={packageForm.packageType}
                onChange={(e) =>
                  setPackageForm({
                    ...packageForm,
                    packageType:
                      e.target.value,
                  })
                }
                style={styles.input}
              >
                <option value="Normal">Normal</option>

                <option value="Premium">Premium</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Package Name
              </label>

              <input
                type="text"
                placeholder="e.g. Basic Wedding Package"
                value={packageForm.packageName}
                onChange={(e) =>
                  setPackageForm({
                    ...packageForm,
                    packageName:
                      e.target.value,
                  })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Description
              </label>

              <textarea
                placeholder="Describe what is included in this package"
                value={packageForm.description}
                onChange={(e) =>
                  setPackageForm({
                    ...packageForm,
                    description:
                      e.target.value,
                  })
                }
                style={styles.textarea}
                rows="3"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Price (₹)
              </label>

              <input
                type="number"
                placeholder="e.g. 25000"
                value={packageForm.price}
                onChange={(e) =>
                  setPackageForm({
                    ...packageForm,
                    price: e.target.value,
                  })
                }
                style={styles.input}
                min="0"
                required
              />
            </div>

            <button
              type="submit"
              className="vendor-full-button"
              style={styles.primaryButton}
              disabled={addingPackage}
            >
              {addingPackage
                ? "Adding..."
                : "+ Add Package"}
            </button>
          </form>
        </section>
      </main>

      {/* RESPONSIVE CSS */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .vendor-dashboard-main {
          width: 100%;
          min-width: 0;
        }

        .vendor-dashboard-main input,
        .vendor-dashboard-main select,
        .vendor-dashboard-main textarea {
          max-width: 100%;
        }

        .vendor-dashboard-main h1,
        .vendor-dashboard-main h2,
        .vendor-dashboard-main h3,
        .vendor-dashboard-main h4,
        .vendor-dashboard-main p,
        .vendor-dashboard-main strong {
          overflow-wrap: anywhere;
        }

        .vendor-dashboard-package-row {
          width: 100%;
        }

        .vendor-package-info {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .vendor-package-price {
          flex-shrink: 0;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .vendor-dashboard-main {
            padding: 35px 22px 60px !important;
          }

          .vendor-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .vendor-dashboard-package-row {
            flex-wrap: wrap !important;
          }

          .vendor-dashboard-reapply {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .vendor-dashboard-reapply
          .vendor-responsive-button {
            align-self: flex-start;
          }

          .vendor-dashboard-hero-title {
            font-size: 36px !important;
          }

          .vendor-dashboard-main
          .createCard {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .vendor-dashboard-main {
            padding: 25px 15px 45px !important;
          }

          .vendor-dashboard-stats {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .vendor-dashboard-hero-title {
            font-size: 31px !important;
            line-height: 1.1 !important;
          }

          .vendor-dashboard-main
          .createCard {
            padding: 22px !important;
            border-radius: 12px !important;
          }

          .vendor-dashboard-main
          .requestRow {
            width: 100%;
          }

          .vendor-dashboard-request-row {
            align-items: flex-start !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            padding: 14px !important;
          }

          .vendor-dashboard-request-row
          > div:nth-child(2) {
            flex: 1;
            min-width: 0;
          }

          .vendor-dashboard-request-row
          > span {
            margin-left: auto;
          }

          .vendor-dashboard-edit-buttons {
            flex-direction: column !important;
            width: 100%;
          }

          .vendor-responsive-button,
          .vendor-full-button {
            width: 100% !important;
            min-height: 42px;
          }

          .vendor-dashboard-reapply
          .vendor-responsive-button {
            align-self: stretch !important;
          }

          .vendor-dashboard-package-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 14px !important;
          }

          .vendor-package-price {
            align-self: flex-start;
          }

          .vendor-dashboard-package-row
          button {
            align-self: flex-end;
          }

          .vendor-dashboard-main
          .eventCard {
            width: 100%;
          }

          .vendor-dashboard-main
          .eventCardHeader {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .vendor-dashboard-main
          .eventStatus {
            align-self: flex-start;
          }

          .vendor-dashboard-main
          .eventDetailsGrid {
            grid-template-columns: 1fr !important;
          }

          .vendor-dashboard-main
          .eventTitle {
            font-size: 18px !important;
          }

          .vendor-dashboard-main
          .emptyEvents {
            padding: 25px 18px !important;
          }

          .vendor-create-container {
            padding: 35px 15px !important;
          }
        }

        @media (max-width: 380px) {
          .vendor-dashboard-main {
            padding: 20px 12px 40px !important;
          }

          .vendor-dashboard-hero-title {
            font-size: 27px !important;
          }

          .vendor-dashboard-main
          .createCard {
            padding: 18px !important;
          }

          .vendor-dashboard-main
          .createTitle {
            font-size: 25px !important;
          }

          .vendor-dashboard-main
          .statCard {
            padding: 18px !important;
          }
        }
      `}</style>
    </div>
  );
};

/* ================= STAT CARD ================= */

const StatCard = ({ icon, label, value }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
        {icon}
      </div>

      <p style={styles.statLabel}>
        {label}
      </p>

      <h3 style={styles.statValue}>
        {value}
      </h3>
    </div>
  );
};

/* ================= REQUEST ROW ================= */

const RequestRow = ({
  booking,
  onStatusChange,
  onComplete,
  onRequestFinalPayment,
}) => {
  const customerName =
    booking.customer?.name || "Customer";

  const brideName =
    booking.wedding?.brideName || "";

  const groomName =
    booking.wedding?.groomName || "";

  const weddingName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : "Wedding";

  const serviceDate = booking.serviceDate
    ? new Date(
        booking.serviceDate
      ).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not specified";

  const status =
    booking.status || "pending";

  return (
    <div
      className="vendor-dashboard-request-row"
      style={styles.requestRow}
    >
      <div style={styles.requestAvatar}>
        {customerName
          .charAt(0)
          .toUpperCase()}
      </div>

      <div style={styles.requestInfo}>
        <strong
          style={
            status === "rejected"
              ? styles.strikethrough
              : {}
          }
        >
          {weddingName}
        </strong>

        <p style={styles.requestMeta}>
          {serviceDate} • {customerName}
        </p>

        {status !== "pending" &&
          status !== "rejected" && (
            <p
              style={
                styles.requestStatusLine
              }
            >
              {status === "approved" &&
                (booking.paymentStatus ===
                "paid"
                  ? "Advance paid"
                  : "Awaiting advance payment")}

              {status === "completed" &&
                (booking.finalPaymentStatus ===
                "paid"
                  ? "Fully paid"
                  : booking.finalPaymentStatus ===
                    "requested"
                  ? "Final payment requested"
                  : "Event completed")}
            </p>
          )}
      </div>

      {status === "pending" && (
        <div
          className="vendor-dashboard-request-actions"
          style={styles.requestActions}
        >
          <button
            style={styles.rejectBtn}
            onClick={() =>
              onStatusChange(
                booking._id,
                "rejected"
              )
            }
          >
            Reject
          </button>

          <button
            style={styles.reviewBtn}
            onClick={() =>
              onStatusChange(
                booking._id,
                "approved"
              )
            }
          >
            Review Request
          </button>
        </div>
      )}

      {status === "approved" &&
        booking.paymentStatus === "paid" && (
          <button
            style={styles.reviewBtn}
            onClick={() =>
              onComplete(booking._id)
            }
          >
            Mark Completed
          </button>
        )}

      {status === "approved" &&
        booking.paymentStatus !== "paid" && (
          <span style={styles.archivedText}>
            Awaiting advance
          </span>
        )}

      {status === "completed" &&
        booking.finalPaymentStatus ===
          "not_requested" && (
          <button
            style={styles.reviewBtn}
            onClick={() =>
              onRequestFinalPayment(
                booking._id
              )
            }
          >
            Request Final Payment
          </button>
        )}

      {status === "completed" &&
        booking.finalPaymentStatus ===
          "requested" && (
          <span style={styles.archivedText}>
            Awaiting final payment
          </span>
        )}

      {status === "completed" &&
        booking.finalPaymentStatus ===
          "paid" && (
          <span style={styles.archivedText}>
            ✓ Fully Paid
          </span>
        )}

      {status === "rejected" && (
        <span style={styles.archivedText}>
          Rejected
        </span>
      )}
    </div>
  );
};

/* ================= EVENT CARD ================= */

const EventCard = ({
  booking,
  current = false,
}) => {
  const brideName =
    booking.wedding?.brideName || "";

  const groomName =
    booking.wedding?.groomName || "";

  const weddingName =
    brideName && groomName
      ? `${brideName} & ${groomName}`
      : "Wedding Event";

  const eventDate = booking.serviceDate
    ? new Date(
        booking.serviceDate
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not specified";

  const customerName =
    booking.customer?.name || "Customer";

  const venue =
    booking.wedding?.venue ||
    "Venue not specified";

  const location =
    booking.wedding?.location ||
    "Location not specified";

  const packageName =
    booking.package?.packageName ||
    "Package not specified";

  const paymentStatus =
    booking.finalPaymentStatus === "paid"
      ? "Fully Paid"
      : booking.paymentStatus === "paid"
      ? "Advance Paid"
      : "Payment Pending";

  return (
    <div
      className="vendor-event-card"
      style={{
        ...styles.eventCard,
        ...(current
          ? styles.currentEventCard
          : {}),
      }}
    >
      <div
        className="vendor-event-card-header"
        style={styles.eventCardHeader}
      >
        <div>
          {current && (
            <span style={styles.currentBadge}>
              EVENT TODAY
            </span>
          )}

          <h4
            style={styles.eventTitle}
          >
            {weddingName}
          </h4>

          <p
            style={styles.eventDate}
          >
            {eventDate}
            {" • "}
            {booking.startTime} -{" "}
            {booking.endTime}
          </p>
        </div>

        <span
          className="vendor-event-status"
          style={styles.eventStatus}
        >
          {booking.status === "completed"
            ? "Completed"
            : "Confirmed"}
        </span>
      </div>

      <div
        className="vendor-event-details-grid"
        style={styles.eventDetailsGrid}
      >
        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Venue
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {venue}
          </strong>
        </div>

        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Location
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {location}
          </strong>
        </div>

        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Customer
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {customerName}
          </strong>
        </div>

        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Package
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {packageName}
          </strong>
        </div>

        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Guests
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {booking.wedding?.guestCount ||
              0}
          </strong>
        </div>

        <div style={styles.eventDetail}>
          <span
            style={styles.eventDetailLabel}
          >
            Payment
          </span>

          <strong
            style={styles.eventDetailStrong}
          >
            {paymentStatus}
          </strong>
        </div>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
    color: "#263D36",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    overflowX: "hidden",
    width: "100%",
  },

  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "50px 30px 70px",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
  },

  hero: {
    marginBottom: "20px",
    minWidth: 0,
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
    overflowWrap: "anywhere",
  },

  heroTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "40px",
    lineHeight: 1.05,
    fontWeight: 400,
    color: "#173E35",
    margin: "0 0 10px",
    maxWidth: "600px",
    overflowWrap: "anywhere",
  },

  heroSubtitle: {
    color: "#746F69",
    fontSize: "15px",
    lineHeight: 1.6,
    maxWidth: "550px",
    marginBottom: 0,
    overflowWrap: "anywhere",
  },

  heroButtons: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "15px",
    marginBottom: "35px",
    width: "100%",
  },

  statCard: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 5px 20px rgba(55, 48, 40, 0.04)",
    minWidth: 0,
    boxSizing: "border-box",
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
    overflowWrap: "anywhere",
  },

  statValue: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "27px",
    fontWeight: 400,
    color: "#173E35",
    overflowWrap: "anywhere",
  },

  activity: {
    marginTop: "10px",
    width: "100%",
    minWidth: 0,
  },

  activityHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    gap: "10px",
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
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
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
    overflowWrap: "anywhere",
  },

  requestMeta: {
    margin: "3px 0 0",
    fontSize: "12px",
    color: "#999",
    overflowWrap: "anywhere",
  },

  requestStatusLine: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#B8935A",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },

  strikethrough: {
    textDecoration: "line-through",
    color: "#999",
  },

  requestActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  rejectBtn: {
    border: "1px solid #DCD5CA",
    background: "#FFFFFF",
    color: "#454943",
    borderRadius: "6px",
    padding: "9px 15px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
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
    width: "100%",
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
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  reapplyTitle: {
    margin: "0 0 6px",
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#173E35",
    overflowWrap: "anywhere",
  },

  reapplyText: {
    margin: 0,
    fontSize: "13px",
    color: "#77716B",
    lineHeight: 1.5,
    overflowWrap: "anywhere",
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
    width: "100%",
    boxSizing: "border-box",
  },

  createCard: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "16px",
    padding: "35px",
    boxShadow:
      "0 10px 35px rgba(55, 48, 40, 0.05)",
    marginBottom: "25px",
    width: "100%",
    boxSizing: "border-box",
    minWidth: 0,
  },

  createTitle: {
    fontFamily: "Georgia, serif",
    fontWeight: 400,
    color: "#173E35",
    fontSize: "30px",
    margin: "8px 0",
    overflowWrap: "anywhere",
  },

  createSubtitle: {
    color: "#77716B",
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "25px",
    overflowWrap: "anywhere",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
    width: "100%",
    minWidth: 0,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    width: "100%",
    minWidth: 0,
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
    width: "100%",
    maxWidth: "100%",
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
    width: "100%",
    maxWidth: "100%",
  },

  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "7px",
    padding: "11px 13px",
    fontSize: "13px",
    marginBottom: "15px",
    overflowWrap: "anywhere",
  },

  statusBox: {
    background: "#FFF8EE",
    border: "1px solid #E8D8BC",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    overflowWrap: "anywhere",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#FBF8F3",
    color: "#6B6560",
    padding: "20px",
    boxSizing: "border-box",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  pricingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "10px 14px",
    background: "#FAF9F7",
    border: "1px solid #E5DFD5",
    borderRadius: "7px",
    marginBottom: "8px",
    fontSize: "13px",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  pricingDeleteBtn: {
    border: "none",
    background: "transparent",
    color: "#A33B3B",
    cursor: "pointer",
    fontSize: "14px",
    flexShrink: 0,
  },

  pricingForm: {
    display: "grid",
    gridTemplateColumns:
      "1.2fr 1fr 1fr 1fr auto",
    gap: "10px",
    alignItems: "center",
  },

  eventsSection: {
    marginTop: "10px",
    marginBottom: "35px",
    width: "100%",
    minWidth: 0,
  },

  eventGroup: {
    marginBottom: "25px",
    width: "100%",
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
    boxShadow:
      "0 5px 20px rgba(55, 48, 40, 0.04)",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
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
    marginBottom: "20px",
    minWidth: 0,
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
    overflowWrap: "anywhere",
  },

  eventDate: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#77716B",
    overflowWrap: "anywhere",
  },

  eventStatus: {
    background: "#EEF0EC",
    color: "#3D5A50",
    padding: "6px 10px",
    borderRadius: "15px",
    fontSize: "10px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  eventDetailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
  },

  eventDetail: {
    background: "#FAF9F7",
    border: "1px solid #EEE8DF",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    minWidth: 0,
  },

  eventDetailLabel: {
    fontSize: "10px",
    color: "#999",
  },

  eventDetailStrong: {
    fontSize: "12px",
    color: "#454943",
    overflowWrap: "anywhere",
  },

  emptyEvents: {
    background: "#FFFFFF",
    border: "1px solid #E8E1D7",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    color: "#77716B",
    boxSizing: "border-box",
    width: "100%",
  },

  emptyEventIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },
};

export default VendorDashboard;
