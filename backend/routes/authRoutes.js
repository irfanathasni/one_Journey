const express = require("express");
const router = express.Router();

const { register, login, getProfile, updateProfile, changePassword, logout, refreshAccessToken, googleLogin } = require("../controllers/authController");
const protect = require("../Middleware/authMiddleware");
router.post("/register",register)
router.post ("/login",login)
router.post("/google",googleLogin)
router.post("/refresh" ,refreshAccessToken)
router.get("/profile",protect,getProfile)
router.put("/profile",protect,updateProfile)
router.put("/change-password",protect,changePassword)
router.post("/logout",protect,logout)
module.exports = router;