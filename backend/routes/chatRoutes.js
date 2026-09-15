const express = require("express")

const { getOrCreateConversation,getMyConversations,getMessages, sendMessage, uploadChatAttachment} = require("../controllers/ChatController")
const protect = require("../middleware/authMiddleware")
const upload = require("../middleware/upload");
const router = express.Router()

router.post("/conversation",protect,getOrCreateConversation)

router.get("/conversations",protect,getMyConversations)
router.get("/messages/:conversationId",protect,getMessages)
router.post("/messages/:conversationId",protect,sendMessage)
router.post("/upload",protect,upload.single("attachment"),uploadChatAttachment);
module.exports = router;