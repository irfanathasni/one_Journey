import axiosInstance from "./axiosInstance"

export const getAllVendors = async ( page = 1,limit = 10,search = "",status = "") => {
  const res = await axiosInstance.get("/admin/vendors", {params: { page, limit,search, status}});
  return res.data;
}

export const approveVendor = async (vendorId) => {
    const res = await axiosInstance.put(`/admin/vendors/${vendorId}/approve`)
    return res.data
}

export const rejectVendor = async (vendorId, reason) => {
  const res = await axiosInstance.put(`/admin/vendors/${vendorId}/reject`,{ reason })
  return res.data;
}

export const updateVendorStatus = async (vendorId, status) => {
  const res = await axiosInstance.put(`/admin/vendors/${vendorId}/status`,{ status})
  return res.data;
}

export const getAllUsers = async(page = 1,limit = 10,search = "") => {
    return axiosInstance.get("/admin/users",{
        params:{page,limit,search}
    })
}

export const updateUserStatus = (userId) =>{
    return axiosInstance.put(`/admin/users/${userId}/status`)
}

export const getDashboardStats = async () => {
    return axiosInstance.get("/admin/dashboard")
}