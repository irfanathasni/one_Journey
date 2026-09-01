import axiosInstance from "./axiosInstance"

export const createBooking = async (data) => {
    const res = await axiosInstance.post("/booking/create",data)
    return res.data
}

export const getMyBookings = async () => {
    const res = await axiosInstance.get("/booking/my-bookings")
    return res.data
}

export const getVendorBookings = async () => {
    const res = await axiosInstance.get("/booking/vendor-bookings")
    return res.data
}

export const updateBookingStatus = async (bookingId , status) => {
    const res = await axiosInstance.put(`/booking/${bookingId}/status`,{ status})
    return res.data
}

export const completeBooking = async (bookingId) => {
    const res = await axiosInstance.patch(`/booking/${bookingId}/complete`)
    return res.data
}

export const requestFinalPayment = async (bookingId) => {
    const res = await axiosInstance.patch(`/booking/${bookingId}/request-final-payment`)
    return res.data
}