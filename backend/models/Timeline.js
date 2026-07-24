const mongoose = require("mongoose")
const timelineSchema = new mongoose.Schema({
    wedding:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"wedding",
        required:true
    },
    tasks:[
        {title :String,
            dueDate:Date,
            status:{type:String,
                enum:["pending","in-progress","compleated"],
            },
        },
    ],
},{timestamps:true})
module.exports = mongoose.model("Timeline" ,timelineSchema);