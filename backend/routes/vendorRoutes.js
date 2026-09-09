const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const requireApproveVendor = require("../middleware/vendorMiddleware");

const {createVendorProfile,getMyVendorProfile,getApprovedVendors,updateVendorProfile,createAvailability,
    getMyAvailability,deleteAvailability,getVendorAvailability,addPackage,deletePackage} = require("../controllers/vendorController")

router.post("/create", protect, createVendorProfile);
router.get("/my-profile", protect, getMyVendorProfile);
router.get("/", protect, getApprovedVendors);
router.put("/update-profile", protect, updateVendorProfile);
router.get("/:vendorId/availability", protect, getVendorAvailability);
router.post("/availability",protect,requireApproveVendor,createAvailability)
router.get("/availability",protect,requireApproveVendor,getMyAvailability)
router.delete("/availability/:slotId",protect,requireApproveVendor,deleteAvailability)
router.post("/packages",protect,requireApproveVendor,addPackage)
router.delete("/packages/:packageId",protect,requireApproveVendor,deletePackage)

module.exports = router;