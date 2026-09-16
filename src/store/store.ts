import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import searchReducer from "@/store/slices/searchSlice";
import bookingReducer from "@/store/slices/bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
