import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import axiosInstance from "../services/axiosInstance";

const VendorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await axiosInstance.post("/auth/logout", {
        refreshToken,
      });
    } catch (err) {
      console.log("Logout error", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="vendor-navbar" style={styles.navbar}>
        {/* Logo */}
        <div style={styles.logo}>
          <img
            src="/OneJourney-logo.png"
            alt="One Journey"
            style={styles.logoImage}
          />
        </div>
        {/* Desktop Navigation */}
        <nav className="vendor-nav-links" style={styles.navLinks}>
          <NavLink
            to="/vendor/dashboard"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/vendor/bookings"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Bookings
          </NavLink>

          <NavLink
            to="/vendor/availability"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Availability
          </NavLink>

          <NavLink
            to="/vendor/profile"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            My Profile
          </NavLink>

          <NavLink
            to="/vendor/messages"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Messages
          </NavLink>

          <NavLink
            to="/vendor/wallet"
            onClick={closeMenu}
            style={({ isActive }) =>
              isActive ? styles.activeNav : styles.navLink
            }
          >
            Wallet
          </NavLink>
        </nav>

        {/* Profile */}
        <div className="vendor-profile" style={styles.profileSection}>
          <div style={styles.avatar}>V</div>

          <div style={styles.profileText}>
            <strong>Vendor</strong>
            <span>Business Account</span>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="vendor-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </header>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="vendor-mobile-menu">
          <NavLink
            to="/vendor/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/vendor/bookings"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            Bookings
          </NavLink>

          <NavLink
            to="/vendor/availability"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            Availability
          </NavLink>

          <NavLink
            to="/vendor/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            My Profile
          </NavLink>

          <NavLink
            to="/vendor/messages"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            Messages
          </NavLink>

          <NavLink
            to="/vendor/wallet"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? "vendor-mobile-link active" : "vendor-mobile-link"
            }
          >
            Wallet
          </NavLink>

          <button className="vendor-mobile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <style>{`
        .vendor-navbar {
          position: relative;
          z-index: 1000;
        }

        .vendor-menu-button {
          display: none;
          border: none;
          background: transparent;
          color: #3D5A50;
          font-size: 28px;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        .vendor-mobile-menu {
          display: none;
        }

        @media (max-width: 900px) {
          .vendor-navbar {
            padding: 14px 24px !important;
          }

          .vendor-nav-links {
            gap: 16px !important;
          }

          .vendor-profile {
            gap: 7px !important;
          }

          .vendor-profile button {
            margin-left: 4px !important;
          }
        }

        @media (max-width: 700px) {
          .vendor-navbar {
            padding: 12px 16px !important;
          }

          .vendor-nav-links {
            display: none !important;
          }

          .vendor-profile {
            display: none !important;
          }

          .vendor-menu-button {
            display: block;
          }

          .vendor-mobile-menu {
            display: flex;
            flex-direction: column;
            background: #FFFFFF;
            border-bottom: 1px solid #E5DFD5;
            padding: 8px 16px 14px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
            position: relative;
            z-index: 999;
          }

          .vendor-mobile-link {
            text-decoration: none;
            color: #6B6560;
            font-size: 14px;
            padding: 12px 10px;
            border-bottom: 1px solid #F0EBE4;
          }

          .vendor-mobile-link.active {
            color: #3D5A50;
            font-weight: 600;
            background: #F8F5F0;
          }

          .vendor-mobile-logout {
            margin-top: 10px;
            padding: 10px 12px;
            background: transparent;
            border: 1px solid #C97B84;
            border-radius: 6px;
            color: #C97B84;
            cursor: pointer;
            font-size: 13px;
          }
        }
          @media (max-width: 380px) {
          .vendor-navbar {
            padding: 10px 12px !important;
          }

          .vendor-navbar .logo img {
            width: 120px !important;
          }

          .vendor-menu-button {
            font-size: 25px;
          }
        }
      `}</style>
    </>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 40px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E5DFD5",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },

  logoImage: {
    width: "150px",
    height: "auto",
    objectFit: "contain",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  navLink: {
    textDecoration: "none",
    color: "#6B6560",
    fontSize: "14px",
    padding: "8px 0",
  },

  activeNav: {
    textDecoration: "none",
    color: "#3D5A50",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 0",
    borderBottom: "2px solid #3D5A50",
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#3D5A50",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
  },

  profileText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "12px",
  },

  logoutButton: {
    marginLeft: "12px",
    padding: "7px 12px",
    background: "transparent",
    border: "1px solid #C97B84",
    borderRadius: "6px",
    color: "#C97B84",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default VendorNavbar;
