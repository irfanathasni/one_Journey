const express = require("express")
const router = express.Router()
const { createWedding, getMyWedding } = require("../controllers/weddingController")
const protect = require("../middleware/authMiddleware")

router.post("/create",protect,createWedding)
router.get("/my-wedding",protect,getMyWedding)

module.exports = router