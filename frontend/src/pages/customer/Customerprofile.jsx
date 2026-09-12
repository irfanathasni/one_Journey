import { useEffect, useState } from "react";
import { getProfile, updateProfile, changePassword } from "../../services/authService";
import { getMyWedding, updateWedding } from "../../services/weddingService";

const CustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [wedding, setWedding] = useState(null);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        name: "",
        phone: ""
    });

    const [weddingData, setWeddingData] = useState({
        brideName: "",
        groomName: "",
        weddingDate: "",
        guestCount: "",
        totalBudget: ""
    });

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [weddingError, setWeddingError] = useState("");
    const [weddingSuccess, setWeddingSuccess] = useState("");
    const [savingWedding, setSavingWedding] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: ""
    });

    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, weddingRes] = await Promise.all([
                getProfile(),
                getMyWedding()
            ]);

            const profileData = profileRes.data;
            const weddingDataRes = weddingRes.data;

            console.log("PROFILE DATA:", profileData);
            console.log("WEDDING DATA:", weddingDataRes);

            setProfile(profileData);
            setWedding(weddingDataRes);

            setProfileData({
                name: profileData?.name || "",
                phone: profileData?.phone || ""
            });

            setWeddingData({
                brideName: weddingDataRes?.brideName || "",
                groomName: weddingDataRes?.groomName || "",
                weddingDate: weddingDataRes?.weddingDate
                    ? weddingDataRes.weddingDate.split("T")[0]
                    : "",
                guestCount: weddingDataRes?.guestCount || "",
                totalBudget: weddingDataRes?.totalBudget || ""
            });

        } catch (error) {
            console.error("Profile data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleWeddingChange = (e) => {
        setWeddingData({
            ...weddingData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        setProfileError("");
        setProfileSuccess("");
        setSavingProfile(true);

        try {
            const res = await updateProfile(profileData);
            setProfile(res.data);
            setProfileSuccess("Profile updated successfully.");
        } catch (error) {
            setProfileError(
                error.response?.data?.message || "Failed to update profile"
            );
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
            setWeddingError(
                error.response?.data?.message ||
                "Failed to update wedding details"
            );
        } finally {
            setSavingWedding(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        setPasswordError("");
        setPasswordSuccess("");

        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword
        ) {
            setPasswordError(
                "Both current and new password are required."
            );
            return;
        }

        setSavingPassword(true);

        try {
            await changePassword(passwordData);

            setPasswordSuccess("Password changed successfully.");

            setPasswordData({
                currentPassword: "",
                newPassword: ""
            });

        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Failed to change password"
            );
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
        <div style={styles.page} className="customer-profile-page">

            {/* Header */}
            <div style={styles.header} className="customer-profile-header">
                <div>
                    <p style={styles.eyebrow}>ACCOUNT</p>

                    <h1 style={styles.heading}>
                        My Profile
                    </h1>

                    <p style={styles.subtext}>
                        Manage your personal information, wedding details and budget.
                    </p>
                </div>
            </div>

            {/* Profile Summary */}
            <section
                style={styles.profileCard}
                className="customer-profile-summary"
            >
                <div
                    style={styles.profileTop}
                    className="customer-profile-top"
                >
                    <div style={styles.avatar}>
                        {profile?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div
                        style={{ flex: 1, minWidth: 0 }}
                        className="customer-profile-info"
                    >
                        <h2 style={styles.profileName}>
                            {profile?.name}
                        </h2>

                        <p style={styles.profileEmail}>
                            {profile?.email}
                        </p>
                    </div>

                    <span
                        style={styles.badge}
                        className="customer-profile-badge"
                    >
                        CUSTOMER
                    </span>
                </div>
            </section>

            {/* Personal + Wedding */}
            <div
                style={styles.grid}
                className="customer-profile-grid"
            >

                {/* Personal Information */}
                <section style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <p style={styles.sectionEyebrow}>
                                ACCOUNT
                            </p>

                            <h2 style={styles.cardTitle}>
                                Personal Information
                            </h2>
                        </div>

                        <span style={styles.iconCircle}>
                            👤
                        </span>
                    </div>

                    {profileError && (
                        <div style={styles.errorBox}>
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div style={styles.successBox}>
                            {profileSuccess}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                style={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            style={styles.primaryButton}
                            className="customer-profile-button"
                            disabled={savingProfile}
                        >
                            {savingProfile
                                ? "Saving..."
                                : "Save Personal Details"}
                        </button>
                    </form>
                </section>

                {/* Wedding Details */}
                <section style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <p style={styles.sectionEyebrow}>
                                WEDDING
                            </p>

                            <h2 style={styles.cardTitle}>
                                Wedding Details
                            </h2>
                        </div>

                        <span style={styles.iconCircle}>
                            💍
                        </span>
                    </div>

                    {weddingError && (
                        <div style={styles.errorBox}>
                            {weddingError}
                        </div>
                    )}

                    {weddingSuccess && (
                        <div style={styles.successBox}>
                            {weddingSuccess}
                        </div>
                    )}

                    <form onSubmit={handleWeddingSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                Bride Name
                            </label>

                            <input
                                type="text"
                                name="brideName"
                                value={weddingData.brideName}
                                onChange={handleWeddingChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Groom Name
                            </label>

                            <input
                                type="text"
                                name="groomName"
                                value={weddingData.groomName}
                                onChange={handleWeddingChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Wedding Date
                            </label>

                            <input
                                type="date"
                                name="weddingDate"
                                value={weddingData.weddingDate}
                                onChange={handleWeddingChange}
                                style={styles.input}
                            />
                        </div>

                        <div
                            style={styles.twoColumns}
                            className="customer-profile-two-columns"
                        >
                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Guest Count
                                </label>

                                <input
                                    type="number"
                                    name="guestCount"
                                    min="0"
                                    value={weddingData.guestCount}
                                    onChange={handleWeddingChange}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.field}>
                                <label style={styles.label}>
                                    Wedding Budget
                                </label>

                                <input
                                    type="number"
                                    name="totalBudget"
                                    min="0"
                                    value={weddingData.totalBudget}
                                    onChange={handleWeddingChange}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={styles.primaryButton}
                            className="customer-profile-button"
                            disabled={savingWedding}
                        >
                            {savingWedding
                                ? "Saving..."
                                : "Save Wedding Details"}
                        </button>
                    </form>
                </section>
            </div>

            {/* Budget */}
            <section
                style={styles.budgetCard}
                className="customer-profile-budget"
            >
                <div
                    style={styles.budgetHeader}
                    className="customer-profile-budget-header"
                >
                    <div style={{ minWidth: 0 }}>
                        <p style={styles.sectionEyebrow}>
                            FINANCIAL OVERVIEW
                        </p>

                        <h2 style={styles.budgetTitle}>
                            Wedding Budget
                        </h2>

                        <p style={styles.budgetSubtext}>
                            Your total wedding budget
                        </p>
                    </div>

                    <div style={styles.budgetIcon}>
                        ₹
                    </div>
                </div>

                <div style={styles.budgetAmount}>
                    ₹{totalBudget.toLocaleString("en-IN")}
                </div>

                <div style={styles.budgetNote}>
                    You can update your total wedding budget from
                    the Wedding Details section above.
                </div>
            </section>

            {/* Change Password */}
            <section style={styles.card}>
                <div style={styles.sectionHeader}>
                    <div>
                        <p style={styles.sectionEyebrow}>
                            SECURITY
                        </p>

                        <h2 style={styles.cardTitle}>
                            Change Password
                        </h2>
                    </div>

                    <span style={styles.iconCircle}>
                        🔐
                    </span>
                </div>

                {passwordError && (
                    <div style={styles.errorBox}>
                        {passwordError}
                    </div>
                )}

                {passwordSuccess && (
                    <div style={styles.successBox}>
                        {passwordSuccess}
                    </div>
                )}

                <form
                    onSubmit={handlePasswordSubmit}
                    style={styles.passwordForm}
                    className="customer-password-form"
                >
                    <div style={styles.field}>
                        <label style={styles.label}>
                            Current Password
                        </label>

                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>
                            New Password
                        </label>

                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.primaryButton}
                        className="customer-profile-button"
                        disabled={savingPassword}
                    >
                        {savingPassword
                            ? "Updating..."
                            : "Update Password"}
                    </button>
                </form>
            </section>

            {/* Responsive CSS */}
            <style>
                {`
                    .customer-profile-page {
                        width: 100%;
                        overflow-x: hidden;
                    }

                    .customer-profile-summary,
                    .customer-profile-grid > section,
                    .customer-profile-budget {
                        min-width: 0;
                    }

                    .customer-profile-info {
                        overflow: hidden;
                    }

                    .customer-profile-info h2,
                    .customer-profile-info p {
                        overflow-wrap: anywhere;
                        word-break: break-word;
                    }

                    .customer-profile-button {
                        max-width: 100%;
                    }

                    @media (max-width: 1100px) {
                        .customer-profile-page {
                            padding: 30px 30px 50px !important;
                        }

                        .customer-profile-grid {
                            gap: 18px !important;
                        }

                        .customer-profile-grid > section {
                            padding: 23px !important;
                        }
                    }

                    @media (max-width: 850px) {
                        .customer-profile-page {
                            padding: 28px 22px 45px !important;
                        }

                        .customer-profile-grid {
                            grid-template-columns: 1fr !important;
                        }

                        .customer-profile-grid > section {
                            margin-bottom: 0 !important;
                        }

                        .customer-profile-budget {
                            padding: 25px !important;
                        }
                    }

                    @media (max-width: 600px) {
                        .customer-profile-page {
                            padding: 22px 16px 35px !important;
                        }

                        .customer-profile-header {
                            margin-bottom: 20px !important;
                        }

                        .customer-profile-header h1 {
                            font-size: 27px !important;
                        }

                        .customer-profile-header p:last-child {
                            line-height: 1.5 !important;
                            max-width: 100%;
                        }

                        .customer-profile-summary {
                            padding: 20px !important;
                            margin-bottom: 18px !important;
                        }

                        .customer-profile-top {
                            align-items: flex-start !important;
                            flex-wrap: wrap;
                            gap: 12px !important;
                        }

                        .customer-profile-info {
                            flex: 1 1 calc(100% - 82px) !important;
                        }

                        .customer-profile-badge {
                            margin-left: 76px;
                            margin-top: -2px;
                        }

                        .customer-profile-grid {
                            gap: 18px !important;
                            margin-bottom: 18px !important;
                        }

                        .customer-profile-grid > section {
                            padding: 20px !important;
                            border-radius: 13px !important;
                        }

                        .customer-profile-grid .customer-profile-button,
                        .customer-profile-button {
                            width: 100%;
                        }

                        .customer-profile-two-columns {
                            grid-template-columns: 1fr !important;
                            gap: 0 !important;
                        }

                        .customer-profile-budget {
                            padding: 21px !important;
                            border-radius: 13px !important;
                            margin-bottom: 18px !important;
                        }

                        .customer-profile-budget-header {
                            align-items: flex-start !important;
                            gap: 15px;
                        }

                        .customer-profile-budget-header > div:first-child {
                            min-width: 0;
                        }

                        .customer-profile-budget-header h2 {
                            font-size: 20px !important;
                        }

                        .customer-profile-budget-header p:last-child {
                            line-height: 1.4;
                        }

                        .customer-profile-budget .budgetAmount {
                            font-size: 28px !important;
                        }

                        .customer-password-form {
                            max-width: 100% !important;
                        }
                    }

                    @media (max-width: 380px) {
                        .customer-profile-page {
                            padding-left: 12px !important;
                            padding-right: 12px !important;
                        }

                        .customer-profile-summary {
                            padding: 17px !important;
                        }

                        .customer-profile-grid > section {
                            padding: 17px !important;
                        }

                        .customer-profile-budget {
                            padding: 18px !important;
                        }

                        .customer-profile-top {
                            gap: 10px !important;
                        }

                        .customer-profile-top > div:first-child {
                            width: 52px !important;
                            height: 52px !important;
                            font-size: 21px !important;
                        }

                        .customer-profile-info {
                            flex-basis: calc(100% - 64px) !important;
                        }

                        .customer-profile-badge {
                            margin-left: 62px;
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
        lineHeight: 1.5,
    },

    profileCard: {
        background: "#FFFFFF",
        border: "1px solid #E5DFD5",
        borderRadius: "16px",
        padding: "25px 28px",
        marginBottom: "22px",
        boxSizing: "border-box",
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
        flexShrink: 0,
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
        minWidth: 0,
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "22px",
        gap: "12px",
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
        flexShrink: 0,
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
        minWidth: 0,
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
        boxSizing: "border-box",
    },

    budgetCard: {
        background: "#3D5A50",
        borderRadius: "16px",
        padding: "28px 30px",
        marginBottom: "22px",
        color: "#FFFFFF",
        boxSizing: "border-box",
        minWidth: 0,
    },

    budgetHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
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
        flexShrink: 0,
    },

    budgetAmount: {
        fontFamily: "Georgia, serif",
        fontSize: "32px",
        marginTop: "25px",
        overflowWrap: "anywhere",
    },

    budgetNote: {
        marginTop: "8px",
        fontSize: "11px",
        color: "#DCE6E1",
        lineHeight: 1.5,
    },

    passwordForm: {
        maxWidth: "520px",
        width: "100%",
    },

    errorBox: {
        background: "#FBEAEA",
        color: "#A33B3B",
        borderRadius: "8px",
        padding: "11px 13px",
        fontSize: "12px",
        marginBottom: "15px",
        overflowWrap: "anywhere",
    },

    successBox: {
        background: "#E6F3EC",
        color: "#2E7D50",
        borderRadius: "8px",
        padding: "11px 13px",
        fontSize: "12px",
        marginBottom: "15px",
        overflowWrap: "anywhere",
    },
};

export default CustomerProfile;