import { useEffect, useState } from "react";
import VendorNavbar from "../../components/VendorNavbar";

import { getMyWallet, withdrawFromWallet } from "../../services/walletService";

import {
  getMyVendorProfile,
  setupVendorPayout,
} from "../../services/vendorService";

const VendorWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [vendor, setVendor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  const [showBankForm, setShowBankForm] = useState(false);
  const [settingUpBank, setSettingUpBank] = useState(false);
  const [bankError, setBankError] = useState("");
  const [bankSuccess, setBankSuccess] = useState("");

  useEffect(() => {
    fetchWallet();
    fetchVendorProfile();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);

      const res = await getMyWallet();

      setWallet(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const res = await getMyVendorProfile();

      setVendor(res.data);
      if (!res.data?.payoutDetails?.fundAccountId) {
        setShowBankForm(true);
      }
    } catch (err) {
      console.error("Failed to load vendor profile:", err);
    }
  };

  const handleBankSetup = async (e) => {
    e.preventDefault();

    setBankError("");
    setBankSuccess("");

    if (!accountHolderName.trim()) {
      setBankError("Enter account holder name");
      return;
    }

    if (!accountNumber.trim()) {
      setBankError("Enter account number");
      return;
    }

    if (!ifsc.trim()) {
      setBankError("Enter IFSC code");
      return;
    }

    setSettingUpBank(true);

    try {
      const res = await setupVendorPayout({
        accountHolderName: accountHolderName.trim(),

        accountNumber: accountNumber.trim(),

        ifsc: ifsc.trim().toUpperCase(),
      });

      setBankSuccess(res.message || "Bank account configured successfully");
      setVendor((prev) => ({
        ...prev,

        payoutDetails: {
          ...prev?.payoutDetails,

          accountHolderName: accountHolderName.trim(),

          bankAccountLast4: accountNumber.slice(-4),

          ifsc: ifsc.trim().toUpperCase(),
          fundAccountId: "configured",
        },
      }));

      setAccountHolderName("");
      setAccountNumber("");
      setIfsc("");

      setShowBankForm(false);
    } catch (err) {
      setBankError(
        err.response?.data?.message || "Failed to configure bank account",
      );
    } finally {
      setSettingUpBank(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    setWithdrawError("");
    setWithdrawSuccess("");
    if (!vendor?.payoutDetails?.fundAccountId) {
      setWithdrawError(
        "Please configure your bank account before withdrawing.",
      );
      return;
    }

    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setWithdrawError("Enter a valid amount");
      return;
    }

    if (wallet && numAmount > wallet.balance) {
      setWithdrawError("Amount exceeds available balance");
      return;
    }

    setWithdrawing(true);

    try {
      const res = await withdrawFromWallet(numAmount);

      setWallet(res.data);
      const latestTransaction = res.data?.transactions?.find(
        (transaction) => transaction.type === "withdrawal",
      );

      if (latestTransaction?.status === "pending") {
        setWithdrawSuccess(
          `₹${numAmount.toLocaleString(
            "en-IN",
          )} withdrawal request submitted successfully.`,
        );
      } else {
        setWithdrawSuccess(
          `₹${numAmount.toLocaleString("en-IN")} withdrawn successfully.`,
        );
      }

      setAmount("");
    } catch (err) {
      setWithdrawError(err.response?.data?.message || "Withdrawal failed");

      if (err.response?.data?.data) {
        setWallet(err.response.data.data);
      }
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div style={styles.page}>
        <VendorNavbar />

        <div style={styles.center}>
          <div style={styles.loadingIcon}>💰</div>

          <p>Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <VendorNavbar />

      <main className="vendor-wallet-main" style={styles.main}>
        <div className="vendor-wallet-header" style={styles.header}>
          <p style={styles.eyebrow}>WALLET</p>

          <h1 className="vendor-wallet-heading" style={styles.heading}>
            My Wallet
          </h1>

          <p className="vendor-wallet-subtext" style={styles.subtext}>
            Track your earnings and withdraw your available balance.
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <section className="vendor-wallet-bank-card" style={styles.bankCard}>
          <div className="vendor-wallet-bank-header" style={styles.bankHeader}>
            <div>
              <p style={styles.bankEyebrow}>PAYOUT ACCOUNT</p>

              <h3 style={styles.bankTitle}>Bank Account</h3>
            </div>

            {vendor?.payoutDetails?.fundAccountId && (
              <span style={styles.configuredBadge}>✓ Configured</span>
            )}
          </div>

          {/* Bank error */}

          {bankError && <div style={styles.errorBoxSmall}>{bankError}</div>}

          {/* Bank success */}

          {bankSuccess && (
            <div style={styles.successBoxSmall}>{bankSuccess}</div>
          )}

          {!vendor?.payoutDetails?.fundAccountId && showBankForm ? (
            <form
              onSubmit={handleBankSetup}
              className="vendor-wallet-bank-form"
              style={styles.bankForm}
            >
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Account Holder Name</label>

                <input
                  type="text"
                  placeholder="Enter account holder name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Account Number</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter bank account number"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/\D/g, ""))
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>IFSC Code</label>

                <input
                  type="text"
                  maxLength={11}
                  placeholder="Example: HDFC0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                style={styles.setupButton}
                disabled={settingUpBank}
              >
                {settingUpBank ? "Setting up..." : "Save Bank Account"}
              </button>
            </form>
          ) : vendor?.payoutDetails?.fundAccountId ? (
            <div
              className="vendor-wallet-bank-details"
              style={styles.bankDetails}
            >
              <div style={styles.bankDetailItem}>
                <span style={styles.detailLabel}>Account Holder</span>

                <strong style={styles.detailValue}>
                  {vendor.payoutDetails.accountHolderName}
                </strong>
              </div>

              <div style={styles.bankDetailItem}>
                <span style={styles.detailLabel}>Bank Account</span>

                <strong style={styles.detailValue}>
                  •••• {vendor.payoutDetails.bankAccountLast4}
                </strong>
              </div>

              <div style={styles.bankDetailItem}>
                <span style={styles.detailLabel}>IFSC</span>

                <strong style={styles.detailValue}>
                  {vendor.payoutDetails.ifsc}
                </strong>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowBankForm(true)}
              style={styles.setupButton}
            >
              Setup Bank Account
            </button>
          )}
        </section>

        <div className="vendor-wallet-top-row" style={styles.topRow}>
          {/* BALANCE */}

          <div
            className="vendor-wallet-balance-card"
            style={styles.balanceCard}
          >
            <p style={styles.balanceLabel}>Available Balance</p>

            <h2
              className="vendor-wallet-balance-value"
              style={styles.balanceValue}
            >
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h2>
          </div>

          {/* WITHDRAW */}

          <div
            className="vendor-wallet-withdraw-card"
            style={styles.withdrawCard}
          >
            <h3 style={styles.withdrawTitle}>Withdraw Funds</h3>

            {!vendor?.payoutDetails?.fundAccountId && (
              <div style={styles.warningBoxSmall}>
                Please configure your bank account before withdrawing funds.
              </div>
            )}

            {withdrawError && (
              <div style={styles.errorBoxSmall}>{withdrawError}</div>
            )}

            {withdrawSuccess && (
              <div style={styles.successBoxSmall}>{withdrawSuccess}</div>
            )}

            <form
              onSubmit={handleWithdraw}
              className="vendor-wallet-withdraw-form"
              style={styles.withdrawForm}
            >
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
                disabled={!vendor?.payoutDetails?.fundAccountId || withdrawing}
              />

              <button
                type="submit"
                style={styles.withdrawButton}
                disabled={withdrawing || !vendor?.payoutDetails?.fundAccountId}
              >
                {withdrawing ? "Processing..." : "Withdraw"}
              </button>
            </form>
          </div>
        </div>

        <section className="vendor-wallet-history-card" style={styles.card}>
          <h3 style={styles.cardTitle}>Transaction History</h3>

          {!wallet?.transactions || wallet.transactions.length === 0 ? (
            <p style={styles.emptyText}>No transactions yet.</p>
          ) : (
            <div style={styles.list}>
              {wallet.transactions.map((t, i) => {
                const isCredit = t.type === "credit";

                const statusLabel =
                  t.status === "pending"
                    ? "Pending"
                    : t.status === "failed"
                      ? "Failed"
                      : "Success";

                return (
                  <div
                    key={t.referenceId || t.payoutId || i}
                    className="vendor-wallet-transaction-row"
                    style={styles.row}
                  >
                    <div
                      className="vendor-wallet-transaction-info"
                      style={styles.transactionInfo}
                    >
                      <strong
                        style={{
                          color: isCredit
                            ? "#2E7D50"
                            : t.status === "failed"
                              ? "#B44B4B"
                              : "#8A6A32",
                        }}
                      >
                        {isCredit ? "+ Credit" : "− Withdrawal"}
                      </strong>

                      <p style={styles.rowDesc}>{t.description}</p>

                      {!isCredit && (
                        <span
                          style={{
                            ...styles.statusBadge,

                            background:
                              t.status === "pending"
                                ? "#FFF4D6"
                                : t.status === "success"
                                  ? "#E6F3EC"
                                  : "#FBEAEA",

                            color:
                              t.status === "pending"
                                ? "#8A6A32"
                                : t.status === "success"
                                  ? "#2E7D50"
                                  : "#A33B3B",
                          }}
                        >
                          {statusLabel}
                        </span>
                      )}
                    </div>

                    <div
                      className="vendor-wallet-transaction-right"
                      style={styles.rowRight}
                    >
                      <span
                        className="vendor-wallet-transaction-amount"
                        style={{
                          color: isCredit
                            ? "#2E7D50"
                            : t.status === "failed"
                              ? "#B44B4B"
                              : "#8A6A32",

                          fontWeight: 700,
                        }}
                      >
                        {isCredit ? "+" : "-"}₹
                        {Number(t.amount).toLocaleString("en-IN")}
                      </span>

                      <p style={styles.rowDate}>{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style>{`
        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .vendor-wallet-main {
            padding: 32px 24px !important;
          }

          .vendor-wallet-top-row {
            grid-template-columns: 1fr !important;
          }

          .vendor-wallet-balance-card {
            min-height: 150px;
          }

          .vendor-wallet-bank-form {
            grid-template-columns: 1fr 1fr !important;
          }

          .vendor-wallet-bank-details {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {
          .vendor-wallet-main {
            padding: 24px 16px !important;
          }

          .vendor-wallet-header {
            margin-bottom: 22px !important;
          }

          .vendor-wallet-heading {
            font-size: 28px !important;
          }

          .vendor-wallet-subtext {
            font-size: 13px !important;
            line-height: 1.5;
          }

          .vendor-wallet-bank-card {
            padding: 20px !important;
          }

          .vendor-wallet-bank-form {
            grid-template-columns: 1fr !important;
          }

          .vendor-wallet-bank-details {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .vendor-wallet-bank-header {
            flex-wrap: wrap;
          }

          .vendor-wallet-balance-card {
            padding: 22px !important;
            min-height: auto !important;
          }

          .vendor-wallet-balance-value {
            font-size: 30px !important;
            overflow-wrap: anywhere;
          }

          .vendor-wallet-withdraw-card {
            padding: 20px !important;
          }

          .vendor-wallet-withdraw-form {
            flex-direction: column !important;
          }

          .vendor-wallet-withdraw-form input,
          .vendor-wallet-withdraw-form button {
            width: 100%;
          }

          .vendor-wallet-history-card {
            padding: 20px !important;
          }

          .vendor-wallet-transaction-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 13px !important;
          }

          .vendor-wallet-transaction-info {
            min-width: 0;
          }

          .vendor-wallet-transaction-info strong {
            overflow-wrap: anywhere;
          }

          .vendor-wallet-transaction-right {
            text-align: left !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            border-top: 1px solid #EEEEEE;
            padding-top: 10px;
          }

          .vendor-wallet-transaction-amount {
            font-size: 14px;
          }

          .vendor-wallet-transaction-right p {
            margin: 0 !important;
          }
        }

        /* =========================
           SMALL MOBILE
        ========================= */

        @media (max-width: 380px) {
          .vendor-wallet-main {
            padding: 20px 12px !important;
          }

          .vendor-wallet-heading {
            font-size: 25px !important;
          }

          .vendor-wallet-bank-card {
            padding: 16px !important;
          }

          .vendor-wallet-balance-card {
            padding: 18px !important;
          }

          .vendor-wallet-balance-value {
            font-size: 27px !important;
          }

          .vendor-wallet-withdraw-card,
          .vendor-wallet-history-card {
            padding: 16px !important;
          }

          .vendor-wallet-transaction-row {
            padding: 11px !important;
          }

          .vendor-wallet-transaction-right {
            flex-direction: column;
            align-items: flex-start;
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
  },

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px",
  },

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#B8935A",
    fontWeight: 600,
    margin: "0 0 6px",
  },

  heading: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: 400,
    color: "#2B2B2B",
    margin: 0,
  },

  subtext: {
    color: "#6B6560",
    fontSize: "14px",
    marginTop: "8px",
  },

  // =========================
  // BANK ACCOUNT
  // =========================

  bankCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "22px",
    boxSizing: "border-box",
  },

  bankHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "18px",
  },

  bankEyebrow: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#B8935A",
    fontWeight: 600,
    margin: "0 0 5px",
  },

  bankTitle: {
    margin: 0,
    fontSize: "18px",
    fontFamily: "Georgia, serif",
    color: "#2B2B2B",
  },

  configuredBadge: {
    background: "#E6F3EC",
    color: "#2E7D50",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  bankForm: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formLabel: {
    fontSize: "12px",
    color: "#6B6560",
    fontWeight: 600,
  },

  bankDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  bankDetailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  detailLabel: {
    fontSize: "11px",
    color: "#999",
  },

  detailValue: {
    fontSize: "14px",
    color: "#2B2B2B",
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: "18px",
    marginBottom: "22px",
  },

  balanceCard: {
    background: "#173E35",
    color: "#FFFFFF",
    borderRadius: "14px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxSizing: "border-box",
  },

  balanceLabel: {
    fontSize: "12px",
    opacity: 0.8,
    margin: "0 0 10px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  balanceValue: {
    fontFamily: "Georgia, serif",
    fontSize: "36px",
    margin: 0,
    overflowWrap: "anywhere",
  },

  withdrawCard: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },

  withdrawTitle: {
    margin: "0 0 14px",
    fontSize: "16px",
    color: "#2B2B2B",
  },

  withdrawForm: {
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    width: "100%",
    padding: "11px 13px",
    border: "1px solid #DCD5CA",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  withdrawButton: {
    padding: "11px 22px",
    background: "#B8935A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  setupButton: {
    padding: "11px 20px",
    background: "#173E35",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },

  cardTitle: {
    margin: "0 0 18px",
    fontSize: "18px",
    fontFamily: "Georgia, serif",
    color: "#2B2B2B",
  },

  emptyText: {
    color: "#999",
    fontSize: "13px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    border: "1px solid #EEE",
    borderRadius: "10px",
    gap: "15px",
  },

  transactionInfo: {
    minWidth: 0,
    flex: 1,
  },

  rowDesc: {
    margin: "3px 0 0",
    fontSize: "12px",
    color: "#999",
    overflowWrap: "anywhere",
    lineHeight: 1.5,
  },

  rowRight: {
    textAlign: "right",
    flexShrink: 0,
  },

  rowDate: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#999",
  },

  errorBox: {
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "7px",
    padding: "12px 14px",
    fontSize: "13px",
    marginBottom: "18px",
  },

  errorBoxSmall: {
    background: "#FBEAEA",
    color: "#A33B3B",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "12px",
    marginBottom: "10px",
    overflowWrap: "anywhere",
  },

  successBoxSmall: {
    background: "#E6F3EC",
    color: "#2E7D50",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "12px",
    marginBottom: "10px",
    overflowWrap: "anywhere",
  },

  warningBoxSmall: {
    background: "#FFF4D6",
    color: "#8A6A32",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "12px",
    marginBottom: "10px",
    overflowWrap: "anywhere",
  },

  center: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#6B6560",
    padding: "20px",
    textAlign: "center",
  },

  loadingIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  statusBadge: {
    display: "inline-block",
    marginTop: "6px",
    padding: "3px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 600,
  },
};

export default VendorWallet;
