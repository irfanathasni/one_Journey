const Vendor = require("../models/Vendor")
const VENDOR_STATUS = require("../constants/vendorStatus")
const { sendVendorStatusEmail } = require("../utils/sendEmail")

const getAllVendors = async (req,res,next) => {
    try {
        const { status } = req.query
        const filter ={}
        if(status) {
            if(!Object.values(VENDOR_STATUS).includes(status)){
                return res.status(400).json({success:false,message:"Invalid vendor status"})
            }
            filter.verificationStatus =status
        }
        console.log("Filter being used:", filter)
        console.log("Status received:", status, typeof status)
        const vendors = await Vendor.find(filter).populate("user","name email phone")

        return res.status(200).json({success:true,data:vendors,count:vendors.length})
    }catch(error) {
        next (error)
    }
}

const approveVendor= async(req,res,next) => {
    try{
        const { vendorId } = req.params
        const vendor = await Vendor.findById(vendorId).populate("user", "email name")
        if(!vendor){
            return res.status(404).json({success:false,message:"Vendor not found"})
        }
        
        vendor.verificationStatus =VENDOR_STATUS.APPROVED
        vendor.rejectionReason = null
        await vendor.save()
        await sendVendorStatusEmail(
            vendor.user.email, 
            vendor.businessName,
            vendor.verificationStatus,
            vendor.rejectionReason)
       
        return res.status(200).json({success:true,message:"Vendor approved successfully",data:vendor})

    }catch(error){
        next(error)
    }
}

const rejectVendor = async (req,res,next) => {
    try{
    const { vendorId } =req.params
    const { reason }  = req.body ||{}
    if(!reason) {
        return res.status(400).json({success:false,message:"Rejection reason is required"})
    }
    const vendor = await Vendor.findById(vendorId).populate("user","email name")
    if(!vendor) {
        return res.status(404).json({success:false,message:"Vendor not found"})
    }
    vendor.verificationStatus = VENDOR_STATUS.REJECTED
    vendor.rejectionReason = reason
    await vendor.save()
    await sendVendorStatusEmail(
        vendor.user.email,
        vendor.businessName,
        vendor.verificationStatus,
        vendor.rejectionReason
    )
    return res.status(200).json({success:true,message:"vendor rejevcted successfully",data:vendor})
    }catch(error){
        next(error)
    }
}
module.exports = { getAllVendors ,approveVendor ,rejectVendor}