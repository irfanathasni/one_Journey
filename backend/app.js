require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const weddingRoutes = require("./routes/weddingRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wedding", weddingRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("One_Journey API running");
})
app.use(errorHandler);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return next(new Error("User not found"));
        }

        if (!user.isActive) {
            return next(new Error("Your account has been blocked"));
        }

        socket.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        };
        next();
    } catch (error) {
        next(new Error("Invalid or expired token"));
    }
})

const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.user.id.toString();
    onlineUsers.set(userId, socket.id);

    io.emit("userStatusChanged", {userId,status: "online"})
    console.log(`User online: ${socket.user.name}`);

    socket.on("joinConversation", async (conversationId) => {
        try {
            if (!conversationId) return;
            const Conversation = require("./models/conversationModel");
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return;
            }
            const isCustomer = conversation.customer.toString() === userId;
            const isVendor = conversation.vendor.toString() === userId;
            if (!isCustomer && !isVendor) {
                return;
            }
            const roomName = `conversation_${conversationId}`;
            socket.join(roomName)
        } catch (error) {
            console.error("Join conversation error:", error);
        }
    });

    socket.on("sendMessage", async ({ conversationId, message }) => {
        try {
            if (!conversationId || !message?.trim()) {
                return
            }
            const Conversation = require("./models/conversationModel");
            const Message = require("./models/messageModel");

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return;
            }
            const isCustomer = conversation.customer.toString() === userId;
            const isVendor = conversation.vendor.toString() === userId;
            if (!isCustomer && !isVendor) {
                return;
            }
            const receiverId = isCustomer
                ? conversation.vendor
                : conversation.customer;

            const newMessage = await Message.create({
                conversation: conversationId,
                sender: socket.user.id,
                receiver: receiverId,
                message: message.trim(),
            });

            conversation.lastMessage = message.trim();
            conversation.lastMessageAt = new Date();

            await conversation.save();

            const populatedMessage = await Message.findById(newMessage._id)
                    .populate("sender", "name email role")
                    .populate("receiver", "name email role");

            const roomName = `conversation_${conversationId}`;

            io.to(roomName).emit("receiveMessage",populatedMessage);

        } catch (error) {
            console.error("Send message error:", error);
        }
    });
       
    socket.on("markMessagesAsRead", async (conversationId) => {
        try {
            if (!conversationId) return;
            const Conversation = require("./models/conversationModel");
            const Message = require("./models/messageModel");
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            const isCustomer = conversation.customer.toString() === userId;
            const isVendor = conversation.vendor.toString() === userId;
            if (!isCustomer && !isVendor) return;
            const updatedMessages = await Message.updateMany(
                {
                    conversation: conversationId,
                    receiver: socket.user.id,
                    isRead: false
                },
                {$set: { isRead: true }}
            )

            if (updatedMessages.modifiedCount > 0) {
                const roomName = `conversation_${conversationId}`;
                io.to(roomName).emit("messagesRead", {conversationId,readBy: userId});
            }

        } catch (error) {
            console.error("Mark messages as read error:", error);
        }
    });
    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("userStatusChanged", {userId,status: "offline"});

        console.log(
            `User offline: ${socket.user.name}`
        );
    });

});
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    httpServer.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
};

startServer();