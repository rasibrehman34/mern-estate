 import { createSlice } from "@reduxjs/toolkit";

 const initialState = {
    currentUser: null,
    error: null,
    loading: false,
 }; 

 const userSclice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        // Action to update user context with new avatar/public_id
        updateUserSuccess: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload };
            state.loading = false;
            state.error = null;
        }
    }
 })

 export const { signInStart, signInSuccess, signInFailure, updateUserSuccess } = userSclice.actions;

 export default userSclice.reducer; 