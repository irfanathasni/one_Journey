const mongoose = require("mongoose");
const VENDOR_STATUS = require("../constants/vendorStatus");

const vendorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        businessName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        description: {
            type: String,
            trim: true
        },

        packages: [
            {
                packageType: {
                    type: String,
                    enum: ["Normal", "Premium"],
                    required: true
                },

                packageName: {
                    type: String,
                    required: true,
                    trim: true
                },

                description: {
                    type: String,
                    required: true,
                    trim: true
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],

        payoutDetails: {
            contactId: {
                type: String,
                default: null
            },

            fundAccountId: {
                type: String,
                default: null
            },

            accountHolderName: {
                type: String,
                default: null
            },

            bankAccountLast4: {
                type: String,
                default: null
            },

            ifsc: {
                type: String,
                default: null
            }
        },

        verificationStatus: {
            type: String,
            enum: Object.values(VENDOR_STATUS),
            default: VENDOR_STATUS.PENDING
        },

        rejectionReason: {
            type: String,
            default: null
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Vendor", vendorSchema);