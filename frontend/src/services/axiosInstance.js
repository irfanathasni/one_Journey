import axios from "axios"

const axiosInstance = axios.create({
    baseURL : "http://localhost:5000/api/v1" ,
})

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async(error) => {
        const originalRequest = error.config
        const isAuthRequest = originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/register")
        if(error.response?.status ===401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true

        try{
            const refreshToken = localStorage.getItem("refreshToken")
            const res = await axios.post("http://localhost:5000/api/v1/auth/refresh",{ refreshToken})
            const newAccessToken = res.data.accessToken
            localStorage.setItem("token",newAccessToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return axiosInstance(originalRequest)
        }catch(refreshError) {
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("role")
            window.location.href = "/login"
            return Promise.reject(refreshError)
        }
        }
        return Promise.reject(error)
    }
)
export default axiosInstance
