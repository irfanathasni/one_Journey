const Vendor = require("../models/Vendor")
const VENDOR_STATUS = require("../constants/vendorStatus")
const ROLES = require("../constants/roles")
const User = require("../models/User")
const Category = require("../models/Category")
const Booking = require("../models/Booking")
const BOOKING_STATUS = require("../constants/bookingStatus")

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

    const totalVendors = await Vendor.countDocuments();

    const pendingVendors = await Vendor.countDocuments({verificationStatus: VENDOR_STATUS.PENDING});
    const totalBookings = await Booking.countDocuments();
    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const recentUsers = await User.find({role: ROLES.CUSTOMER})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const recentVendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("businessName verificationStatus createdAt");

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name")
      .populate("vendor", "businessName")
      .select("customer vendor status createdAt");

      const activities = [...recentUsers.map((user) => ({
        type: "user",
        message: `New user ${user.name} registered`,
        createdAt: user.createdAt,
      })),

      ...recentVendors.map((vendor) => ({
        type: "vendor",
        message: `New vendor ${vendor.businessName} registered`,
        createdAt: vendor.createdAt,
      })),

      ...recentBookings.map((booking) => ({
        type: "booking",
        message: "New booking created",
        createdAt: booking.createdAt,
      })),
    ];
    activities.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalVendors,
        pendingVendors,
        totalBookings,
        totalRevenue,
        recentActivities: activities.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
}

const getVendorReports = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;

    const matchStage = {};

    if (period) {
      const now = new Date();

      let start;
      let end;

      if (period === "day") {
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
      }

      if (period === "month") {
        start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        end = new Date(now.getFullYear(),now.getMonth() + 1,1)}

      if (period === "year") {start = new Date(now.getFullYear(),0,1);
        end = new Date(now.getFullYear() + 1,0,1)
      }

      if (!start || !end) {
        return res.status(400).json({success: false,message: "Invalid period. Use day, month or year"})
      }

      matchStage.serviceDate = {$gte: start,$lt: end}
    }
    if (startDate || endDate) {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Both startDate and endDate are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be after end date",
        });
      }

      // Include complete end date
      end.setHours(23, 59, 59, 999);

      matchStage.serviceDate = {
        $gte: start,
        $lte: end,
      };
    }

    // --------------------------------
    // Vendor Report Aggregation
    // --------------------------------
    const vendorReports = await Booking.aggregate([
      // Filter bookings by service date
      {
        $match: matchStage,
      },

      // Group bookings by vendor
      {
        $group: {
          _id: "$vendor",

          // Total bookings
          totalBookings: {
            $sum: 1,
          },

          // Completed events/bookings
          completedBookings: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    BOOKING_STATUS.COMPLETED,
                  ],
                },
                1,
                0,
              ],
            },
          },

          // Total booking value
          totalBookingValue: {
            $sum: "$amount",
          },

          // Advance actually paid
          paidAdvance: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$paymentStatus",
                    "paid",
                  ],
                },
                "$advanceAmount",
                0,
              ],
            },
          },

          // Final payment actually paid
          finalPayments: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$finalPaymentStatus",
                    "paid",
                  ],
                },
                {
                  $subtract: [
                    "$amount",
                    "$advanceAmount",
                  ],
                },
                0,
              ],
            },
          },
        },
      },

      // --------------------------------
      // Get Vendor Details
      // --------------------------------
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },

      {
        $unwind: "$vendor",
      },

      // --------------------------------
      // Completion Rate
      // --------------------------------
      {
        $addFields: {
          completionRate: {
            $cond: [
              {
                $gt: [
                  "$totalBookings",
                  0,
                ],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      "$completedBookings",
                      "$totalBookings",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      // --------------------------------
      // Final Response Fields
      // --------------------------------
      {
        $project: {
          _id: 0,

          vendorId: "$_id",

          businessName:
            "$vendor.businessName",

          category:
            "$vendor.category",

          totalBookings: 1,

          completedBookings: 1,

          totalBookingValue: 1,

          paidAdvance: 1,

          finalPayments: 1,

          // Actual payments received
          totalPaymentsReceived: {
            $add: [
              "$paidAdvance",
              "$finalPayments",
            ],
          },

          completionRate: {
            $round: [
              "$completionRate",
              2,
            ],
          },
        },
      },

      // Highest number of bookings first
      {
        $sort: {
          totalBookings: -1,
        },
      },
    ]);

    // --------------------------------
    // Overall Summary
    // --------------------------------
    const summary = vendorReports.reduce(
      (result, vendor) => {
        result.totalBookings +=
          vendor.totalBookings || 0;

        result.completedBookings +=
          vendor.completedBookings || 0;

        result.totalBookingValue +=
          vendor.totalBookingValue || 0;

        result.totalPaymentsReceived +=
          vendor.totalPaymentsReceived || 0;

        return result;
      },
      {
        totalBookings: 0,
        completedBookings: 0,
        totalBookingValue: 0,
        totalPaymentsReceived: 0,
      }
    );

    // --------------------------------
    // Response
    // --------------------------------
    return res.status(200).json({
      success: true,

      data: {
        reports: vendorReports,

        summary,

        filters: {
          period: period || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getAllVendors ,
  approveVendor ,
  rejectVendor,
  updateVendorStatus, 
  getAllUsers ,
  updateUserStatus,
  createCategory,
  getCategories,
  updateCategory,
  toggleCategoryStatus,
  getActiveCategories,
  getDashboardStats,
  getVendorReports 
}