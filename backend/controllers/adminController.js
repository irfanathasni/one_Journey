const Vendor = require("../models/Vendor")
const VENDOR_STATUS = require("../constants/vendorStatus")
const ROLES = require("../constants/roles")
const User = require("../models/User")
const Category = require("../models/Category")
const Booking = require("../models/Booking")

const { sendVendorStatusEmail } = require("../utils/sendEmail")

const getAllVendors = async (req, res, next) => {
  try {
    const {status,page = 1,limit = 10,search = ""} = req.query;
    const filter = {};
    if (status) {
      if (!Object.values(VENDOR_STATUS).includes(status)) {
        return res.status(400).json({success: false,message: "Invalid vendor status"});
      }
      filter.verificationStatus = status
    }

    if (search.trim()) {
      filter.$or = [{ businessName: {$regex: search.trim(), $options: "i" } }];
    }
    const skip = (Number(page) - 1) * Number(limit)
    const vendors = await Vendor.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalVendors = await Vendor.countDocuments(filter);
    const totalPages = Math.ceil(totalVendors / Number(limit))

    return res.status(200).json({
      success: true,
      data: vendors,
      totalVendors,
      totalPages,
      currentPage: Number(page),
    });

  } catch (error) {
    next(error);
  }
}

const approveVendor= async(req,res,next) => {
    try{
        const { vendorId } = req.params
        const vendor = await Vendor.findById(vendorId).populate("user", "email name")
        if(!vendor){
            return res.status(404).json({success:false,message:"Vendor not found"})
        }
        if(vendor.verificationStatus ===VENDOR_STATUS.APPROVED){
            return res.status(400).json({success:false,message:"Vendor is already approved"})
        }
        
        vendor.verificationStatus =VENDOR_STATUS.APPROVED
        vendor.rejectionReason = null
        await vendor.save()
        try {
             await sendVendorStatusEmail(
            vendor.user.email, 
            vendor.businessName,
            vendor.verificationStatus,
            vendor.rejectionReason)
        }catch(emailError) {
            console.error("Vendor approved but email failed:" ,emailError.message)
        }
       
       
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

const updateVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vendor status",
      });
    }

    const vendor = await Vendor.findById(req.params.vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    vendor.status = status;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor ${status === "blocked" ? "blocked" : "unblocked"} successfully`,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
}

const getAllUsers = async(req,res,next) => {
    try{
        const page = parseInt(req.query.page) ||  1
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search ||""
        const skip = (page -1) *limit
        const query = {role:ROLES.CUSTOMER}
    if(search) {
        query.$or = [
            { name :{ $regex:search,$options:"i"}},
            {email:{ $regex :search,$options:"i"}}
        ]
    }
    const totalUsers = await User.countDocuments(query)
    const users = await User.find(query)
        .select(" -password")
        .skip(skip)
        .limit(limit)
        .lean()
    const totalPages = Math.ceil(totalUsers / limit)
    return res.status(200).json({success:true,data:users,totalUsers,totalPages,currentPage:page}) 
    }catch(error){
       next(error)
    }
}

const updateUserStatus = async(req,res,next) =>{
    try{
        const { userId } = req.params
        const user = await User.findById(userId)
        if(!user) {
            return res.status(400).json({success:false,message:"User not found"})
        }
        if(user.role === ROLES.ADMIN) {
            return res.status(400).json({success:false,message:"Cannot block/unblock an admin account"})
        }
        if(user._id.toString() === req.user.userId) {
            return res.status(403).json({success:false,message:"You cannot block your account."})
        }
        user.isActive = !user.isActive
        await user.save()
        return res.status(200).json({success:true,message:`User${user.isActive ?"unblocked":"blocked"}successfully`,data:user})
    }catch(error){
        next(error)
    }
}


const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({success: false,message: "Category name is required"})
    }
    const existingCategory = await Category.findOne({name: name.trim()})
    if (existingCategory) {
      return res.status(409).json({success: false,message: "Category already exists"})
    }
    const category = await Category.create({name: name.trim(),description})
        return res.status(201).json({success: true,message: "Category created successfully",data: category})
  } catch (error) {
    next(error);
  }
}

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 })
    return res.status(200).json({success: true,data: categories})
  } catch (error) {
    next(error);
  }
}
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({success: false,message: "Category not found",
      })
    }

    if (name) {
      const existingCategory = await Category.findOne({name: name.trim(), _id: { $ne: req.params.categoryId }})

      if (existingCategory) {
        return res.status(409).json({success: false, message: "Category already exists"});
      }
      category.name = name.trim();
    }
    if (description !== undefined) {
      category.description = description;
    }
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    await category.save();
    return res.status(200).json({success: true,message: "Category updated successfully",data: category})
  } catch (error) {
    next(error);
  }
}

const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({success: false,message: "Category not found"})
    }
    category.isActive = !category.isActive
    await category.save();
    return res.status(200).json({success: true,message: category.isActive
        ? "Category activated successfully"
        : "Category deactivated successfully",
      data: category,
    })
  } catch (error) {
    next(error);
  }
}
const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({role: ROLES.CUSTOMER})
    const totalVendors = await Vendor.countDocuments()
    const pendingVendors = await Vendor.countDocuments({verificationStatus: VENDOR_STATUS.PENDING})
    const totalBookings = await Booking.countDocuments()

    // ✅ Revenue stats
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "approved" } },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalAdvanceCollected: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$advanceAmount", 0] }
          }
      }}
    ])
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0
    const totalAdvanceCollected = revenueAgg[0]?.totalAdvanceCollected || 0
    const monthlyAgg = await Booking.aggregate([
      { $match: { status: "approved" } },
      { $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ])
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const monthlyRevenue = monthlyAgg.map(m => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue
    }))

    
    const categoryAgg = await Booking.aggregate([
      { $match: { status: "approved" } },
      { $lookup: { from: "vendors", localField: "vendor", foreignField: "_id", as: "vendorInfo" } },
      { $unwind: "$vendorInfo" },
      { $group: { _id: "$vendorInfo.category", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { revenue: -1 } }
    ])
    const categoryBreakdown = categoryAgg.map(c => ({
      category: c._id,
      count: c.count,
      revenue: c.revenue
    }))

    const recentUsers = await User.find({role: ROLES.CUSTOMER})
      .sort({ createdAt: -1 }).limit(5).select("name email createdAt");
    const recentVendors = await Vendor.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate("user", "name email").select("businessName verificationStatus createdAt");
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate("customer", "name").populate("vendor", "businessName")
      .select("customer vendor status createdAt");

    const activities = [
      ...recentUsers.map((user) => ({ type: "user", message: `New user ${user.name} registered`, createdAt: user.createdAt})),
      ...recentVendors.map((vendor) => ({ type: "vendor", message: `New vendor ${vendor.businessName} registered`, createdAt: vendor.createdAt })),
      ...recentBookings.map((booking) => ({ type: "booking", message: `New booking created`, createdAt: booking.createdAt }))
    ];
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return res.status(200).json({success: true,
      data: {totalUsers, totalVendors, pendingVendors, totalBookings,
        totalRevenue, totalAdvanceCollected,      
        monthlyRevenue,                            
        categoryBreakdown,                         
        recentActivities: activities.slice(0, 8)
      }
    });

  } catch (error) {
    next(error);
  }
};module.exports = { getAllVendors ,approveVendor ,rejectVendor,updateVendorStatus, getAllUsers ,updateUserStatus,
    createCategory,getCategories,updateCategory,toggleCategoryStatus,getActiveCategories,getDashboardStats }