 const mongoose = require("mongoose");
const VENDOR_STATUS = require("../constants/vendorStatus");
const vendorSchema = new mongoose.Schema({
    user :{
        type:mongoose.Schema.Types.ObjectId,
        ref :"User",
        required:true
    },
    businessName :{
        type: String,
        required :true
    },
    category :{
        type:String,
        required :true
    },
    description :{
        type:String
    },
    price:{
        type:Number,
        required:true,
        min:0,
        default:0
    },
    pricing: [
    {
eventType: {
    type: String,
    enum: ["Wedding","Reception","Engagement","Mehndi","Haldi","Sangeet"],
    required: true
    },
     minGuests: {
        type: Number,
        required: true,
        min: 0
    },

    maxGuests: {
        type: Number,
        required: true,
        min: 0
    },

    price: {
        type: Number,
        required: true,
        min: 0
    }
    }
],
    verificationStatus :{
        type:String,
        enum:Object.values(VENDOR_STATUS),
        default:VENDOR_STATUS.PENDING,
    },
    rejectionReason :{
        type:String,
        default :null
    },
    status:{
        type: String,
        enum:["active","inactive","blocked"],
        default: "active"
    },
 },
{timestamps:true}
);
module.exports = mongoose.model("Vendor",vendorSchema);