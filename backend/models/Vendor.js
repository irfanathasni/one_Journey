 const mongoose = require("mongoose")

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
    isVerified :{
        type:Boolean,
        default:false
    },
    status:{
        type: String,
        enum:["active","inactive","blocked"],
        default:"active"
    },
 },
{timestamps:true}
);
module.exports = mongoose.model("Vendor",vendorSchema);