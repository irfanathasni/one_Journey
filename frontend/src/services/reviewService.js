import axiosInstance from "./axiosInstance"

export const createReview = async (data) => {
    const res = await axiosInstance.post("/review/create", data)
    return res.data
}

export const getVendorReviews = async (vendorId) => {
    const res = await axiosInstance.get(`/review/vendor/${vendorId}`)
    return res.data
}