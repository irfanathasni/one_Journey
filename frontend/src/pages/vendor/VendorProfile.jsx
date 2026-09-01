import { useEffect, useState } from "react";
import VendorNavbar from "../../components/VendorNavbar";
import { getMyVendorProfile, updateVendorProfile } from "../../services/vendorService";
import { getActiveCategories } from "../../services/categoryService";

const VendorProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ businessName: "", category: "", description: "", price: "" ,pricing:[]})
  const [updateError, setUpdateError] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyVendorProfile();
      setVendor(res.data);
    } catch (error) {
      console.error("Profile error:", error);
      setError(
        error.response?.data?.message ||
        "Failed to load vendor profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getActiveCategories();
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error.response?.data || error);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

 const addPricing = () => {
  setFormData({
    ...formData,
    pricing: [
      ...formData.pricing,
      {
        eventType: "",
        minGuests: "",
        maxGuests: "",
        price: "",
      },
    ],
  });
}

const removePricing = (index) => {
  setFormData({
    ...formData,
    pricing: formData.pricing.filter((_, i) => i !== index)
  });
};

const handlePricingChange = (index, field, value) => {
  const updatedPricing = [...formData.pricing]
  updatedPricing[index] = {...updatedPricing[index],[field]: value}

  setFormData({...formData,pricing: updatedPricing})
}

const openEditModal = () => {
    setFormData({
      businessName: vendor?.businessName || "",
      category: vendor?.category || "",
      description: vendor?.description || "",
      price: vendor?.price || "",
      pricing:vendor?.pricing || []
    });
    setUpdateError("");
    setShowEditModal(true);
  };

const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setUpdateError("");
  setUpdatingProfile(true);

for (const item of formData.pricing) {
  if (!item.eventType) {
    setUpdateError("Please select an event type for all pricing rules.");
    setUpdatingProfile(false);
    return;
  }

  if (
    item.minGuests === "" ||
    item.maxGuests === "" ||
    Number(item.minGuests) >= Number(item.maxGuests)
  ) {
    setUpdateError("Maximum guests must be greater than minimum guests.");
    setUpdatingProfile(false);
    return;
  }

  if (item.price === "" || Number(item.price) < 0) {
    setUpdateError("Please enter a valid price.");
    setUpdatingProfile(false);
    return;
  }
}

  try {

    const data = {
      businessName: formData.businessName,
      category: formData.category,
      description: formData.description,
      price: Number(formData.price) || 0,

      pricing: formData.pricing.map((item) => ({
        eventType: item.eventType,
        minGuests: Number(item.minGuests),
        maxGuests: Number(item.maxGuests),
        price: Number(item.price)
      }))
    };

    const res = await updateVendorProfile(data)
    setVendor(res.data)
    setShowEditModal(false)
  } catch (err) {
    setUpdateError(err.response?.data?.message ||"Failed to update profile")
  } finally {
    setUpdatingProfile(false)
  }
};

  if (loading) {
    return (
      <div style={styles.page}>
        <VendorNavbar />
        <div style={styles.center}>
          <div style={styles.loadingIcon}>💍</div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <VendorNavbar />
        <div style={styles.center}>
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VENDOR PROFILE</p>
            <h1 style={styles.title}>My Profile</h1>
            <p style={styles.subtitle}>
              Manage and view your vendor information.
            </p>
          </div>
        </div>

        <section style={styles.card}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {vendor?.businessName?.charAt(0).toUpperCase()}
            </div>

            <div style={styles.profileHeaderText}>
              <h2 style={styles.businessName}>{vendor?.businessName}</h2>
              <p style={styles.category}>{vendor?.category}</p>
            </div>

            <span style={styles.status}>✓ {vendor?.verificationStatus}</span>

            <button style={styles.editButton} onClick={openEditModal}>Edit Profile</button>
          </div>

          <div style={styles.divider} />
          <div style={styles.infoGrid}>

            <div style={styles.infoItem}>
              <span style={styles.label}>Business Name</span>
              <strong>{vendor?.businessName}</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Category</span>
              <strong>{vendor?.category}</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Description</span>
              <strong>{vendor?.description || "No description added"}</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Price</span>
              <strong>₹{vendor?.price?.toLocaleString("en-IN") || "Not set"}</strong>
            </div>
            
              {vendor?.pricing?.length > 0 && (
  <div style={styles.pricingDisplay}>
    <span style={styles.label}>Guest Based Pricing</span>

    <div style={styles.pricingList}>
      {vendor.pricing.map((item, index) => (
        <div key={index} style={styles.pricingDisplayRow}>

          <div>
            <div style={styles.eventType}>
              {item.eventType}
            </div>

            <div style={styles.guestRangeText}>
              {item.minGuests} – {item.maxGuests} guests
            </div>
          </div>

          <strong style={styles.pricingAmount}>
            ₹{Number(item.price).toLocaleString("en-IN")}
          </strong>

        </div>
      ))}
    </div>
  </div>
)}
            <div style={styles.infoItem}>
              <span style={styles.label}>Verification Status</span>
              <strong>{vendor?.verificationStatus}</strong>
            </div>
          </div>

        </section>

      </main>

      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Vendor Profile</h2>
              <button style={styles.closeButton} onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            {updateError && (
              <div style={styles.errorBox}>{updateError}</div>
            )}

            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Business Name</label>
                <input type="text" name="businessName" value={formData.businessName}
                  onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}
                  style={styles.input} required>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Description</label>
                <textarea name="description" value={formData.description}
                  onChange={handleChange} style={styles.textarea} rows="4" />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange}
                  style={styles.input} placeholder="e.g. 25000" min="0" required />
              </div>

                  <div style={styles.pricingSection}>

  <div style={styles.pricingHeader}>
    <div>
      <h3 style={styles.pricingTitle}>
        Guest Based Pricing
      </h3>

      <p style={styles.pricingSubtitle}>
        Set different prices based on event type and guest count.
      </p>
    </div>

    <button
      type="button"
      style={styles.addPricingButton}
      onClick={addPricing}
    >
      + Add Pricing
    </button>
  </div>

  {formData.pricing.length === 0 && (
    <div style={styles.emptyPricing}>
      No pricing rules added yet.
    </div>
  )}

 {formData.pricing.map((item, index) => (
  <div key={index} style={styles.pricingCard}>

    <div style={styles.pricingTopRow}>

     <div style={styles.pricingField}>
  <label style={styles.smallLabel}>Event Type</label>

  <select
    value={item.eventType}
    onChange={(e) =>
      handlePricingChange(index, "eventType", e.target.value)
    }
    style={styles.pricingInput}
    required
  >
    <option value="">Select Event</option>
    <option value="Wedding">Wedding</option>
    <option value="Reception">Reception</option>
    <option value="Engagement">Engagement</option>
    <option value="Mehndi">Mehndi</option>
    <option value="Haldi">Haldi</option>
    <option value="Sangeet">Sangeet</option>
  </select>
</div>
      <div style={styles.pricingField}>
        <label style={styles.smallLabel}>Price</label>
        <div style={styles.priceInputWrapper}>
          <span style={styles.rupee}>₹</span>
          <input type="number" min="0" value={item.price}
            onChange={(e) => handlePricingChange(index, "price",e.target.value)}
            style={styles.priceInput}
            placeholder="20,000"
          />
        </div>
      </div>

      <button
        type="button"
        style={styles.removePricingButton}
        onClick={() => removePricing(index)}
        title="Remove pricing"
      >
        ✕
      </button>

    </div>


    <div style={styles.guestSection}>

      <label style={styles.smallLabel}>
        Guest Range
      </label>

      <div style={styles.guestRange}>

        <div style={styles.guestInputWrapper}>
          <input
            type="number"
            min="0"
            value={item.minGuests}
            onChange={(e) =>
              handlePricingChange(
                index,
                "minGuests",
                e.target.value
              )
            }
            style={styles.guestInput}
            placeholder="1"
          />

          <span>Minimum guests</span>
        </div>

        <span style={styles.rangeDash}>—</span>
        <div style={styles.guestInputWrapper}>
          <input type="number"
            min="0"
            value={item.maxGuests}
            onChange={(e) =>
              handlePricingChange(
                index,
                "maxGuests",
                e.target.value
              )
            }
            style={styles.guestInput}
            placeholder="100"
          />

          <span>Maximum guests</span>
        </div>

      </div>

    </div>

  </div>
))}

</div>
              <div style={styles.modalActions}>
                <button type="submit" style={styles.primaryButton} disabled={updatingProfile}>
                  {updatingProfile ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" style={styles.secondaryButton} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8F6F2",
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
    letterSpacing: "2px",
    color: "#C97B84",
    fontWeight: "600",
    marginBottom: "8px",
  },

  title: {
    fontFamily: "Georgia, serif",
    fontSize: "34px",
    color: "#3D5A50",
    margin: 0,
  },

  subtitle: {
    color: "#777",
    marginTop: "8px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  profileHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#3D5A50",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "600",
    flexShrink: 0,
  },

  businessName: {
    margin: 0,
    color: "#3D5A50",
    fontFamily: "Georgia, serif",
  },

  category: {
    marginTop: "5px",
    color: "#777",
  },

  status: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#E7F2EC",
    color: "#3D5A50",
    fontSize: "13px",
    fontWeight: "600",
  },

  editButton: {
    padding: "9px 16px",
    border: "1px solid #3D5A50",
    borderRadius: "7px",
    background: "#FFFFFF",
    color: "#3D5A50",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  divider: {
    height: "1px",
    background: "#E5DFD5",
    margin: "30px 0",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "25px",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  center: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingIcon: {
    fontSize: "35px",
  },

  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "7px",
    padding: "11px 13px",
    fontSize: "13px",
    marginBottom: "15px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(43, 43, 43, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modalCard: {
  background: "#FFFFFF",
  borderRadius: "14px",
  width: "min(560px, calc(100% - 30px))",
  maxHeight: "90vh",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "28px",
  overflowX: "hidden",
},

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "22px",
  },

  modalTitle: {
    margin: 0,
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 400,
    color: "#3D5A50",
  },

  closeButton: {
    border: "none",
    background: "#F5E9E8",
    color: "#6B6560",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    flexShrink: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fieldLabel: {
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

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
  },

  primaryButton: {
    flex: 1,
    background: "#174D40",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  secondaryButton: {
    background: "#FFFFFF",
    color: "#174D40",
    border: "1px solid #174D40",
    borderRadius: "7px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  pricingSection: {
  marginTop: "8px",
  paddingTop: "22px",
  borderTop: "1px solid #E5DFD5",
},

pricingHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  marginBottom: "18px",
},

pricingTitle: {
  margin: 0,
  fontFamily: "Georgia, serif",
  fontSize: "20px",
  fontWeight: 400,
  color: "#183F35",
},

pricingSubtitle: {
  margin: "5px 0 0",
  color: "#77716B",
  fontSize: "11px",
  lineHeight: 1.5,
},

addPricingButton: {
  flexShrink: 0,
  border: "1px solid #3D5A50",
  background: "#FFFFFF",
  color: "#174F42",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
},

pricingCard: {
  background: "#FBFAF7",
  border: "1px solid #E5DFD5",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
},

pricingTopRow: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "12px",
  alignItems: "end",
},

pricingField: {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
},

smallLabel: {
  fontSize: "11px",
  color: "#4D514D",
  fontWeight: 600,
},

pricingInput: {
  width: "100%",
  padding: "10px 11px",
  border: "1px solid #DCD5CA",
  borderRadius: "8px",
  background: "#FFFFFF",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
},

priceInputWrapper: {
  display: "flex",
  alignItems: "center",
  border: "1px solid #DCD5CA",
  borderRadius: "8px",
  background: "#FFFFFF",
  overflow: "hidden",
},

rupee: {
  paddingLeft: "11px",
  color: "#6B6560",
  fontSize: "13px",
},

priceInput: {
  width: "100%",
  padding: "10px 8px",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "13px",
},

removePricingButton: {
  width: "36px",
  height: "36px",
  border: "1px solid #E8D5D2",
  borderRadius: "8px",
  background: "#FFF7F6",
  color: "#A45A52",
  cursor: "pointer",
  fontSize: "12px",
  flexShrink: 0,
},

guestSection: {
  marginTop: "16px",
  paddingTop: "14px",
  borderTop: "1px solid #E8E2D9",
},

guestRange: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "8px",
},

guestInputWrapper: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
},

guestInput: {
  width: "100%",
  padding: "10px 11px",
  border: "1px solid #DCD5CA",
  borderRadius: "8px",
  background: "#FFFFFF",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
},

rangeDash: {
  color: "#9A938B",
  fontSize: "16px",
  marginTop: "-16px",
},
emptyPricing: {
  padding: "20px",
  background: "#FBFAF7",
  border: "1px dashed #D8D1C7",
  borderRadius: "10px",
  color: "#8A847D",
  textAlign: "center",
  fontSize: "12px",
},
pricingDisplay: {
  gridColumn: "1 / -1",
  marginTop: "8px",
},

pricingList: {
  marginTop: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
},

pricingDisplayRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  background: "#FAF9F6",
  border: "1px solid #E8E2D9",
  borderRadius: "8px",
},

eventType: {
  fontSize: "13px",
  fontWeight: 600,
  color: "#3D5A50",
},

guestRangeText: {
  marginTop: "3px",
  fontSize: "11px",
  color: "#77716B",
},

pricingAmount: {
  fontSize: "14px",
  color: "#2B2B2B",
},
};

export default VendorProfile;
