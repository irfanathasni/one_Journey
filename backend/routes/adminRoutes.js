const express = require("express")
const protect = require("../middleware/authMiddleware")
const { getAllVendors, 
    approveVendor, 
    rejectVendor,
    updateVendorStatus,
     getAllUsers, 
     updateUserStatus, 
    createCategory, 
    getCategories,
    updateCategory,
    toggleCategoryStatus,
    getDashboardStats,
    getVendorReports
} = require("../controllers/adminController")
const router = express.Router()
const authorize = require("../middleware/roleMiddleware")
const ROLES = require("../constants/roles")

router.get("/vendors", protect, authorize("admin"), getAllVendors);
router.put("/vendors/:vendorId/approve", protect, authorize("admin"), approveVendor)
router.put("/vendors/:vendorId/reject", protect, authorize("admin"), rejectVendor)
router.put("/vendors/:vendorId/status",protect,authorize("admin"),updateVendorStatus)
router.get("/users",protect,authorize("admin"),getAllUsers)
router.put("/users/:userId/status",protect,authorize(ROLES.ADMIN),updateUserStatus)

router.post("/categories",protect,authorize("admin"),createCategory)
router.get("/categories",protect,authorize("admin"),getCategories)
router.put("/categories/:categoryId",protect,authorize("admin"),updateCategory)
router.patch("/categories/:categoryId/toggle-status",protect,authorize("admin"),toggleCategoryStatus)
router.get("/dashboard",protect,authorize("admin"),getDashboardStats)
router.get("/reports/vendors",protect,authorize("admin"),getVendorReports)
module.exports = router