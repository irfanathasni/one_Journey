const express = require("express")

const { getOrCreateConversation,getMyConversations,getMessages, sendMessage } = require("../controllers/ChatController")
const protect = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/conversation",protect,getOrCreateConversation)

router.get("/conversations",protect,getMyConversations)
router.get("/messages/:conversationId",protect,getMessages)
router.post("/messages/:conversationId",protect,sendMessage)
module.exports = router;