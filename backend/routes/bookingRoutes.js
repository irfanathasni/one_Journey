const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware");
const { createBooking, getMyBookings, getVendorBookings, 
    updateBookingStatus, completeBooking, requestFinalPayment } = require("../controllers/bookingControllers")

router.post("/create", protect, createBooking)
router.get("/my-bookings", protect, getMyBookings)
router.get("/vendor-bookings", protect, getVendorBookings)
router.put("/:bookingId/status",protect,updateBookingStatus)
router.patch("/:bookingId/complete",protect,completeBooking)
router.patch("/:bookingId/request-final-payment",protect,requestFinalPayment)
module.exports = router