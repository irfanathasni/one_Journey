const mongoose = require("mongoose")
const availabilitySchema = new mongoose.Schema({
        vendor :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Vendor" ,
            required:true
        },
        date: {
            type: Date,
            required: true,
        },

        startTime: {
            type: String,
            required: true,
        },

        endTime: {
            type: String,
            required: true,
        },

        isBooked: {
            type: Boolean,
            default: false,
        },
    },
  { timestamps: true }
)
module.exports = mongoose.model("VendorAvailability",availabilitySchema)