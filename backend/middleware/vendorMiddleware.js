const Vendor = require("../models/Vendor");
const VENDOR_STATUS = require("../constants/vendorStatus");

const requireApprovedVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user.id,
    });

    if (!vendor) {
      return res.status(404).json({success: false,message: "Vendor profile not found",});
    }
    if (vendor.status === "blocked") {
      return res.status(403).json({success: false, message: "Your vendor account has been blocked"});
    }
    if (vendor.verificationStatus !== VENDOR_STATUS.APPROVED) {
      return res.status(403).json({success: false, message: "Vendor account is not approved yet"});
    }
    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireApprovedVendor;