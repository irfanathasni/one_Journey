import { useEffect, useState } from "react";
import VendorNavbar from "../../components/VendorNavbar";
import { getMyWallet, withdrawFromWallet } from "../../services/walletService";

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
      setError(err.response?.data?.message || "Failed to load wallet");
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
      setWithdrawSuccess(`₹${numAmount.toLocaleString("en-IN")} withdrawn successfully.`);
      setAmount("");
    } catch (err) {
      setWithdrawError(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

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
      <main style={styles.main}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>WALLET</p>
          <h1 style={styles.heading}>My Wallet</h1>
          <p style={styles.subtext}>Track your earnings and withdraw your available balance.</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.topRow}>
          <div style={styles.balanceCard}>
            <p style={styles.balanceLabel}>Available Balance</p>
            <h2 style={styles.balanceValue}>₹{(wallet?.balance || 0).toLocaleString("en-IN")}</h2>
          </div>

          <div style={styles.withdrawCard}>
            <h3 style={styles.withdrawTitle}>Withdraw Funds</h3>

            {withdrawError && <div style={styles.errorBoxSmall}>{withdrawError}</div>}
            {withdrawSuccess && <div style={styles.successBoxSmall}>{withdrawSuccess}</div>}

            <form onSubmit={handleWithdraw} style={styles.withdrawForm}>
              <input type="number" min="1" placeholder="Enter amount"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                style={styles.input} />
              <button type="submit" style={styles.withdrawButton} disabled={withdrawing}>
                {withdrawing ? "Processing..." : "Withdraw"}
              </button>
            </form>
          </div>
        </div>

        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Transaction History</h3>

          {!wallet?.transactions || wallet.transactions.length === 0 ? (
            <p style={styles.emptyText}>No transactions yet.</p>
          ) : (
            <div style={styles.list}>
              {wallet.transactions.map((t, i) => (
                <div key={i} style={styles.row}>
                  <div>
                    <strong style={{ color: t.type === "credit" ? "#2E7D50" : "#B44B4B" }}>
                      {t.type === "credit" ? "+ Credit" : "− Withdrawal"}
                    </strong>
                    <p style={styles.rowDesc}>{t.description}</p>
                  </div>
                  <div style={styles.rowRight}>
                    <span style={{ color: t.type === "credit" ? "#2E7D50" : "#B44B4B", fontWeight: 700 }}>
                      {t.type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </span>
                    <p style={styles.rowDate}>{formatDate(t.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const styles = {
  page: {
     minHeight: "100vh", 
     background: "#FBF8F3" },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "40px" },
  header: { marginBottom: "28px" },
  eyebrow: { fontSize: "12px", letterSpacing: "2px", color: "#B8935A", fontWeight: 600, margin: "0 0 6px" },
  heading: { fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 400, color: "#2B2B2B", margin: 0 },
  subtext: { color: "#6B6560", fontSize: "14px", marginTop: "8px" },
  topRow: { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "18px", marginBottom: "22px" },
  balanceCard: {
    background: "#173E35", color: "#FFFFFF", borderRadius: "14px",
    padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center",
  },
  balanceLabel: { fontSize: "12px", opacity: 0.8, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "1px" },
  balanceValue: { fontFamily: "Georgia, serif", fontSize: "36px", margin: 0 },
  withdrawCard: { background: "#FFFFFF", border: "1px solid #E5DFD5", borderRadius: "14px", padding: "24px" },
  withdrawTitle: { margin: "0 0 14px", fontSize: "16px", color: "#2B2B2B" },
  withdrawForm: { display: "flex", gap: "10px" },
  input: {
    flex: 1, padding: "11px 13px", border: "1px solid #DCD5CA", borderRadius: "7px",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  },
  withdrawButton: {
    padding: "11px 22px", background: "#B8935A", color: "#FFFFFF", border: "none",
    borderRadius: "7px", fontWeight: 600, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
  },
  withdrawHint: { fontSize: "11px", color: "#999", marginTop: "10px", marginBottom: 0 },
  card: { background: "#FFFFFF", border: "1px solid #E5DFD5", borderRadius: "14px", padding: "24px" },
  cardTitle: { margin: "0 0 18px", fontSize: "18px", fontFamily: "Georgia, serif", color: "#2B2B2B" },
  emptyText: { color: "#999", fontSize: "13px" },
  list: { display: "flex", flexDirection: "column", gap: "10px" },
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", border: "1px solid #EEE", borderRadius: "10px",
  },
  rowDesc: { margin: "3px 0 0", fontSize: "12px", color: "#999" },
  rowRight: { textAlign: "right" },
  rowDate: { margin: "3px 0 0", fontSize: "11px", color: "#999" },
  errorBox: {
    background: "#FBEAEA", color: "#A33B3B", borderRadius: "7px",
    padding: "12px 14px", fontSize: "13px", marginBottom: "18px",
  },
  errorBoxSmall: {
    background: "#FBEAEA", color: "#A33B3B", borderRadius: "7px",
    padding: "9px 12px", fontSize: "12px", marginBottom: "10px",
  },
  successBoxSmall: {
    background: "#E6F3EC", color: "#2E7D50", borderRadius: "7px",
    padding: "9px 12px", fontSize: "12px", marginBottom: "10px",
  },
  center: {
    minHeight: "70vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#6B6560",
  },
  loadingIcon: { fontSize: "35px", marginBottom: "10px" },
};

export default VendorWallet;
