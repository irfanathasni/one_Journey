const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const requireApproveVendor = require("../Middleware/vendorMiddleware")
const { createVendorProfile, 
    getMyVendorProfile, 
    getApprovedVendors ,
    updateVendorProfile, 
    createAvailability,
    getMyAvailability,
    deleteAvailability,
    getVendorAvailability,
    addPricingTier,
    deletePricingTier
} = require("../controllers/vendorController")

router.post("/create",protect,createVendorProfile)
router.get("/my-profile",protect,getMyVendorProfile)
router.get("/",protect,getApprovedVendors)
router.put("/update-profile", protect, updateVendorProfile)

router.get("/:vendorId/availability",protect,getVendorAvailability)
router.post("/availability",protect,requireApproveVendor,createAvailability)
router.get("/availability",protect,requireApproveVendor,getMyAvailability)
router.delete("/availability/:slotId",protect,requireApproveVendor,deleteAvailability)
router.post("/pricing", protect, addPricingTier)
router.delete("/pricing/:tierId", protect, deletePricingTier)
module.exports = router
