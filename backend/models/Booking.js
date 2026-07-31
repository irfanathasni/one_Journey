const mongoose = require("mongoose")
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
        enum :["pending","approved","rejected","completed","cancelled"],
        default:"pending"
    },
    amount :{
        type:Number,
        default:0
    }
},
{timestamps:true}
)
module.exports = mongoose.model("Booking",bookingSchema)