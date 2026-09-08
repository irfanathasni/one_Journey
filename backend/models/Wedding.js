const mongoose = require("mongoose")
const weddingSchema = new mongoose.Schema({
    customer :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    brideName: {
        type:String,
        required:true
    },
    groomName:{
        type:String,
        required:true
    },
    weddingDate:{
        type:String
    },
    guestCount:{
        type:Number,
        default:0
    },
    venue: {
    type: String,
    trim: true,
    default: ""
    },
    location: {
    type: String,
    trim: true,
    default: ""
    },
    totalBudget :{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum :["planning" , "confirmed" , "completed" ,"cancelled"],
        default :"planning"
    },
},{timestamps :true}
);

module.exports = mongoose.model("Wedding" , weddingSchema)