const express = require("express");

const router = express.Router();

const {
  handleRazorpayXWebhook,
} = require("../controllers/razorpayWebhookController");

router.post(
  "/razorpayx",
  express.raw({ type: "application/json" }),
  handleRazorpayXWebhook,
);

module.exports = router;
