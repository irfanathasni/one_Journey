import axiosInstance from "./axiosInstance"

export const getAllVendors = async (status) => {
   const query = status ? `?status=${status}` : "";
  const res = await axiosInstance.get(`/admin/vendors${query}`)
  return res.data
}

export const approveVendor = async (vendorId) => {
    const res = await axiosInstance.put(`/admin/vendors/${vendorId}/approve`)
    return res.data
}

export const rejectVendor = async (vendorId, reason) => {
  const res = await axiosInstance.put(`/admin/vendors/${vendorId}/reject`,{ reason })
  return res.data;
}