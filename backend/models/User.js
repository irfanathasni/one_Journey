const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required :true,
        trim :true
    },
    email : {
        type :String,
        required:true,
        unique :true,
        lowercase:true,
        trim:true,
    },
    phone:{
        type:String,
        required:function() {
            return !this.googleId
        },
    },
    password :{
        type:String,
        required:function() {
            return !this.googleId
        },
        select:false
    },
    googleId :{
        type:String ,
        default:null
    },
    role: {
        type :String,
        enum:["customer","vendor" ,"admin"],
        default :"customer"
    },
    isActive :{
        type:Boolean,
        default:true,
    },
    isVerified : {
        type:Boolean,
        default:false
    },
    otp :{
        type:String,
        select:false
    },
    otpExpiresAt : {
        type :Date,
        select:false
    },
},{timestamps:true}
);

module.exports = mongoose.model("User",userSchema)