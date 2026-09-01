const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { createReview, getVendorReviews } = require("../controllers/reviewController")

router.post("/create", protect, createReview)
router.get("/vendor/:vendorId", getVendorReviews)   

module.exports = router