const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const Vendor = require("../models/Vendor");
const { createPayout } = require("../services/payoutService");

const getMyWallet = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor profile not found" });
    }

    let wallet = await Wallet.findOne({ vendor: vendor._id });

    if (!wallet) {
      wallet = await Wallet.create({
        vendor: vendor._id,
        balance: 0,
        transactions: [],
      });
    }

    return res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

const withdrawFromWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const withdrawalAmount = Number(amount);

    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid withdrawal amount" });
    }

    if (withdrawalAmount < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum withdrawal amount is ₹1" });
    }
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor profile not found" });
    }

    if (
      process.env.PAYOUT_MODE !== "demo" &&
      !vendor.payoutDetails?.fundAccountId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payout bank account is not configured",
      });
    }

    const wallet = await Wallet.findOne({ vendor: vendor._id });

    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }

    const pendingAmount = wallet.transactions
      .filter(
        (transaction) =>
          transaction.type === "withdrawal" && transaction.status === "pending",
      )
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const availableBalance = Number(wallet.balance) - pendingAmount;

    if (withdrawalAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available wallet balance",
      });
    }

    const referenceId = crypto.randomUUID();

    const transaction = {
      type: "withdrawal",
      amount: withdrawalAmount,
      status: "pending",
      referenceId,
      description: "Vendor payout to bank account",
    };

    wallet.transactions.unshift(transaction);

    await wallet.save();

    try {
      const payout = await createPayout({
        fundAccountId: vendor.payoutDetails?.fundAccountId,
        amount: withdrawalAmount,
        referenceId,
      });

      if (!payout?.id) {
        throw new Error("Payout ID was not returned by RazorpayX");
      }

      const savedTransaction = wallet.transactions.find(
        (item) => item.referenceId === referenceId,
      );

      if (!savedTransaction) {
        return res.status(500).json({
          success: false,
          message: "Withdrawal transaction could not be found",
        });
      }

      savedTransaction.payoutId = payout.id;
      savedTransaction.status = "pending";

      savedTransaction.description = "Vendor payout is being processed";

      await wallet.save();

      return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: wallet,
      });
    } catch (payoutError) {
      console.error(
        "RAZORPAYX PAYOUT ERROR:",
        payoutError.response?.data || payoutError.message,
      );

      const failedTransaction = wallet.transactions.find(
        (item) => item.referenceId === referenceId,
      );

      if (failedTransaction) {
        failedTransaction.status = "failed";

        failedTransaction.failureReason =
          payoutError.response?.data?.error?.description ||
          payoutError.message ||
          "Payout failed";

        failedTransaction.description = "Vendor payout failed";
      }

      await wallet.save();

      return res.status(400).json({
        success: false,
        message:
          payoutError.response?.data?.error?.description ||
          "Payout request failed",
        data: wallet,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWallet,
  withdrawFromWallet,
};
