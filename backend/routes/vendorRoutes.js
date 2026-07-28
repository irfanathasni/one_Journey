const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { createVendorProfile, getMyVendorProfile } = require("../controllers/vendorController")

router.post("/create",protect,createVendorProfile)
router.get("/my-profile",protect,getMyVendorProfile)

module.exports = router