import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/config/env";
import type { AuthResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
};

function persist(state: AuthState) {
  if (typeof window === "undefined") return;
  if (state.token && state.user) {
    window.localStorage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ token: state.token, user: state.user }),
    );
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.auth);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      persist(state);
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persist(state);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      persist(state);
    },
    /** Restores a persisted session on the client after hydration. */
    hydrateAuth(state, action: PayloadAction<AuthResponse | null>) {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
      state.hydrated = true;
    },
  },
});

export const { setCredentials, updateUser, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
