import axiosInstance from "./axiosInstance";

export const loginUser = async (Credential) => {
    const response = await axiosInstance.post("/auth/login",Credential)
    return response.data
}