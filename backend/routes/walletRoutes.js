const express = require("express")
const router = express.Router()
const protect = require("../middleware/authMiddleware")
const { getMyWallet, withdrawFromWallet } = require("../controllers/walletController")

router.get("/my-wallet", protect, getMyWallet)
router.post("/withdraw", protect, withdrawFromWallet)

module.exports = router