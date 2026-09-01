import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { getVendors } from "../../services/vendorService";
import { getActiveCategories } from "../../services/categoryService";

const CustomerVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate()

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
        err.response?.data?.message ||"Failed to load vendors")
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
}

  const filteredVendors = vendors.filter((vendor) => {
    const searchText = search.toLowerCase();
    return (
      vendor.businessName?.toLowerCase().includes(searchText) ||
      vendor.category?.toLowerCase().includes(searchText) ||
      vendor.description?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>ONE JOURNEY</p>

          <h1 style={styles.title}>Find the perfect vendors
            <br />for your special day</h1>

          <p style={styles.subtitle}>
            Discover trusted wedding professionals and make
            every moment of your celebration unforgettable.
          </p>
        </div>

        <div style={styles.heroIcon}>
          💍
        </div>
      </section>
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>🔍</span>

        <input type="text" placeholder="Search vendors..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={styles.searchInput} />
      </div>

      <div style={styles.sectionHeader}>
        <div>
          <p style={styles.smallTitle}>EXPLORE</p>
          <h2 style={styles.sectionTitle}>
            Browse by category
          </h2>
        </div>
      </div>

      <div style={styles.filterContainer}>

      <button onClick={() => setCategory("")}
          style={{...styles.filterButton,...(category === "" ? styles.activeFilter : {})}}>
          All
      </button>

        {categories.map((item) => (
    <button key={item._id} onClick={() => setCategory(item.name)}
          style={{...styles.filterButton,...(category === item.name
          ? styles.activeFilter
          : {})}}>{item.name}
    </button>
  ))}

</div>
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <div style={styles.resultHeader}>
          <p>
            <strong>{filteredVendors.length}</strong>{" "}
            {filteredVendors.length === 1
              ? "vendor"
              : "vendors"}{" "}
            found
          </p>
        </div>
      )}
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.loadingIcon}>💍</div>
          <p>Finding the perfect vendors...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
       
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🔍</div>

          <h2>No vendors found</h2>

          <p>
            We couldn't find any vendors matching your search.
          </p>

          <button onClick={() => {setSearch("")
            setCategory("")}} style={styles.resetButton}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
  {filteredVendors.map((vendor) => (
    <div key={vendor._id} style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.vendorIcon}>
          💍
        </div>
        <span style={styles.status}>
          ✓ Approved
        </span>
      </div>

        
              <h2 style={styles.businessName}>
                {vendor.businessName}
              </h2>
              <p style={styles.category}>
                {vendor.category}
              </p>
              <p style={styles.description}>
                {vendor.description ||
                  "A trusted wedding professional ready to make your special day memorable."}
              </p>

              {vendor.user && (
                <div style={styles.contact}>

                  <div style={styles.contactRow}>
                    <span>👤</span>
                    <span>{vendor.user.name}</span>
                  </div>

                  {vendor.user.phone && (
                    <div style={styles.contactRow}>
                      <span>📞</span>
                      <span>{vendor.user.phone}</span>
                    </div>
                  )}

                </div>
              )}
             <button style={styles.viewButton} onClick={() => {
                console.log("Navigating to:", `/customer/vendor/${vendor._id}`)
            navigate(`/customer/vendor/${vendor._id}`)}}>View Details →</button>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}

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
    background: "linear-gradient(135deg, #F5E9E8, #F8F2E9)",
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
    boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
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
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  },

  status: {
    padding: "6px 10px",
    borderRadius: "15px",
    background: "#E8F1EC",
    color: "#3D5A50",
    fontSize: "11px",
    fontWeight: 600,
  },

  businessName: {
    margin: "20px 0 5px",
    fontFamily: "Georgia, serif",
    fontSize: "21px",
    fontWeight: 400,
    color: "#2B2B2B",
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
};

export default CustomerVendors
