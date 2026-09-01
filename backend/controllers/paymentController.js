const Razorpay = require("razorpay")
const crypto = require("crypto")
const Booking = require("../models/Booking")
const Wallet = require("../models/Wallet")

const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret :process.env.RAZORPAY_KEY_SECRET
})

const createPaymentOrder = async (req,res,next) => {
    try{
        const { bookingId , paymentType } = req.body
        if(!bookingId) {
            return res.status(400).json({success:false,message:"Booking not found"})
        }
        const booking = await Booking.findById(bookingId)
        if(!booking) {
            return res.status(404).json({success:false,message:"Booking not found"})
        }
        if(booking.customer.toString() !== req.user.id.toString()) {
            return res.status(400).json({success:false,message:"You don't have permission for this booking"})
        }
        let amountToCharge = 0
        if(paymentType === "final") {
            if(booking.status !== "completed"){
                return res.status(400).json({success:false,message:"Event must be marked completed before final payment"})
            }
            if(booking.finalPaymentStatus !== "requested") {   
                return res.status(400).json({success:false,message:"Vendor has not requested final payment yet"})
            }
            amountToCharge = booking.amount - booking.advanceAmount

            if(amountToCharge  <= 0) {
                return res.status(400).json({success:false,message:"No remaining amount to pay"})
            }
        }else {
            if(booking.status !== "approved") {
                return res.status(400).json({success:false,message:"Booking must beapproved before payment"})
            }
            if(booking.paymentStatus =="paid") {
                return res.status(400).json({success:false,message:"Advance payment already completed"})
            }
            amountToCharge = booking.advanceAmount
        }
        
        const options = {
            amount:amountToCharge *100,
            currency:"INR",
            receipt:`booking_${booking._id}_${paymentType || "advance"}`
        }
        const order = await razorpay.orders.create(options)
        return res.status(200).json({success:true,order,keyId:process.env.RAZORPAY_KEY_ID})
    }catch(error){
        console.log("RAZORPAY ERROR FULL:", error) 
        next(error)
    }
}


const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, paymentType } = req.body

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (generatedSignature !== razorpay_signature) {
            if(paymentType !== "final") {
                await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" })
            }
            return res.status(400).json({ success: false, message: "Payment verification failed" })
        }

        const updateField = paymentType === "final"
            ? { finalPaymentStatus: "paid" }
            : { paymentStatus: "paid" }

        const booking = await Booking.findByIdAndUpdate(bookingId, updateField, { new: true })

        const creditAmount = paymentType === "final"
            ? (booking.amount - booking.advanceAmount)
            : booking.advanceAmount

        let wallet = await Wallet.findOne({ vendor: booking.vendor })
        if (!wallet) {
            wallet = await Wallet.create({ vendor: booking.vendor, balance: 0, transactions: [] })
        }
        wallet.balance += creditAmount
        wallet.transactions.unshift({
            type: "credit",
            amount: creditAmount,
            description: paymentType === "final" ? "Final payment received" : "Advance payment received"
        })
        await wallet.save()

        return res.status(200).json({ success: true, message: "Payment verified successfully", data: booking })
    } catch (error) {
        console.log("RAZORPAY ERROR FULL:", error) 
        next(error)
    }
}

const markPaymentFailed = async (req, res, next) => {
    try {
        const { bookingId, paymentType } = req.body
        if(paymentType !== "final") {
           await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "failed" })
        }
        return res.status(200).json({ success: true, message: "Payment marked as failed" })
    } catch (error) {
        console.log("RAZORPAY ERROR FULL:", error) 
        next(error)
    }
}
module.exports = {createPaymentOrder,verifyPayment,markPaymentFailed }