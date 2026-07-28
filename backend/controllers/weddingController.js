const Wedding = require("../models/Wedding")
const wedding = require("../models/Wedding")

const createWedding = async(req,res,next) => {
    try{
        const { brideName ,groomName , weddingDate , venue , guestCount , totalBudget} = req.body
        if(!brideName || !groomName || !weddingDate) {
            return res.status(400).json({sucess:false,message:"Bride Name ,groom Name,and wedding Date are required"})
        }
        const wedding = await Wedding.create({
            customer:req.user.userId,
            brideName,
            groomName,
            weddingDate,
            venue,
            guestCount,
            totalBudget
        })
        return res.status(201).json({ success:true,message:"Wedding created successfull",data:wedding})
    }catch(error){
        next(error)
    }
 
}
const getMyWedding = async (req,res,next) => {
    try{
        const wedding = await Wedding.findOne({ customer :req.user.userId})
        if (!wedding) {
            return res.status(404).json({success:false,message:"No wedding found"})
        }
        return res.status(200).json({success:true,data:wedding})
    }catch(error){
        next(error)
    }
}
module.exports = { createWedding , getMyWedding}