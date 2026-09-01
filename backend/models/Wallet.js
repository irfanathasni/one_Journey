const mongoose = require("mongoose")

const walletSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: { 
            type: String, 
            enum: ["credit", "withdrawal"], 
            required: true 
        },
        amount: { 
            type: Number, 
            required: true 
        },
        description: { 
            type: String 
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }]
}, { timestamps: true })

module.exports = mongoose.model("Wallet", walletSchema)