import axiosInstance from "./axiosInstance"

export const getMyWallet = async () => {
    const res = await axiosInstance.get("/wallet/my-wallet")
    return res.data
}

export const withdrawFromWallet = async (amount) => {
    const res = await axiosInstance.post("/wallet/withdraw", { amount })
    return res.data
}