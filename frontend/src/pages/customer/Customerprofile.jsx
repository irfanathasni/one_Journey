import { useEffect, useState } from "react";
import {getProfile,updateProfile,changePassword} from "../../services/authService"
import {getMyWedding,updateWedding } from "../../services/weddingService"

const CustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [wedding, setWedding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState({name: "",phone: ""})
    const [weddingData, setWeddingData] = useState({
        brideName: "",
        groomName: "",
        weddingDate: "",
        guestCount: "",
        totalBudget: ""
    })

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [weddingError, setWeddingError] = useState("");
    const [weddingSuccess, setWeddingSuccess] = useState("");
    const [savingWedding, setSavingWedding] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: ""
    })

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const [profileRes, weddingRes] = await Promise.all([
                getProfile(),
                getMyWedding()
            ])

            const profileData = profileRes.data
            const weddingDataRes = weddingRes.data

            setProfile(profileData)
            setWedding(weddingDataRes)

            setProfileData({name: profileData?.name || "",phone: profileData?.phone || ""});

            setWeddingData({
                brideName: weddingDataRes?.brideName || "",
                groomName: weddingDataRes?.groomName || "",
                weddingDate: weddingDataRes?.weddingDate || "",
                guestCount: weddingDataRes?.guestCount || "",
                totalBudget: weddingDataRes?.totalBudget || ""
            });

        } catch (error) {
            console.error("Profile data fetch error:", error)
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        })
    }

    const handleWeddingChange = (e) => {
        setWeddingData({
            ...weddingData,
            [e.target.name]: e.target.value
        })
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()

        setProfileError("")
        setProfileSuccess("")
        setSavingProfile(true)

        try {
            await updateProfile(profileData);

            setProfile({...profile,...profileData})

            setProfileSuccess("Profile updated successfully.");
        } catch (error) {
            setProfileError(error.response?.data?.message ||"Failed to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleWeddingSubmit = async (e) => {
        e.preventDefault();

        setWeddingError("");
        setWeddingSuccess("");

        if (!weddingData.brideName || !weddingData.groomName) {
            setWeddingError("Bride name and groom name are required.");
            return;
        }

        setSavingWedding(true);

        try {
            const res = await updateWedding({
                brideName: weddingData.brideName,
                groomName: weddingData.groomName,
                weddingDate: weddingData.weddingDate,
                guestCount: Number(weddingData.guestCount) || 0,
                totalBudget: Number(weddingData.totalBudget) || 0
            });

            setWedding(res.data);

            setWeddingSuccess("Wedding details updated successfully.");
        } catch (error) {
            setWeddingError(error.response?.data?.message ||"Failed to update wedding details")
        } finally {
            setSavingWedding(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({...passwordData,[e.target.name]: e.target.value});
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordData.currentPassword ||!passwordData.newPassword
        ) {
            setPasswordError("Both current and new password are required.");
            return;
        }

        setSavingPassword(true);

        try {
            await changePassword(passwordData);
            setPasswordSuccess("Password changed successfully.");
            setPasswordData({currentPassword: "",newPassword: ""});

        } catch (error) {
            setPasswordError(error.response?.data?.message ||"Failed to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div>
                    <div style={styles.loadingCircle}></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    const totalBudget = Number(wedding?.totalBudget || 0);
    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>ACCOUNT</p>
                    <h1 style={styles.heading}>My Profile</h1>
                    <p style={styles.subtext}>
                        Manage your personal information, wedding details and budget.
                    </p>
                </div>
            </div>

            <section style={styles.profileCard}>
                <div style={styles.profileTop}>
                    <div style={styles.avatar}>
                        {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={styles.profileName}>{profile?.name}</h2>
                        <p style={styles.profileEmail}>{profile?.email}</p>
                    </div>
                    <span style={styles.badge}>CUSTOMER</span>
                </div>
            </section>
            <div style={styles.grid}>
                <section style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <p style={styles.sectionEyebrow}>ACCOUNT</p>
                            <h2 style={styles.cardTitle}>Personal Information</h2>
                        </div>
                        <span style={styles.iconCircle}>👤</span>
                    </div>
                    {profileError && (
                        <div style={styles.errorBox}>{profileError}</div>
                    )}

                    {profileSuccess && (
                        <div style={styles.successBox}>{profileSuccess}</div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange}
                                style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Phone Number</label>
                            <input type="text" name="phone" value={profileData.phone}
                                onChange={handleProfileChange} style={styles.input} />
                        </div>

                        <button type="submit" style={styles.primaryButton} disabled={savingProfile}>
                            {savingProfile ? "Saving..." : "Save Personal Details"}
                        </button>
                    </form>
                </section>

                <section style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <p style={styles.sectionEyebrow}>WEDDING</p>
                            <h2 style={styles.cardTitle}>Wedding Details</h2>
                        </div>
                        <span style={styles.iconCircle}>💍</span>
                    </div>
                    {weddingError && (
                        <div style={styles.errorBox}>{weddingError}</div>
                    )}
                    {weddingSuccess && (
                        <div style={styles.successBox}>{weddingSuccess}</div>
                    )}
                    <form onSubmit={handleWeddingSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Bride Name</label>
                            <input type="text" name="brideName" value={weddingData.brideName} onChange={handleWeddingChange}
                                style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Groom Name</label>
                            <input type="text" name="groomName" value={weddingData.groomName} onChange={handleWeddingChange}
                                style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Wedding Date</label>
                            <input type="date" name="weddingDate" value={weddingData.weddingDate}
                                onChange={handleWeddingChange} style={styles.input} />
                        </div>

                        <div style={styles.twoColumns}>
                            <div style={styles.field}>
                                <label style={styles.label}>Guest Count</label>
                                <input type="number" name="guestCount" min="0"
                                    value={weddingData.guestCount} onChange={handleWeddingChange} style={styles.input} />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>Wedding Budget</label>
                                <input type="number" name="totalBudget" min="0" value={weddingData.totalBudget}
                                    onChange={handleWeddingChange} style={styles.input} />
                            </div>
                        </div>
                        <button type="submit" style={styles.primaryButton} disabled={savingWedding}>
                            {savingWedding
                                ? "Saving..."
                                : "Save Wedding Details"}
                        </button>
                    </form>
                </section>
            </div>

            <section style={styles.budgetCard}>
                <div style={styles.budgetHeader}>
                    <div>
                        <p style={styles.sectionEyebrow}>FINANCIAL OVERVIEW</p>
                        <h2 style={styles.budgetTitle}>Wedding Budget</h2>
                        <p style={styles.budgetSubtext}>Your total wedding budget</p>
                    </div>
                    <div style={styles.budgetIcon}>₹</div>
                </div>

                <div style={styles.budgetAmount}>₹{totalBudget.toLocaleString("en-IN")}</div>
                <div style={styles.budgetNote}>
                    You can update your total wedding budget from
                    the Wedding Details section above.
                </div>
            </section>


            <section style={styles.card}>
                <div style={styles.sectionHeader}>
                    <div>
                        <p style={styles.sectionEyebrow}>SECURITY</p>
                        <h2 style={styles.cardTitle}>Change Password</h2>
                    </div>
                    <span style={styles.iconCircle}>🔐</span>
                </div>

                {passwordError && (
                    <div style={styles.errorBox}>{passwordError}</div>
                )}

                {passwordSuccess && (
                    <div style={styles.successBox}>{passwordSuccess}</div>
                )}

                <form onSubmit={handlePasswordSubmit} style={styles.passwordForm}>

                    <div style={styles.field}>
                        <label style={styles.label}>Current Password</label>
                        <input type="password" name="currentPassword"
                            value={passwordData.currentPassword} onChange={handlePasswordChange}
                            style={styles.input} required />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>New Password</label>
                        <input type="password" name="newPassword" value={passwordData.newPassword}
                            onChange={handlePasswordChange} style={styles.input} required />
                    </div>

                    <button type="submit" style={styles.primaryButton} disabled={savingPassword}>
                        {savingPassword
                            ? "Updating..."
                            : "Update Password"}
                    </button>
                </form>
            </section>
        </div>
    )
}


const styles = {

    page: {
        minHeight: "100vh",
        background: "#FBF8F3",
        padding: "35px 45px 60px",
        boxSizing: "border-box",
    },

    loading: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF8F3",
        color: "#6B6560",
        fontSize: "14px",
        textAlign: "center",
    },

    loadingCircle: {
        width: "30px",
        height: "30px",
        border: "3px solid #E5DFD5",
        borderTop: "3px solid #3D5A50",
        borderRadius: "50%",
        margin: "0 auto 12px",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px",
    },

    eyebrow: {
        fontFamily: "Georgia, serif",
        fontSize: "11px",
        color: "#B8935A",
        letterSpacing: "2px",
        margin: "0 0 7px",
    },

    heading: {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        fontWeight: 400,
        color: "#2B2B2B",
        margin: 0,
    },

    subtext: {
        color: "#77716B",
        fontSize: "14px",
        marginTop: "8px",
    },

    profileCard: {
        background: "#FFFFFF",
        border: "1px solid #E5DFD5",
        borderRadius: "16px",
        padding: "25px 28px",
        marginBottom: "22px",
    },

    profileTop: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },

    avatar: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "#3D5A50",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        fontWeight: 600,
        flexShrink: 0,
    },

    profileName: {
        margin: 0,
        fontFamily: "Georgia, serif",
        color: "#2F4941",
        fontSize: "21px",
        fontWeight: 500,
    },

    profileEmail: {
        margin: "5px 0 0",
        color: "#77716B",
        fontSize: "13px",
    },

    badge: {
        background: "#EEF3F0",
        color: "#3D5A50",
        padding: "7px 11px",
        borderRadius: "20px",
        fontSize: "10px",
        letterSpacing: "1px",
        fontWeight: 700,
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "22px",
        marginBottom: "22px",
    },

    card: {
        background: "#FFFFFF",
        border: "1px solid #E5DFD5",
        borderRadius: "16px",
        padding: "27px",
        boxSizing: "border-box",
        marginBottom: "22px",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "22px",
    },

    sectionEyebrow: {
        fontSize: "10px",
        color: "#B8935A",
        letterSpacing: "1.7px",
        fontWeight: 700,
        margin: "0 0 5px",
    },

    cardTitle: {
        fontFamily: "Georgia, serif",
        fontSize: "20px",
        fontWeight: 400,
        color: "#2B2B2B",
        margin: 0,
    },

    iconCircle: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "#F5F1EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "17px",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        marginBottom: "16px",
    },

    label: {
        fontSize: "12px",
        color: "#454943",
        fontWeight: 600,
    },

    input: {
        width: "100%",
        padding: "12px 13px",
        border: "1px solid #DCD5CA",
        borderRadius: "8px",
        outline: "none",
        fontSize: "13px",
        background: "#FFFFFF",
        color: "#333333",
        boxSizing: "border-box",
    },
    twoColumns: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
    },

    primaryButton: {
        marginTop: "4px",
        padding: "12px 18px",
        background: "#3D5A50",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
    },

    budgetCard: {
        background: "#3D5A50",
        borderRadius: "16px",
        padding: "28px 30px",
        marginBottom: "22px",
        color: "#FFFFFF",
    },

    budgetHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    budgetTitle: {
        fontFamily: "Georgia, serif",
        fontSize: "23px",
        fontWeight: 400,
        margin: 0,
    },

    budgetSubtext: {
        margin: "6px 0 0",
        color: "#DCE6E1",
        fontSize: "12px",
    },

    budgetIcon: {
        width: "45px",
        height: "45px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },

    budgetAmount: {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        marginTop: "25px",
    },

    budgetNote: {
        marginTop: "8px",
        fontSize: "11px",
        color: "#DCE6E1",
    },

    passwordForm: {
        maxWidth: "520px",
    },

    errorBox: {
        background: "#FBEAEA",
        color: "#A33B3B",
        borderRadius: "8px",
        padding: "11px 13px",
        fontSize: "12px",
        marginBottom: "15px",
    },

    successBox: {
        background: "#E6F3EC",
        color: "#2E7D50",
        borderRadius: "8px",
        padding: "11px 13px",
        fontSize: "12px",
        marginBottom: "15px",
    },
};

export default CustomerProfile;