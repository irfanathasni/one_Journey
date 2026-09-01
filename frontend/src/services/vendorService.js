import axiosInstance from "./axiosInstance";

export const createVendorProfile = async (data) => {
    const res = await axiosInstance.post("/vendor/create",data)
    return res.data
}
export const getMyVendorProfile = async () => {
    const res = await axiosInstance.get("/vendor/my-profile")
    return res.data
}
export const getVendors = async (category = "") => {
    const res = await axiosInstance.get("/vendor",{
        params:category ? { category } : {},
    })
    return res.data
}

export const updateVendorProfile = async (data) => {
    const res = await axiosInstance.put("/vendor/update-profile",data)
    return res.data
}

export const getVendorAvailability = async (vendorId,date ="") => {
    const res = await axiosInstance.get(`/vendor/${vendorId}/availability`,{
        params:date ? { date} : {}
    })
    return res.data
}

export const createAvailability = async (data) => {
    const res = await axiosInstance.post("/vendor/availability",data)
    return res.data
}

export const getMyAvailability = async () => {
    const res = await axiosInstance.get("/vendor/availability")
    return res.data
}

export const deleteAvailability = async (slotId) => {
    const res = await axiosInstance.delete(`/vendor/availability/${slotId}`)
    return res.data
}

export const addPricingTier = async (data) => {
    const res = await axiosInstance.post("/vendor/pricing", data)
    return res.data
}

export const deletePricingTier = async (tierId) => {
    const res = await axiosInstance.delete(`/vendor/pricing/${tierId}`)
    return res.data
}