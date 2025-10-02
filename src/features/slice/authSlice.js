import { createSlice } from "@reduxjs/toolkit";
import { decrypt } from "../../utils/encrypt";

// Updated to use apiKey terminology
const { decryptedData: decryptedApiKey } = decrypt(
  sessionStorage.getItem("apiKey") // Changed from "token" to "apiKey"
);
const initialUser = sessionStorage.getItem("user") || "";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!decryptedApiKey, // Updated variable name
    apiKey: decryptedApiKey, // Changed from token to apiKey
    user: initialUser,
    pageNumber: 0,
    pageSize: 25,
  },
  reducers: {
    loginSlice: (state, action) => {
      state.isAuthenticated = true;
      state.apiKey = action.payload.apiKey; // Changed from token to apiKey
      state.user = action.payload.user;
    },
    logoutSlice: (state) => {
      state.isAuthenticated = false;
      state.apiKey = null; // Changed from token to apiKey
    },
  },
});

export const {
  setPage,
  loginSlice,
  logoutSlice,
  setPokedData,
  setPageNumber,
  setPageSize,
} = authSlice.actions;
export default authSlice.reducer;
