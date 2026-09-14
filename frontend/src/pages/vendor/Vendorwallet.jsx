import { useEffect, useState } from "react";
import VendorNavbar from "../../components/VendorNavbar";
import {
  getMyWallet,
  withdrawFromWallet,
} from "../../services/walletService";

const VendorWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getMyWallet();
      setWallet(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

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

      setWithdrawSuccess(
        `₹${numAmount.toLocaleString(
          "en-IN"
        )} withdrawn successfully.`
      );

      setAmount("");
    } catch (err) {
      setWithdrawError(
        err.response?.data?.message || "Withdrawal failed"
      );
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

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <div
          className="vendor-wallet-top-row"
          style={styles.topRow}
        >
          <div
            className="vendor-wallet-balance-card"
            style={styles.balanceCard}
          >
            <p style={styles.balanceLabel}>
              Available Balance
            </p>

            <h2
              className="vendor-wallet-balance-value"
              style={styles.balanceValue}
            >
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h2>
          </div>

          <div
            className="vendor-wallet-withdraw-card"
            style={styles.withdrawCard}
          >
            <h3 style={styles.withdrawTitle}>
              Withdraw Funds
            </h3>

            {withdrawError && (
              <div style={styles.errorBoxSmall}>
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div style={styles.successBoxSmall}>
                {withdrawSuccess}
              </div>
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
              />

              <button
                type="submit"
                style={styles.withdrawButton}
                disabled={withdrawing}
              >
                {withdrawing
                  ? "Processing..."
                  : "Withdraw"}
              </button>
            </form>
          </div>
        </div>

        <section
          className="vendor-wallet-history-card"
          style={styles.card}
        >
          <h3 style={styles.cardTitle}>
            Transaction History
          </h3>

          {!wallet?.transactions ||
          wallet.transactions.length === 0 ? (
            <p style={styles.emptyText}>
              No transactions yet.
            </p>
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
                    key={i}
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
                        {isCredit
                          ? "+ Credit"
                          : "− Withdrawal"}
                      </strong>

                      <p style={styles.rowDesc}>
                        {t.description}
                      </p>

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
                        {Number(t.amount).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <p style={styles.rowDate}>
                        {formatDate(t.createdAt)}
                      </p>
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

  withdrawHint: {
    fontSize: "11px",
    color: "#999",
    marginTop: "10px",
    marginBottom: 0,
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

