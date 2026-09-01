const Review = require("../models/Review")
const Booking = require("../models/Booking")

const createReview = async (req, res, next) => {
    try {
        const { bookingId, rating, comment } = req.body
        if (!bookingId || !rating) {
            return res.status(400).json({ success: false, message: "Booking and rating are required" })
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" })
        }

        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" })
        }
        if (booking.customer.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "You don't have permission to review this booking" })
        }
        if (booking.status !== "completed") {
            return res.status(400).json({ success: false, message: "You can only review completed events" })
        }

        const existingReview = await Review.findOne({ booking: bookingId })
        if (existingReview) {
            return res.status(409).json({ success: false, message: "You have already reviewed this booking" })
        }

        const review = await Review.create({
            booking: bookingId,
            vendor: booking.vendor,
            customer: req.user.id,
            rating,
            comment
        })

        return res.status(201).json({ success: true, message: "Review submitted successfully", data: review })
    } catch (error) {
        next(error)
    }
}

const getVendorReviews = async (req, res, next) => {
    try {
        const { vendorId } = req.params
        const reviews = await Review.find({ vendor: vendorId })
            .populate("customer", "name")
            .sort({ createdAt: -1 })

        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0

        return res.status(200).json({ success: true, data: { reviews, avgRating, count: reviews.length } })
    } catch (error) {
        next(error)
    }
}

module.exports = { createReview, getVendorReviews }