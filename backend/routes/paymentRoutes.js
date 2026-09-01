const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { createPaymentOrder, verifyPayment, markPaymentFailed } = require("../controllers/paymentController")

router.post("/create-order",protect,createPaymentOrder)
router.post("/verify",protect,verifyPayment)
router.post("/mark-failed",protect,markPaymentFailed)

module.exports = router