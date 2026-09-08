const Booking = require("../models/Booking")
const Wedding = require("../models/Wedding")
const Vendor = require("../models/Vendor")
const VendorAvailability = require("../models/VendorAvailability")
const BOOKING_STATUS = require("../constants/bookingStatus")

const createBooking = async (req, res, next) => {
  try {
    const {weddingId,vendorId,serviceDate,startTime,endTime,packageId} = req.body

    if (!weddingId ||!vendorId ||!serviceDate || !startTime || !endTime ||!packageId ) {
      return res.status(400).json({success: false,message: "Wedding, vendor, date, start time, end time and package are required."})
    }

    if (startTime >= endTime) {
      return res.status(400).json({success: false,message: "End time must be after start time"})
    }
    const wedding = await Wedding.findById(weddingId)

    if (!wedding) {
      return res.status(404).json({success: false,message: "Wedding not found."})
    }

    if (wedding.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({success: false,message: "You don't have permission to book for this wedding."})
    }

    const vendor = await Vendor.findById(vendorId)

    if (!vendor) {
      return res.status(404).json({success: false,message: "Vendor not found."})
    }

    if (vendor.verificationStatus !== "approved") {
      return res.status(400).json({success: false,message: "This vendor is not approved"})
    }

    if (vendor.status !== "active") {
      return res.status(400).json({success: false,message: "This vendor is currently unavailable"})
    }

    const selectedPackage = vendor.packages.find(pkg => pkg._id.toString() === packageId.toString())

    if (!selectedPackage) {
      return res.status(404).json({success: false,message: "Selected package not found for this vendor."})
    }

    const existingBooking = await Booking.findOne({
      wedding: weddingId,
      vendor: vendorId,
      customer: req.user.id,
      status: {
        $in: [
          BOOKING_STATUS.PENDING,
          BOOKING_STATUS.APPROVED
        ]
      }
    })

    if (existingBooking) {
      return res.status(409).json({success: false,message: "You have already sent a booking request to this vendor for this wedding"})
    }

    const selectedDate = new Date(serviceDate)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const availability = await VendorAvailability.findOneAndUpdate(
      {
        vendor: vendorId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        startTime,
        endTime,
        isBooked: false
      },
      {
        isBooked: true
      },
      {
        new: true
      }
    )

    if (!availability) {
      return res.status(409).json({success: false,message: "This time slot is not available for this vendor."})
    }

    try {

      const booking = await Booking.create({
        wedding: weddingId,
        vendor: vendorId,
        customer: req.user.id,
        availabilitySlot: availability._id,
        serviceDate,
        startTime,
        endTime,

        package: {
          packageId: selectedPackage._id,
          packageType: selectedPackage.packageType,
          packageName: selectedPackage.packageName,
          description: selectedPackage.description,
          price: selectedPackage.price
        },

        amount: selectedPackage.price,

        status: BOOKING_STATUS.PENDING
      })

      return res.status(201).json({success: true,message: "Booking request sent successfully",data: booking})

    } catch (bookingError) {
      availability.isBooked = false
      await availability.save()
      throw bookingError
    }
  } catch (error) {
    next(error)
  }
}

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id
    })
      .populate("vendor", "businessName category")
      .populate("wedding", "brideName groomName weddingDate guestCount venue location")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: bookings
    })

  } catch (error) {
    next(error)
  }
}
const getVendorBookings = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      user: req.user.id
    })

    if (!vendor) {
      return res.status(404).json({success: false,message: "Vendor profile not found."})
    }
   const bookings = await Booking.find({ vendor: vendor._id })
  .populate("customer", "name email phone")
  .populate(
    "wedding",
    "brideName groomName weddingDate guestCount venue location"
  )
  .sort({serviceDate: 1,createdAt: -1})
    return res.status(200).json({success: true,data: bookings})

  } catch (error) {
    next(error)
  }
}

const updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params
        const { status } = req.body

        const allowedStatus = ["approved", "rejected"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({success: false,message: "Invalid booking status"})
        }
        const vendor = await Vendor.findOne({user: req.user.id})
        if (!vendor) {
            return res.status(404).json({success: false,message: "Vendor Profile not found"})
        }
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return res.status(404).json({success: false,message: "Booking not found"})
        }
        if (booking.vendor.toString() !== vendor._id.toString()) {
            return res.status(403).json({success: false,message: "You don't have permission to update this booking"})
        }
        if (booking.status !== "pending") {
            return res.status(400).json({success: false,message: "Only pending bookings can be updated"})
        }
        if (status === "approved") {
            if (!booking.package || !booking.package.packageId) {
                return res.status(400).json({success: false,message: "Booking package information is missing"})
            }
            const finalPrice = Number(booking.package.price)
            if (!Number.isFinite(finalPrice) || finalPrice < 0) {
                return res.status(400).json({success: false,message: "Invalid package price"})
            }
            booking.amount = finalPrice
            booking.advanceAmount = Math.round(finalPrice * 0.5)
            booking.paymentStatus = "pending"
        }
        if (status === "rejected") {
            booking.amount = Number(booking.amount || booking.package?.price || 0)
            booking.advanceAmount = 0
        }
        booking.status = status
        await booking.save()

        return res.status(200).json({success: true,message: `Booking ${status} successfully`,data: booking})
    } catch (error) {
        next(error)
    }
}

const completeBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params
    const vendor = await Vendor.findOne({ user: req.user.id })
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor profile not found" })
    }
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }
    if (booking.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: "You don't have permission to update this booking" })
    }
    if (booking.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved bookings can be marked completed" })
    }
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Advance payment must be received before marking complete" })
    }

    booking.status = "completed"
    await booking.save()
    return res.status(200).json({ success: true, message: "Event marked as completed", data: booking })
  } catch (error) {
    next(error)
  }
}

const requestFinalPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params
    const vendor = await Vendor.findOne({user: req.user.id})
    if (!vendor) {
      return res.status(404).json({success: false,message: "Vendor profile not found"})
    }
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({success: false,message: "Booking not found"})
    }
    if (booking.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({success: false,message: "You don't have permission to update this booking"})
    }
    if (booking.status !== "completed") {
      return res.status(400).json({success: false,message: "Event must be marked completed first"})
    }
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({success: false,message: "Advance payment must be received first"})
    }
    if (booking.finalPaymentStatus === "paid") {
      return res.status(400).json({success: false,message: "Final payment already received"})
    }
    const remainingAmount = Number(booking.amount) - Number(booking.advanceAmount)
    if (!Number.isFinite(remainingAmount) || remainingAmount <= 0) {
      return res.status(400).json({success: false,message: "No remaining amount to request"})
    }
    if (booking.finalPaymentStatus === "requested") {
      return res.status(400).json({success: false,message: "Final payment request already sent"})
    }
    booking.finalPaymentStatus = "requested"
    await booking.save()
    return res.status(200).json({success: true,message: "Final payment requested",data: booking})
  } catch (error) {
    next(error)
  }
}
module.exports = { 
  createBooking ,
  getMyBookings,
  getVendorBookings,
  updateBookingStatus,
  completeBooking ,
  requestFinalPayment}