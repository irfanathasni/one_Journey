const express = require("express");

const { getActiveCategories } = require("../controllers/adminController");
const router = express.Router()

router.get("/", getActiveCategories)
module.exports = router;