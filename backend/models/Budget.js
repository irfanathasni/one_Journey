const mongoose = require("mongoose")
const budgetSchema =  new mongoose.Schema({
    wedding:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Wedding",
        required:true
    },
    totalBudget :{
        type:Number,
        required:true
    },
    expenses:[{
        title :String,
        amount:Number,
        category:String,
        date:{
            type:Date,
            default:Date.now
        },
            }]
},{timestamps:true})
module.exports = mongoose.model("Budget" ,budgetSchema)