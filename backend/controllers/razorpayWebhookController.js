const crypto = require("crypto");
const Wallet = require("../models/Wallet");

const handleRazorpayXWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res
        .status(400)
        .json({ success: false, message: "Webhook signature missing" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAYX_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (
      event.event === "payout.processed" ||
      event.event === "payout.failed" ||
      event.event === "payout.reversed"
    ) {
      const payout = event.payload?.payout?.entity;

      if (!payout) {
        return res.status(200).json({ success: true });
      }

      const payoutId = payout.id;

      const wallet = await Wallet.findOne({
        "transactions.payoutId": payoutId,
      });

      if (!wallet) {
        console.log("Wallet not found for payout:", payoutId);

        return res.status(200).json({ success: true });
      }

      const transaction = wallet.transactions.find(
        (item) => item.payoutId === payoutId,
      );

      if (!transaction) {
        return res.status(200).json({ success: true });
      }

      if (payout.status === "processed") {
        if (transaction.status === "pending") {
          transaction.status = "success";
          transaction.description = "Vendor payout completed";
          wallet.balance -= Number(transaction.amount);
        }
      }

      if (payout.status === "failed" || payout.status === "reversed") {
        if (transaction.status === "success") {
          wallet.balance += Number(transaction.amount);
        }
        if (transaction.status !== "failed") {
          transaction.status = "failed";

          transaction.failureReason =
            payout.status_details?.description || `Payout ${payout.status}`;

          transaction.description = "Vendor payout failed";
        }
      }

      await wallet.save();
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("RAZORPAYX WEBHOOK ERROR:", error);

    return res
      .status(500)
      .json({ success: false, message: "Webhook processing failed" });
  }
};

module.exports = {
  handleRazorpayXWebhook,
};
