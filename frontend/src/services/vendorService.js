import axiosInstance from "./axiosInstance";

export const createVendorProfile = async (data) => {
    const res = await axiosInstance.post("/vendor/create",data)
    return res.data
}
export const getMyVendorProfile = async () => {
    const res = await axiosInstance.get("/vendor/my-profile")
    return res.data
}