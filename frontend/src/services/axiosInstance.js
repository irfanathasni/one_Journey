import axios from "axios"
import { store } from "../app/store"
import { setCredentials, logout } from "../features/auth/authSlice"

const axiosInstance = axios.create({
    baseURL: "/api/v1",
    withCredentials: true
})

axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.token

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        const isAuthRequest =
            originalRequest.url.includes("/auth/login") ||
            originalRequest.url.includes("/auth/register") ||
            originalRequest.url.includes("/auth/refresh")

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRequest
        ) {
            originalRequest._retry = true

            try {
                const res = await axiosInstance.post("/auth/refresh")

                const newAccessToken = res.data.accessToken

                store.dispatch(
                    setCredentials({
                        user: store.getState().auth.user,
                        token: newAccessToken,
                        role: store.getState().auth.role,
                    })
                )

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`

                return axiosInstance(originalRequest)
            } catch (refreshError) {
                store.dispatch(logout())
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
