import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendorAvailability, getVendors } from "../../services/vendorService";
import { getMyWedding } from "../../services/weddingService";
import { createBooking } from "../../services/bookingService";
import { getVendorReviews } from "../../services/reviewService";
import { getOrCreateConversation } from "../../services/chatService";

const VendorDetails = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [wedding,setWedding] = useState(null)
    const [serviceDate,setServiceDate] = useState("")
    const [showBookingForm,setShowBookingForm] = useState(false)
    const [bookingLoading,setBookingLoading] = useState(false)
    const [bookingError,setBookingError] = useState("")
    const [bookingSuccess,setBookingSuccess] = useState("")

    const[availability,setAvailability] = useState([])
    const[selectedSlot,setSelectedSlot] = useState(null)
    const[selectedPackage, setSelectedPackage] = useState(null)
    const [packageError, setPackageError] = useState("")
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);


  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

    useEffect(() => {
    fetchWedding()
  },[])

  useEffect(() => {
  fetchReviews();
}, [vendorId]);

const fetchReviews = async () => {
  try {
    const res = await getVendorReviews(vendorId);
    setReviews(res.data.reviews);
    setAvgRating(res.data.avgRating);
    setReviewCount(res.data.count);
  } catch (err) {
    console.log("Reviews fetch error", err);
  }
};
  
  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getVendors();
      const foundVendor = res.data?.find((item) => item._id === vendorId)
      if (!foundVendor) {
        setError("Vendor not found");
        return;
      }
      setVendor(foundVendor);
    } catch (err) {
      console.error("Vendor details error:", err);
      setError(err.response?.data?.message ||"Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  }

  const fetchWedding = async () => {
    try{
        const res = await getMyWedding()
        setWedding(res.data)
    }catch(error) {
        console.log("Wedding fetch error",error)
        setWedding(null)
    }
  }

  const formatCategory = (value) => {
    const labels = {
      Photography: "Photography",
      Catering: "Catering",
      BridalMakeup: "Bridal Makeup",
      EventManagement: "Event Management",
      WeddingHall: "Wedding Hall",
      PreMarriageCounselling: "Pre-Marriage Counselling",
    }
    return labels[value] || value;
  }

const handleMessageVendor = async () => {
  try {
    const res = await getOrCreateConversation(vendor.user._id);

    if (res.success) {
      navigate("/customer/messages", {
        state: {
          conversation: res.data,
        },
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
  }
}

const handleBooking = async (e) => {
    e.preventDefault()

    if(!wedding) {
        setBookingError("Please create your wedding first")
        return;
    }
    if(!serviceDate){
        setBookingError("Please select a service date")
        return;
    }
    if(!selectedPackage) {
      setBookingError("Please select a package")
       return
    }
    if(!selectedSlot) {
      setBookingError("Please select an available time slot")
      return
    }
    try {
        setBookingLoading(true)
        setBookingError("")
        setBookingSuccess("")

   const res = await createBooking({
        weddingId: wedding._id,
        vendorId: vendor._id,
        serviceDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        packageId: selectedPackage._id
      })
   setBookingSuccess(res.message || "Booking request sent successfully")
   setShowBookingForm(false)
   setServiceDate("")
   setSelectedSlot(null)
   setSelectedPackage(null)
   setAvailability([])
   setPackageError("")

    }catch(error) {
        console.log("Booking error",error)
        setBookingError(error.response?.data?.message || "Failed to create booking")
    }finally {
        setBookingLoading(false)
    }
  }


  const handleDateChange = async (e) => {
    const date = e.target.value

    setServiceDate(date)
    setSelectedSlot(null)
    setAvailability([])
    setBookingError("")

    if(!date) return

    try{
      const res = await getVendorAvailability(vendorId,date)
      setAvailability(res.data || [])
    }catch(error) {
      console.error("Availability error:" ,error)
      setBookingError(error.response?.data?.message || "Failed to load available slots")
    }
  }


  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingIcon}>💍</div>
        <p>Loading vendor details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h2>{error}</h2>

        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Go Back</button>
      </div>
    );
  }
  return (
<div style={styles.page}>

    <button onClick={() => navigate(-1)} style={styles.backLink}>← Back to Vendors</button>
        <div style={styles.hero}>
            <div style={styles.icon}>💍</div>

            <div>
                <p style={styles.eyebrow}>{formatCategory(vendor.category)}</p>
                <h1 style={styles.title}>{vendor.businessName}</h1>
                <span style={styles.status}> ✓ Approved Vendor</span>
            </div>
        </div>
    <div style={styles.content}>
      <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Service Packages</h2>
            {packageError && (
        <div style={styles.packageError}>⚠️ {packageError}</div>
  )}
           {!vendor.packages || vendor.packages.length === 0 ? (
           <p style={styles.description}>This vendor has not added any packages yet.</p>
          ) : (
         <div style={styles.packageList}>
            {vendor.packages.map((pkg) => (
           <div key={pkg._id} style={{...styles.packageCard,...(selectedPackage?._id === pkg._id
              ? styles.selectedPackage
              : {})
          }}
         onClick={(e) => {
             e.stopPropagation()
             setSelectedPackage(pkg)
             setPackageError("")
             setBookingError("")
        }}>
          <div style={styles.packageInfo}>
            <span style={styles.packageType}>{pkg.packageType}</span>
            <h3 style={styles.packageName}>{pkg.packageName}</h3>
            <p style={styles.packageDescription}>{pkg.description}</p>
          </div>

          <div style={styles.packageRight}>
            <strong style={styles.packagePrice}>₹{Number(pkg.price).toLocaleString("en-IN")}</strong>
            <button type="button"
              style={selectedPackage?._id === pkg._id
                  ? styles.selectedPackageButton
                  : styles.selectPackageButton
              }
                   onClick={(e) => {
                      e.stopPropagation()
                       setSelectedPackage(pkg)
                       setPackageError("")
                       setBookingError("")
                      }}>
                     {selectedPackage?._id === pkg._id
                     ? "✓ Selected"
                    : "Select Package"}
                  </button>
              </div>
            </div>
          ))}
         </div>
         )}
      </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>About this vendor</h2>
          <p style={styles.description}>{vendor.description ||"This vendor has not added a description yet."}</p>
        </section>
        <section style={styles.card}>
  <h2 style={styles.sectionTitle}>Reviews {reviewCount > 0 && `(${avgRating} ★ · ${reviewCount})`}</h2>
  {reviews.length === 0 ? (
    <p style={styles.description}>No reviews yet.</p>
  ) : (
    reviews.map((r) => (
      <div key={r._id} style={{ borderBottom: "1px solid #EEE8DF", padding: "14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong style={{ color: "#3D5A50" }}>{r.customer?.name || "Customer"}</strong>
          <span style={{ color: "#B8935A" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
        </div>
        {r.comment && <p style={{ margin: "6px 0 0", color: "#6B6560", fontSize: "13px" }}>{r.comment}</p>}
      </div>
    ))
  )}
</section>
       {vendor.user && (
        <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Contact Information</h2>
        <div style={styles.infoRow}>
            <span style={styles.infoIcon}>👤</span>
        <div>
            <p style={styles.label}>Owner</p>
            <p style={styles.value}>{vendor.user.name}</p>
        </div>
    </div>

    <div style={styles.infoRow}>
        <span style={styles.infoIcon}>📧</span>

      <div>
        <p style={styles.label}>Email</p>
        <p style={styles.value}>{vendor.user.email}</p>
      </div>
    </div>
        {vendor.user.phone && (
    <div style={styles.infoRow}>
        <span style={styles.infoIcon}>📞</span>
        <div>
            <p style={styles.label}>Phone</p>
            <p style={styles.value}>{vendor.user.phone}</p>
        </div>
    </div>)}
    </section>)}
  <section style={styles.bookingCard}>
    <div>
       <p style={styles.bookingSmall}>READY TO PLAN?</p>
       <h2 style={styles.bookingTitle}>Interested in this vendor?</h2>
       <p style={styles.bookingText}>Start your journey by requesting a booking.</p>
     </div>

   <div style={styles.actionButtons}>
      <button style={styles.messageButton} onClick={handleMessageVendor}>
        💬 Message Vendor
     </button>

     <button style={styles.bookButton} onClick={() => {
          if (!selectedPackage) {
              setPackageError("Please select a package before booking this vendor.")
           return
          }
           setPackageError("")
           setShowBookingForm(true)
           setBookingError("")
           setBookingSuccess("")
           }}>
        Book This Vendor →
    </button>

          {packageError && (
         <div style={styles.packageError}>
           ⚠️ {packageError}
         </div>
         )}

   </div>
</section>
                {showBookingForm && (
          <div style={styles.bookingForm}>
           <div style={styles.formHeader}>
         <div>
            <p style={styles.bookingSmall}> BOOKING REQUEST</p>
           <h2 style={styles.formTitle}>Book {vendor.businessName}</h2>
         </div>
         <button style={styles.closeButton} onClick={() => setShowBookingForm(false)}>✕</button>
       </div>
             {wedding.totalBudget > 0 &&
            selectedPackage &&
        selectedPackage.price > wedding.totalBudget && (
         <div style={styles.budgetWarning}>
           ⚠️ This package price (
           ₹{Number(selectedPackage.price).toLocaleString("en-IN")}
          ) exceeds your total wedding budget (
           ₹{Number(wedding.totalBudget).toLocaleString("en-IN")}
           ).
         </div>
        )}

     {!wedding ? (
       <div style={styles.formMessage}>
         <h3>No Wedding Found 💍</h3>
          <p>Please create your wedding before booking a vendor.</p>
          <button style={styles.createWeddingButton} onClick={() => navigate("/customer/wedding")}>Go to My Wedding
          </button>
        </div>
    ) : (
      <form onSubmit={handleBooking}>
        <div style={styles.formGroup}>
  <label style={styles.formLabel}>Selected Package</label>

        {selectedPackage ? (
          <div style={styles.selectedPackageBox}>
          <div>
            <strong>{selectedPackage.packageName}</strong>
            <span>{selectedPackage.packageType} Package</span>
           </div>
           <strong>₹{Number(selectedPackage.price).toLocaleString("en-IN")}</strong>
          </div>
       ) : (
          <p style={styles.noPackage}>Please select a package above before booking.</p>
        )}
    </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Your Wedding</label>
          <div style={styles.weddingBox}>
            <strong>{wedding.brideName} & {wedding.groomName}</strong>
            <span>{new Date(wedding.weddingDate).toLocaleDateString("en-US",
                {day: "numeric",month: "long",year: "numeric"})}</span>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Service Date</label>
          <input type="date" value={serviceDate} onChange={handleDateChange}
            style={styles.dateInput} />

          {serviceDate && (
  <div style={styles.slotSection}>
    <label style={styles.formLabel}>Available Time Slots</label>
    {availability.length === 0 ? (
      <p style={styles.noSlots}>No available slots for this date.</p>
    ) : (
      <div style={styles.slotGrid}>
        {availability.map((slot) => (
          <button key={slot._id} type="button" onClick={() => setSelectedSlot(slot)}
            style={{...styles.slotButton, ...(selectedSlot?._id === slot._id
                ? styles.selectedSlot
                : {})}}>{slot.startTime} - {slot.endTime}
          </button>
        ))}
      </div>
    )}
  </div>
)}
      </div>{bookingError && (<div style={styles.formError}>{bookingError}</div>
        )}
        {bookingSuccess && (
          <div style={styles.formSuccess}>{bookingSuccess}</div>
        )}

        <button type="submit" style={styles.submitButton} disabled={bookingLoading}>
          {bookingLoading
            ? "Sending Request..."
            : "Send Booking Request →"}
        </button>

      </form>
    )}
  </div>
)}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF8F3",
    padding: "35px 50px",
    boxSizing: "border-box",
  },

  backLink: {
    border: "none",
    background: "transparent",
    color: "#6B6560",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "25px",
  },

  hero: {
    maxWidth: "1000px",
    margin: "0 auto 30px",
    padding: "40px",
    background: "linear-gradient(135deg, #F5E9E8, #F8F2E9)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "25px",
  },

  icon: {
    width: "85px",
    height: "85px",
    borderRadius: "18px",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "38px",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#B8935A",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  title: {
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
    fontSize: "34px",
    fontWeight: 400,
    color: "#2B2B2B",
  },

  status: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#E8F1EC",
    color: "#3D5A50",
    fontSize: "11px",
    fontWeight: 600,
  },

  content: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  card: {
    background: "#FFFFFF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E5DFD5",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: "0 0 15px",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 400,
    color: "#2B2B2B",
  },

  description: {
    margin: 0,
    color: "#6B6560",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 0",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: "#EEE8DF",
  },

  infoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#F5E9E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    margin: "0 0 3px",
    color: "#99918A",
    fontSize: "11px",
  },

  value: {
    margin: 0,
    color: "#3A3734",
    fontSize: "13px",
  },

  bookingCard: {
    background: "#3D5A50",
    color: "#FFFFFF",
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  bookingSmall: {
    margin: "0 0 6px",
    fontSize: "10px",
    letterSpacing: "2px",
    opacity: 0.7,
  },

  bookingTitle: {
    margin: "0 0 5px",
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    fontWeight: 400,
  },

  bookingText: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.8,
  },

  bookButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#B8935A",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  center: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#FBF8F3",
    color: "#6B6560",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  backButton: {
    marginTop: "15px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#3D5A50",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  bookingForm: {
  marginTop: "20px",
  background: "#FFFFFF",
  border: "1px solid #E5DFD5",
  borderRadius: "16px",
  padding: "28px",
},

formHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "25px",
},

formTitle: {
  margin: "5px 0 0",
  fontFamily: "Georgia, serif",
  fontSize: "24px",
  fontWeight: 400,
  color: "#2B2B2B",
},

closeButton: {
  border: "none",
  background: "#F5E9E8",
  color: "#6B6560",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  cursor: "pointer",
},

formGroup: {
  marginBottom: "20px",
},

formLabel: {
  display: "block",
  marginBottom: "8px",
  color: "#6B6560",
  fontSize: "12px",
  fontWeight: 600,
},

weddingBox: {
  padding: "15px",
  background: "#FBF8F3",
  border: "1px solid #E5DFD5",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  color: "#3D5A50",
},

dateInput: {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #D8D2C7",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#3A3734",
  background: "#FFFFFF",
},

submitButton: {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  background: "#3D5A50",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
},

formError: {
  marginBottom: "15px",
  padding: "10px",
  borderRadius: "7px",
  background: "#FBEAEA",
  color: "#A33B3B",
  fontSize: "12px",
},

formSuccess: {
  marginBottom: "15px",
  padding: "10px",
  borderRadius: "7px",
  background: "#E8F1EC",
  color: "#3D5A50",
  fontSize: "12px",
},

formMessage: {
  textAlign: "center",
  padding: "20px",
  color: "#6B6560",
},

createWeddingButton: {
  marginTop: "10px",
  padding: "10px 16px",
  border: "none",
  borderRadius: "7px",
  background: "#3D5A50",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "12px",
},
slotSection: {
  marginTop: "14px",
},

noSlots: {
  color: "#A6535D",
  fontSize: "13px",
  background: "#FDF0F1",
  padding: "12px 14px",
  borderRadius: "8px",
  margin: 0,
},

slotGrid: {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "10px",
},

slotButton: {
  padding: "10px 16px",
  border: "1.5px solid #D8D2C7",
  borderRadius: "8px",
  background: "#FAF9F7",
  color: "#3D5A50",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
},

selectedSlot: {
  border: "1.5px solid #3D5A50",
  background: "#3D5A50",
  color: "#FFFFFF",
},
priceTag: {
  marginTop: "8px",
  fontSize: "20px",
  fontWeight: 700,
  color: "#3D5A50",
},
budgetWarning: {
  background: "#FFF4DD",
  border: "1px solid #E8D8BC",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "13px",
  color: "#A66B00",
  marginBottom: "16px",
},
actionButtons: {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  flexWrap: "wrap",
},

messageButton: {
  padding: "12px 20px",
  border: "1px solid #FFFFFF",
  borderRadius: "8px",
  background: "transparent",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  whiteSpace: "nowrap",
},
packageList: {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
},

packageCard: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  padding: "18px",
  border: "1px solid #E5DFD5",
  borderRadius: "12px",
  background: "#FAF9F6",
  cursor: "pointer",
  transition: "all 0.2s ease",
},

selectedPackage: {
  border: "2px solid #3D5A50",
  background: "#F1F6F3",
},

packageInfo: {
  flex: 1,
},

packageType: {
  display: "inline-block",
  fontSize: "10px",
  color: "#B8935A",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1px",
},

packageName: {
  margin: "5px 0",
  fontFamily: "Georgia, serif",
  fontSize: "18px",
  fontWeight: 400,
  color: "#3D5A50",
},

packageDescription: {
  margin: 0,
  color: "#6B6560",
  fontSize: "12px",
  lineHeight: 1.5,
},

packageRight: {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "10px",
},

packagePrice: {
  fontSize: "17px",
  color: "#2B2B2B",
},

selectPackageButton: {
  padding: "9px 14px",
  border: "1px solid #3D5A50",
  borderRadius: "7px",
  background: "#FFFFFF",
  color: "#3D5A50",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 600,
},

selectedPackageButton: {
  padding: "9px 14px",
  border: "1px solid #3D5A50",
  borderRadius: "7px",
  background: "#3D5A50",
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 600,
},

selectedPackageBox: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px",
  background: "#F1F6F3",
  border: "1px solid #C9DCD3",
  borderRadius: "8px",
  color: "#3D5A50",
},

noPackage: {
  margin: 0,
  padding: "12px",
  background: "#FDF0F1",
  borderRadius: "8px",
  color: "#A6535D",
  fontSize: "12px",
},
packageError: {
  marginBottom: "15px",
  padding: "12px 14px",
  borderRadius: "8px",
  background: "#FFF4DD",
  border: "1px solid #E8D8BC",
  color: "#A66B00",
  fontSize: "12px",
  fontWeight: 600,
},
}

export default VendorDetails;