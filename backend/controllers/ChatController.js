const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

const getOrCreateConversation = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { vendorId } = req.body;
    if (!vendorId) {
      return res.status(400).json({success: false,message: "Vendor ID is required"});
    }

    let conversation = await Conversation.findOne({customer: customerId,vendor: vendorId})
    if (!conversation) {
      conversation = await Conversation.create({
        customer: customerId,
        vendor: vendorId,
      });
    }

    const populatedConversation = await Conversation.findById(
      conversation._id
    )
      .populate("customer", "name email role")
      .populate("vendor", "name email role");

    res.status(200).json({success: true,data: populatedConversation});
  } catch (error) {
    next(error);
  }
};


const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      $or: [{ customer: userId },{ vendor: userId }],
    })
      .populate("customer", "name email role")
      .populate("vendor", "name email role")
      .sort({ lastMessageAt: -1, createdAt: -1 });

    res.status(200).json({success: true,data: conversations});
  } catch (error) {
    next(error);
  }
};


const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ customer: userId },{ vendor: userId }],
    })

    if (!conversation) {
      return res.status(404).json({success: false,message: "Conversation not found"})
    }

    const messages = await Message.find({conversation: conversationId})
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({success: true,data: messages});
  } catch (error) {
    next(error);
  }
}

const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({success: false,message: "Message is required"});
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [{ customer: senderId },{ vendor: senderId }],
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const receiverId =
      conversation.customer.toString() === senderId.toString()
        ? conversation.vendor
        : conversation.customer;

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message.trim(),
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email role")
      .populate("receiver", "name email role");

    res.status(201).json({success: true,data: populatedMessage});
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage
};