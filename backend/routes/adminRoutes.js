const express = require("express")
const protect = require("../Middleware/authMiddleware")
const { getAllVendors, approveVendor, rejectVendor } = require("../controllers/adminController")
const router = express.Router()
const authorize = require("../middleware/roleMiddleware")

router.get("/vendors", protect, authorize("admin"), getAllVendors);
router.put("/vendors/:vendorId/approve", protect, authorize("admin"), approveVendor)
router.put("/vendors/:vendorId/reject", protect, authorize("admin"), rejectVendor)

module.exports = router