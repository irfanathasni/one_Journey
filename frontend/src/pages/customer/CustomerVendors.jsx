import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendors } from "../../services/vendorService";
import { getActiveCategories } from "../../services/categoryService";

const CustomerVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, [category]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getVendors(category);
      setVendors(res.data || []);
    } catch (err) {
      console.error("Vendor error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load vendors"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getActiveCategories();

      setCategories(
        Array.isArray(res.data.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error("Category error:", error);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = search.toLowerCase();

    return (
      vendor.businessName
        ?.toLowerCase()
        .includes(searchText) ||
      vendor.category
        ?.toLowerCase()
        .includes(searchText) ||
      vendor.description
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  return (
    <div
      className="customer-vendors-page"
      style={styles.page}
    >
      {/* =========================
          HERO
      ========================= */}

      <section
        className="customer-vendors-hero"
        style={styles.hero}
      >
        <div className="customer-vendors-hero-content">
          <p style={styles.eyebrow}>
            ONE JOURNEY
          </p>

          <h1
            className="customer-vendors-title"
            style={styles.title}
          >
            Find the perfect vendors
            <br className="customer-vendors-title-break" />
            for your special day
          </h1>

          <p
            className="customer-vendors-subtitle"
            style={styles.subtitle}
          >
            Discover trusted wedding professionals and make
            every moment of your celebration unforgettable.
          </p>
        </div>

        <div
          className="customer-vendors-hero-icon"
          style={styles.heroIcon}
        >
          💍
        </div>
      </section>

      {/* =========================
          SEARCH
      ========================= */}

      <div
        className="customer-vendors-search-wrapper"
        style={styles.searchWrapper}
      >
        <span style={styles.searchIcon}>
          🔍
        </span>

        <input
          type="text"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={styles.searchInput}
        />
      </div>

      {/* =========================
          CATEGORY HEADER
      ========================= */}

      <div
        className="customer-vendors-section-header"
        style={styles.sectionHeader}
      >
        <div>
          <p style={styles.smallTitle}>
            EXPLORE
          </p>

          <h2
            className="customer-vendors-section-title"
            style={styles.sectionTitle}
          >
            Browse by category
          </h2>
        </div>
      </div>

      {/* =========================
          CATEGORY FILTERS
      ========================= */}

      <div
        className="customer-vendors-filter-container"
        style={styles.filterContainer}
      >
        <button
          onClick={() => setCategory("")}
          style={{
            ...styles.filterButton,
            ...(category === ""
              ? styles.activeFilter
              : {}),
          }}
        >
          All
        </button>

        {categories.map((item) => (
          <button
            key={item._id}
            onClick={() =>
              setCategory(item.name)
            }
            style={{
              ...styles.filterButton,
              ...(category === item.name
                ? styles.activeFilter
                : {}),
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* =========================
          RESULT COUNT
      ========================= */}

      {!loading && !error && (
        <div
          className="customer-vendors-result-header"
          style={styles.resultHeader}
        >
          <p>
            <strong>
              {filteredVendors.length}
            </strong>{" "}
            {filteredVendors.length === 1
              ? "vendor"
              : "vendors"}{" "}
            found
          </p>
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <div
          className="customer-vendors-loading"
          style={styles.loading}
        >
          <div style={styles.loadingIcon}>
            💍
          </div>

          <p>
            Finding the perfect vendors...
          </p>
        </div>
      ) : filteredVendors.length === 0 ? (
        /* =========================
           EMPTY
        ========================= */

        <div
          className="customer-vendors-empty"
          style={styles.empty}
        >
          <div style={styles.emptyIcon}>
            🔍
          </div>

          <h2>No vendors found</h2>

          <p>
            We couldn't find any vendors matching
            your search.
          </p>

          <button
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
            style={styles.resetButton}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* =========================
           VENDOR GRID
        ========================= */

        <div
          className="customer-vendors-grid"
          style={styles.grid}
        >
          {filteredVendors.map((vendor) => (
            <div
              key={vendor._id}
              className="customer-vendor-card"
              style={styles.card}
            >
              {/* Card Top */}

              <div style={styles.cardTop}>
                <div
                  className="customer-vendor-icon"
                  style={styles.vendorIcon}
                >
                  💍
                </div>

                <span
                  className="customer-vendor-status"
                  style={styles.status}
                >
                  ✓ Approved
                </span>
              </div>

              {/* Business Name */}

              <h2
                className="customer-vendor-business-name"
                style={styles.businessName}
              >
                {vendor.businessName}
              </h2>

              {/* Category */}

              <p style={styles.category}>
                {vendor.category}
              </p>

              {/* Description */}

              <p
                className="customer-vendor-description"
                style={styles.description}
              >
                {vendor.description ||
                  "A trusted wedding professional ready to make your special day memorable."}
              </p>

              {/* =========================
                  PACKAGES
              ========================= */}

              {vendor.packages?.length > 0 && (
                <div
                  className="customer-vendor-package-preview"
                  style={styles.packagePreview}
                >
                  <div
                    style={styles.packageTitle}
                  >
                    Service Packages
                  </div>

                  {vendor.packages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="customer-vendor-package-row"
                      style={styles.packageRow}
                    >
                      <div className="customer-vendor-package-info">
                        <strong
                          style={styles.packageName}
                        >
                          {pkg.packageName}
                        </strong>

                        <span
                          style={styles.packageType}
                        >
                          {pkg.packageType}
                        </span>
                      </div>

                      <strong
                        style={styles.packagePrice}
                      >
                        ₹
                        {Number(
                          pkg.price
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {/* =========================
                  CONTACT
              ========================= */}

              {vendor.user && (
                <div style={styles.contact}>
                  <div style={styles.contactRow}>
                    <span>👤</span>

                    <span className="customer-vendor-contact-text">
                      {vendor.user.name}
                    </span>
                  </div>

                  {vendor.user.phone && (
                    <div
                      style={styles.contactRow}
                    >
                      <span>📞</span>

                      <span className="customer-vendor-contact-text">
                        {vendor.user.phone}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* =========================
                  VIEW DETAILS
              ========================= */}

              <button
                className="customer-vendor-view-button"
                style={styles.viewButton}
                onClick={() => {
                  console.log(
                    "Navigating to:",
                    `/customer/vendor/${vendor._id}`
                  );

                  navigate(
                    `/customer/vendor/${vendor._id}`
                  );
                }}
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          RESPONSIVE CSS
      ========================= */}

      <style>{`
        /* =================================
           TABLET
        ================================= */

        @media (max-width: 768px) {
          .customer-vendors-page {
            padding: 25px 20px !important;
          }

          /* Hero */

          .customer-vendors-hero {
            padding: 32px 28px !important;
            margin-bottom: 25px !important;
            border-radius: 16px !important;
          }

          .customer-vendors-title {
            font-size: 29px !important;
            line-height: 1.25 !important;
          }

          .customer-vendors-subtitle {
            font-size: 13px !important;
            line-height: 1.6 !important;
            margin-top: 12px !important;
          }

          .customer-vendors-hero-icon {
            width: 70px !important;
            height: 70px !important;
            font-size: 30px !important;
            flex-shrink: 0;
          }

          /* Search */

          .customer-vendors-search-wrapper {
            margin-bottom: 28px !important;
          }

          .customer-vendors-section-title {
            font-size: 22px !important;
          }

          /* Filters */

          .customer-vendors-filter-container {
            gap: 8px !important;
          }

          .customer-vendors-filter-container button {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }

          /* Grid */

          .customer-vendors-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;
            gap: 15px !important;
          }

          /* Card */

          .customer-vendor-card {
            padding: 18px !important;
            border-radius: 13px !important;
          }

          .customer-vendor-business-name {
            font-size: 19px !important;
            line-height: 1.3;
            word-break: break-word;
          }

          .customer-vendor-description {
            font-size: 12px !important;
            line-height: 1.55 !important;
            min-height: auto !important;
          }

          .customer-vendor-icon {
            width: 46px !important;
            height: 46px !important;
            font-size: 21px !important;
          }

          .customer-vendor-status {
            font-size: 10px !important;
            padding: 5px 8px !important;
          }

          /* Package */

          .customer-vendor-package-row {
            padding: 9px 10px !important;
          }

          .customer-vendor-package-row strong {
            word-break: break-word;
          }

          .customer-vendor-package-info {
            min-width: 0;
          }

          /* Contact */

          .customer-vendor-contact-text {
            word-break: break-word;
          }
        }

        /* =================================
           MOBILE
        ================================= */

        @media (max-width: 480px) {
          .customer-vendors-page {
            padding: 20px 15px !important;
          }

          /* Hero */

          .customer-vendors-hero {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 27px 22px !important;
            margin-bottom: 22px !important;
            border-radius: 14px !important;
          }

          .customer-vendors-title {
            font-size: 25px !important;
            line-height: 1.25 !important;
          }

          .customer-vendors-title-break {
            display: none;
          }

          .customer-vendors-subtitle {
            font-size: 12px !important;
            line-height: 1.6 !important;
            margin-top: 11px !important;
          }

          .customer-vendors-hero-icon {
            width: 58px !important;
            height: 58px !important;
            font-size: 25px !important;
            align-self: flex-end;
            margin-top: -8px;
          }

          /* Search */

          .customer-vendors-search-wrapper {
            margin-bottom: 25px !important;
          }

          .customer-vendors-search-wrapper input {
            padding: 13px 15px 13px 43px !important;
            font-size: 13px !important;
          }

          .customer-vendors-section-title {
            font-size: 21px !important;
          }

          /* Filters */

          .customer-vendors-filter-container {
            margin-bottom: 20px !important;
            gap: 7px !important;
          }

          .customer-vendors-filter-container button {
            padding: 8px 12px !important;
            font-size: 11px !important;
          }

          /* Results */

          .customer-vendors-result-header {
            margin-bottom: 12px !important;
          }

          /* Grid */

          .customer-vendors-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          /* Vendor Card */

          .customer-vendor-card {
            padding: 18px !important;
          }

          .customer-vendor-business-name {
            margin-top: 16px !important;
            font-size: 20px !important;
          }

          .customer-vendor-description {
            font-size: 13px !important;
            line-height: 1.6 !important;
          }

          /* Package */

          .customer-vendor-package-row {
            align-items: flex-start !important;
          }

          .customer-vendor-package-info {
            flex: 1;
            min-width: 0;
          }

          .customer-vendor-package-row .package-price {
            flex-shrink: 0;
          }

          /* Button */

          .customer-vendor-view-button {
            padding: 12px !important;
          }

          /* Loading */

          .customer-vendors-loading {
            padding: 45px 20px !important;
          }

          /* Empty */

          .customer-vendors-empty {
            padding: 50px 20px !important;
          }

          .customer-vendors-empty h2 {
            font-size: 21px;
          }

          .customer-vendors-empty p {
            font-size: 13px;
            line-height: 1.5;
          }
        }

        /* =================================
           VERY SMALL MOBILE
        ================================= */

        @media (max-width: 360px) {
          .customer-vendors-page {
            padding: 18px 12px !important;
          }

          .customer-vendors-hero {
            padding: 23px 18px !important;
          }

          .customer-vendors-title {
            font-size: 22px !important;
          }

          .customer-vendors-subtitle {
            font-size: 11px !important;
          }

          .customer-vendors-filter-container button {
            padding: 7px 10px !important;
          }

          .customer-vendor-card {
            padding: 15px !important;
          }

          .customer-vendor-business-name {
            font-size: 19px !important;
          }

          .customer-vendor-package-row {
            padding: 8px !important;
            gap: 7px !important;
          }

          .customer-vendor-package-row .package-price {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
    padding: "40px 50px",
    boxSizing: "border-box",
  },

  hero: {
    maxWidth: "1100px",
    margin: "0 auto 35px",
    background:
      "linear-gradient(135deg, #F5E9E8, #F8F2E9)",
    borderRadius: "20px",
    padding: "45px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#B8935A",
    fontSize: "12px",
    letterSpacing: "3px",
    fontWeight: 700,
  },

  title: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "38px",
    lineHeight: 1.2,
    fontWeight: 400,
    color: "#2B2B2B",
  },

  subtitle: {
    maxWidth: "600px",
    margin: "15px 0 0",
    color: "#6B6560",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  heroIcon: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.06)",
  },

  searchWrapper: {
    maxWidth: "1100px",
    margin: "0 auto 35px",
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 20px 15px 48px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#DDD5C9",
    borderRadius: "12px",
    background: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    color: "#2B2B2B",
  },

  sectionHeader: {
    maxWidth: "1100px",
    margin: "0 auto 15px",
  },

  smallTitle: {
    margin: 0,
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#B8935A",
    fontWeight: 700,
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontFamily: "Georgia, serif",
    fontSize: "24px",
    fontWeight: 400,
    color: "#2B2B2B",
  },

  filterContainer: {
    maxWidth: "1100px",
    margin: "0 auto 25px",
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  filterButton: {
    padding: "9px 17px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#D8D2C7",
    borderRadius: "20px",
    background: "#FFFFFF",
    color: "#6B6560",
    cursor: "pointer",
    fontSize: "13px",
  },

  activeFilter: {
    background: "#3D5A50",
    color: "#FFFFFF",
    borderColor: "#3D5A50",
  },

  resultHeader: {
    maxWidth: "1100px",
    margin: "0 auto 15px",
    color: "#7A746D",
    fontSize: "13px",
  },

  grid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#FFFFFF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E5DFD5",
    borderRadius: "16px",
    padding: "23px",
    boxSizing: "border-box",
    transition: "transform 0.2s ease",
    minWidth: 0,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  vendorIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#F5E9E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },

  status: {
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#E8F1EC",
    color: "#3D5A50",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  businessName: {
    margin: "20px 0 5px",
    fontFamily: "Georgia, serif",
    fontSize: "21px",
    fontWeight: 400,
    color: "#2B2B2B",
    overflowWrap: "anywhere",
  },

  category: {
    margin: "0 0 12px",
    color: "#B8935A",
    fontSize: "12px",
    fontWeight: 700,
  },

  description: {
    color: "#6B6560",
    fontSize: "13px",
    lineHeight: 1.6,
    minHeight: "42px",
    margin: 0,
  },

  contact: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#EEE8DF",
  },

  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "7px",
    color: "#6B6560",
    fontSize: "12px",
    minWidth: 0,
  },

  viewButton: {
    width: "100%",
    marginTop: "18px",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    background: "#3D5A50",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  loading: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "60px",
    textAlign: "center",
    background: "#FFFFFF",
    borderRadius: "16px",
    color: "#6B6560",
    boxSizing: "border-box",
  },

  loadingIcon: {
    fontSize: "30px",
    marginBottom: "10px",
  },

  empty: {
    maxWidth: "1100px",
    margin: "20px auto",
    padding: "70px 30px",
    textAlign: "center",
    background: "#FFFFFF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E5DFD5",
    borderRadius: "16px",
    color: "#6B6560",
    boxSizing: "border-box",
  },

  emptyIcon: {
    fontSize: "35px",
  },

  resetButton: {
    marginTop: "15px",
    padding: "9px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#3D5A50",
    color: "#FFFFFF",
    cursor: "pointer",
  },

  error: {
    maxWidth: "1100px",
    boxSizing: "border-box",
    margin: "0 auto 20px",
    padding: "12px",
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "8px",
    fontSize: "13px",
  },

  packagePreview: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid #EEE8DF",
  },

  packageTitle: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#999",
    fontWeight: 600,
    marginBottom: "10px",
  },

  packageRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    marginBottom: "7px",
    background: "#FAF9F6",
    border: "1px solid #E8E2D9",
    borderRadius: "8px",
    minWidth: 0,
  },

  packageName: {
    display: "block",
    fontSize: "12px",
    color: "#3D5A50",
    overflowWrap: "anywhere",
  },

  packageType: {
    display: "inline-block",
    marginTop: "3px",
    fontSize: "10px",
    color: "#B8935A",
    fontWeight: 600,
  },

  packagePrice: {
    fontSize: "12px",
    color: "#2B2B2B",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};

export default CustomerVendors;