import axiosInstance from "./axiosInstance"

export const createWedding = async(data) => {
    const res = await axiosInstance.post("/wedding/create" ,data)
    return res.data
}

export const getMyWedding = async () => {
    const res = await axiosInstance.get("/wedding/my-wedding")
    return res.data
}

export const updateWedding = async (data) => {
    const res = await axiosInstance.put("/wedding/update",data)
    return res.data
}