const Booking = require("../models/Booking")
const Wedding = require("../models/Wedding")
const Vendor = require("../models/Vendor")

const createBooking = async (req, res, next) => {
  try {
    const { weddingId, vendorId, serviceDate } = req.body
    if (!weddingId || !vendorId || !serviceDate) {
      return res.status(400).json({ success: false, message: "Wedding, vendor, and service date are required." })
    }
    const wedding = await Wedding.findById(weddingId);
    if (!wedding) {
      return res.status(404).json({ success: false, message: "Wedding not found." })
    }
    if (wedding.customer.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "You don't have permission to book for this wedding." })
    }
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." })
    }

    const booking = await Booking.create({
      wedding: weddingId,
      vendor: vendorId,
      customer: req.user.userId,
      serviceDate,
      status: "pending",
    })

    return res.status(201).json({ success: true, message: "Booking request sent.", data: booking })
  } catch (error) {
    next(error)
  }
}

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.userId })
      .populate("vendor", "businessName category")
      .populate("wedding", "brideName groomName")

    return res.status(200).json({ success: true, data: bookings })
  } catch (error) {
    next(error)
  }
}

const getVendorBookings = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user.userId })
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor profile not found." })
    }

    const bookings = await Booking.find({ vendor: vendor._id })
      .populate("customer", "name email phone")
      .populate("wedding", "brideName groomName weddingDate")

    return res.status(200).json({ success: true, data: bookings })
  } catch (error) {
    next(error)
  }
}



module.exports = { createBooking ,getMyBookings ,getVendorBookings }