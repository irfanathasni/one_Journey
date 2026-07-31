const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { createBooking, getMyBookings, getVendorBookings, updateBookingStatus } = require("../controllers/bookingControllers")

router.post("/create", protect, createBooking)
router.get("/my-bookings", protect, getMyBookings)
router.get("/vendor-bookings", protect, getVendorBookings)
module.exports = router