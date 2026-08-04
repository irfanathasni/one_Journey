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
        enum:["Photography","EventManagement" ,"Catering" ,"WeddingHall","BridalMakeup","PreMarriageCounselling"],
        required :true
    },
    description :{
        type:String
    },
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