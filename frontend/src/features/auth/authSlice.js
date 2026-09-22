import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  role: localStorage.getItem("role") || null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;

      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;

      localStorage.setItem("role", role);
      localStorage.setItem("accessToken", token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;

      localStorage.removeItem("role");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
