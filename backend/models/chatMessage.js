const mongoose = require("mongoose")
const chatMessageSchema = new mongoose.Schema({
    booking:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking",
        required:true
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    isRead :{
        type:Boolean,
        default:false
    },
},{timestamps:true})
module.exports = mongoose.model("ChatMessage",chatMessageSchema)