import axiosInstance from "./axiosInstance";

export const loginUser = async (Credential) => {
    const response = await axiosInstance.post("/auth/login",Credential)
    return response.data
}

export const forgotPassword = async (email ) =>{
    const res = await axiosInstance.post("/auth/forgot-password" , {email})
    return res.data
}

export const resetPassword = async (token,password) =>{
    const res = await axiosInstance.put(`/auth/reset-password/${token}`,{ password})
    return res.data
}