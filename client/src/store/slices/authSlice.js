import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

const TOKEN_KEY = "revogue_token";

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: getStoredToken(),
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      localStorage.setItem(TOKEN_KEY, payload.token);
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
