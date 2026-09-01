const VENDOR_STATUS = require("../constants/vendorStatus")
const Vendor = require("../models/Vendor")
const Category = require("../models/Category")
const VendorAvailability = require("../models/VendorAvailability")

const createVendorProfile = async (req, res, next) => {
  try {
    const { businessName, category, description,price } = req.body;
    if (!businessName || !category || !price) {
      return res.status(400).json({success: false, message: "Business Name ,category and price are required"});
    }
    if(price <0){
        return res.status(400).json({success:false,message:"Price cannot be negative"})
    }
    const categoryData = await Category.findOne({name: category.trim(),isActive: true})

    if (!categoryData) {
      return res.status(400).json({success: false,message: "Invalid or inactive category"});
    }

    const existingVendor = await Vendor.findOne({user: req.user.id})

    if (existingVendor) {
      if (existingVendor.verificationStatus === VENDOR_STATUS.REJECTED) {
        existingVendor.businessName = businessName;
        existingVendor.category = categoryData.name;
        existingVendor.description = description;
        existingVendor.verificationStatus = VENDOR_STATUS.PENDING;
        existingVendor.rejectionReason = null;

        await existingVendor.save();

        return res.status(200).json({
          success: true,
          message:
            "Vendor profile updated successfully and sent for review again.",
          data: existingVendor,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Vendor profile already exists",
      });
    }

    const vendor = await Vendor.create({
      user: req.user.id,
      businessName,
      category: categoryData.name,
      description,
      price ,
      verificationStatus: VENDOR_STATUS.PENDING,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor profile created",
      data: vendor,
    });

  } catch (error) {
    next(error);
  }
};

const getMyVendorProfile = async (req ,res, next) => {
    try {
        const vendor = await Vendor.findOne({user:req.user.id})
    
    if (!vendor) {
        return res.status(404).json({success:false,message:"no vendor profile found"})
    }
    return res.status(200).json({success:true,data:vendor})
  }catch(error){
    next(error)
  }
}

const getApprovedVendors = async (req,res,next) => {
    try{
        const { category } = req.query
        const query = { verificationStatus:VENDOR_STATUS.APPROVED,status:"active"}
        if(category) {
            query.category = category
        }
        const vendors = await Vendor.find(query).populate("user","name email phone")

        return res.status(200).json({success:true,data:vendors})
    }catch(error){
        next(error)
    }
} 

const updateVendorProfile = async (req,res,next) => {
    try{
        const { businessName,category,description,price,pricing} = req.body
        if(!businessName || !category ) {
            return res.status(400).json({success:false,message:"Business name and category are required"})
        }
        const vendor = await Vendor.findOne({user:req.user.id})
            if(!vendor) {
                return res.status(404).json({success:false,message:"Vendor Profile not found"})
            }  
            if(price !==undefined && price <0) {
                return res.status(400).json({success:false,message:"Price cannot be negative"})
            }
            if(pricing !== undefined) {
                if(!Array.isArray(pricing)) {
                    return res.status(400).json({success:false,message:"Pricing must be an array"})
                }
                for(const item of pricing) {
                    if(!item.eventType ||
                        item.minGuests === undefined ||
                        item.maxGuests === undefined ||
                        item.price === undefined
                    ){
                        return res.status(400).json({success:false,message:"Event type,guest range and price are required"})
                    }
                    if(item.minGuests <0 || item.maxGuests <0) {
                        return res.status(400).json({success:false,message:"Guest count cannot be negative"})
                    }
                    if(item.minGuests >item.maxGuests) {
                        return res.status(400).json({success:false,message:"Minimum guests cannot be greater than maximum guests"})
                    }
                    if(item.price <0) {
                        return res.status(400).json({success:false,message:"Pricing cannot be negative"})
                    }
                }
            }

        vendor.businessName = businessName
        vendor.category = category
        vendor.description = description
        if(price !== undefined) {
            vendor.price = price
        }
        if(pricing !==undefined) {
            vendor.pricing = pricing
        }
        
    await vendor.save()
    return res.status(200).json({success:true,message:"Vendor Profile updated successfully",data:vendor})
    }catch(error){
        next(error)
    }
}

const createAvailability = async(req,res,next) => {
    try{
        const { date , startTime ,endTime} = req.body 
        if(!date || !startTime ||!endTime) {
            return res.status(400).json({success:false,message:"Date,start and end time are required"})
        }
        if(startTime >=endTime) {
            return res.status(400).json({success:false,message: "End time must be after start time"})
        }

        const vendor = await Vendor.findOne({user:req.user.id})

        if(!vendor) {
            return res.status(404).json({success:false,message:"Vendor profile not found"})
        }
        if(vendor.verificationStatus !==VENDOR_STATUS.APPROVED) {
            return res.status(403).json({success:false,message:"vendor is not approved yet"})
        }

        const existingSlot = await VendorAvailability.findOne({
            vendor:vendor._id,
            date:new Date(date),
            startTime:{ $lt: endTime},
            endTime:{ $gt:startTime }
        })

        if(existingSlot) {
            return res.status(409).json({success:false,message:"This time slot overlaps with an existing slot"})
        }

        const slot = await VendorAvailability.create({
            vendor:vendor._id,
            date:new Date(date),
            startTime,
            endTime
        })

        return res.status(201).json({success:true,message:"Availability slot created successfully",data:slot})
    }catch(error){
        next(error)
    }
}

const getMyAvailability = async (req,res,next) => {
    try{
        const vendor = await Vendor.findOne({user:req.user.id})

        if(!vendor) {
            return res.status(404).json({success:false,message:"Vendor profile not found"})
        }
        const slots = await VendorAvailability.find({vendor:vendor._id}).sort({date:1,startTime:1})
          return res.status(200).json({success:true,data:slots})
    }catch (error) {
        next(error)
    }
}

const deleteAvailability = async (req,res,next) => {
    try{
        const vendor = await Vendor.findOne({user:req.user.id})
        if(!vendor) {
            return res.status(404).json({success:false,message:"Vendor profile not found"})
        }
        const slot = await VendorAvailability.findOne({_id:req.params.slotId,vendor:vendor._id})

        if(!slot) {
            return res.status(404).json({success:false,message:"Availability slot not found"})
        }

        if(slot.isBooked) {
            return res.status(400).json({success:false,message:"Booked slots cannot be deleted"})
        }

        await slot.deleteOne()
        return res.status(200).json({suucess:true,message:"Available slot deleted successfully"})
    }catch(error){
        next(error)
    }
}

const getVendorAvailability = async(req,res,next) => {
    try{
        
        const { vendorId } = req.params
        const { date } = req.query
        
        if(!date) {
            return res.status(400).json({success:false,message:"Date is required"})
        }
        const selectedDate = new Date(date)

        const startofDay = new Date(selectedDate)
        startofDay.setHours(0,0,0,0)

        const endofDay = new Date(selectedDate)
        endofDay.setHours(23,59,59,999)

        const slots = await VendorAvailability.find({vendor:vendorId,date:{$gte:startofDay,$lte:endofDay},isBooked:false})
        .sort({ startTime:1 })
        return res.status(200).json({success:true,data:slots})
 }catch(error) {
    next(error)
 }
}

const addPricingTier = async (req, res, next) => {
    try {
        const { eventType, minGuests, maxGuests, price } = req.body
        if (!eventType || minGuests === undefined || maxGuests === undefined || !price) {
            return res.status(400).json({ success: false, message: "All pricing fields are required" })
        }
        if (Number(minGuests) > Number(maxGuests)) {
            return res.status(400).json({ success: false, message: "Min guests cannot exceed max guests" })
        }
        const vendor = await Vendor.findOne({ user: req.user.id })
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" })
        }
        vendor.pricing.push({ eventType, minGuests, maxGuests, price })
        await vendor.save()
        return res.status(201).json({ success: true, message: "Pricing tier added", data: vendor })
    } catch (error) {
        next(error)
    }
}

const deletePricingTier = async (req, res, next) => {
    try {
        const { tierId } = req.params
        const vendor = await Vendor.findOne({ user: req.user.id })
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" })
        }
        vendor.pricing = vendor.pricing.filter(p => p._id.toString() !== tierId)
        await vendor.save()
        return res.status(200).json({ success: true, message: "Pricing tier removed", data: vendor })
    } catch (error) {
        next(error)
    }
}
module.exports = { 
    createVendorProfile, 
    getMyVendorProfile,
    getApprovedVendors,
    updateVendorProfile,
    createAvailability,
    getMyAvailability,
    deleteAvailability,
    getVendorAvailability,
    addPricingTier,
    deletePricingTier
}