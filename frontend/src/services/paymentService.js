import axiosInstance from "./axiosInstance"

export const createPayment = async (bookingId ,paymentType ="advance") => {
    const res = await axiosInstance.post("/payment/create-order",{ bookingId ,paymentType})
    return res.data
}

export const verifyPayment = async (paymentData) => {
    const res = await axiosInstance.post("/payment/verify",paymentData)
    return res.data
}

export const markPaymentFailed = async (bookingId ,paymentType = "advance") => {
    const res = await axiosInstance.post("/payment/mark-failed",{ bookingId ,paymentType})
    return res.data
}