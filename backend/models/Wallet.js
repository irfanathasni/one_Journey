const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
    {
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

        transactions: [
            {
                type: {
                    type: String,
                    enum: ["credit", "withdrawal"],
                    required: true
                },

                amount: {
                    type: Number,
                    required: true
                },

                status: {
                    type: String,
                    enum: ["pending", "success", "failed"],
                    default: "success"
                },

                payoutId: {
                    type: String,
                    default: null
                },

                failureReason: {
                    type: String,
                    default: null
                },

                referenceId: {
                    type: String,
                    default: null
                },

                description: {
                    type: String
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Wallet", walletSchema);