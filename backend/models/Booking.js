const mongoose = require("mongoose")
const BOOKING_STATUS = require("../constants/bookingStatus")
const bookingSchema = new mongoose.Schema({
    wedding:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Wedding",
        required:true
    },
    vendor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vendor",
        required:true
    },
    customer :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    serviceDate :{
        type:Date ,
        required : true
    },
    status :{
        type:String,
        enum :Object.values(BOOKING_STATUS),
        default:BOOKING_STATUS.PENDING
    },
    amount :{
        type:Number,
        default:0
    }
},
{timestamps:true}
)
module.exports = mongoose.model("Booking",bookingSchema)