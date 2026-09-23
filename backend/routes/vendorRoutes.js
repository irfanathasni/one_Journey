const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const requireApproveVendor = require("../middleware/vendorMiddleware");

const {
  createVendorProfile,
  getMyVendorProfile,
  getApprovedVendors,
  updateVendorProfile,
  createAvailability,
  getMyAvailability,
  deleteAvailability,
  getVendorAvailability,
  addPackage,
  updatePackage,
  deletePackage,
  setupVendorPayout,
} = require("../controllers/vendorController");

router.post("/create", protect, createVendorProfile);
router.get("/my-profile", protect, getMyVendorProfile);
router.get("/", protect, getApprovedVendors);
router.put("/update-profile", protect, updateVendorProfile);
router.post("/payout/setup", protect, requireApproveVendor, setupVendorPayout);
router.get("/:vendorId/availability", protect, getVendorAvailability);
router.post("/availability", protect, requireApproveVendor, createAvailability);
router.get("/availability", protect, requireApproveVendor, getMyAvailability);
router.delete(
  "/availability/:slotId",
  protect,
  requireApproveVendor,
  deleteAvailability,
);
router.post("/packages", protect, requireApproveVendor, addPackage);
router.put(
  "/packages/:packageId",
  protect,
  requireApproveVendor,
  updatePackage,
);
router.delete(
  "/packages/:packageId",
  protect,
  requireApproveVendor,
  deletePackage,
);

module.exports = router;
