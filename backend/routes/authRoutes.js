const express = require("express");
const router = express.Router();

const { register, login, getProfile, updateProfile, 
    changePassword, logout, refreshAccessToken, googleLogin, verifyOTP, 
    resendOTP,
    forgotPassword,
    resetPassword} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
router.post("/register",register)
router.post ("/login",login)
router.post("/google",googleLogin)
router.post("/refresh" ,refreshAccessToken)
router.get("/profile",protect,getProfile)
router.put("/profile",protect,updateProfile)
router.put("/change-password",protect,changePassword)
router.post("/logout",protect,logout)
router.post("/verify-otp",verifyOTP)
router.post("/resend-otp" , resendOTP)
router.post("/forgot-password",forgotPassword)
router.put("/reset-password/:token",resetPassword)
module.exports = router