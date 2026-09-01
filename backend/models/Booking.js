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
     startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status :{
        type:String,
        enum :Object.values(BOOKING_STATUS),
        default:BOOKING_STATUS.PENDING
    },
    finalPaymentStatus :{
        type:String,
        enum:["not_requested","requested","paid"],
        default:"not_requested"
    },
    amount :{
        type:Number,
        default:0
    },
    availabilitySlot:{
        type:mongoose.Schema.ObjectId,
        ref:"VendorAvailability",
        required:true
    },
    advanceAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    eventType: {
        type: String,
        enum: ["Wedding","Reception","Engagement","Mehndi","Haldi","Sangeet"],
    },
    guestCount: {
        type: Number,
        min: 0
},
},
{timestamps:true}
)
module.exports = mongoose.model("Booking",bookingSchema)