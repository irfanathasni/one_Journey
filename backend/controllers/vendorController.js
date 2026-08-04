const VENDOR_STATUS = require("../constants/vendorStatus")
const Vendor = require("../models/Vendor")

const createVendorProfile = async (req,res,next) => {
    try {
        const { businessName,category , description } = req.body

        if(!businessName || !category) {
            return res.status(400).json({success:false,message:"Business Name and category are required"})
        }
        const existingVendor = await Vendor.findOne({user:req.user.userId})
        if(existingVendor) {
            if(existingVendor.verificationStatus ===VENDOR_STATUS.REJECTED){
                existingVendor.businessName = businessName
                existingVendor.category = category
                existingVendor.description = description
                existingVendor.verificationStatus = VENDOR_STATUS.PENDING
                existingVendor.rejectionReason = null

            await existingVendor.save()
            return res.status(200).json({success:true,message:"Vendor profile updated successfully and send for the review again.",data:existingVendor})
            }
            return res.status(400).json({success:false,message:"Vendor profile already exists"})
        } 

        const vendor = await Vendor.create({user:req.user.userId,
            businessName,category,description,verificationStatus:VENDOR_STATUS.PENDING
        })
        return res.status(201).json({success:true,message:"Vendor profile created",data:vendor})
    }catch(error) {
        next(error)
    }
}

const getMyVendorProfile = async (req ,res, next) => {
    try {
        const vendor = await Vendor.findOne({user:req.user.userId})
    
    if (!vendor) {
        return res.status(404).json({success:false,message:"no vendor profile found"})
    }
    return res.status(200).json({success:true,data:vendor})
  }catch(error){
    next(error)
  }
}

module.exports = { createVendorProfile , getMyVendorProfile }