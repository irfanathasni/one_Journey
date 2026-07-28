import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    user:null ,
    token :localStorage.getItem("token") ||null,
    role :localStorage.getItem("role") ||null,
    isAuthenticated :!!localStorage.getItem("token")
}

const authSlice = createSlice({
    name:"auth",
    initialState,
        reducers:{
            setCredentials :(state,action) => {
                const {user,token,refreshToken,role } = action.payload
                state.user = user
                state.token = token
                state.role = role
                state.isAuthenticated = true
                localStorage.setItem("token",token)
                localStorage.setItem("refreshToken",refreshToken)
                localStorage.setItem("role", role)
            },
            logout:(state) =>{
                state.user = null
                state.token = null
                state.role = null
                state.isAuthenticated = false
                localStorage.removeItem("token")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("role")
            }
        }
    })

export const { setCredentials ,logout } = authSlice.actions
export default authSlice.reducer