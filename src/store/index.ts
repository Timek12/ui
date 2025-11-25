import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "../services/api";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

store.subscribe(() => {
  const state = store.getState();
  const { user, accessToken, refreshToken } = state.auth;

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
  } else {
    localStorage.removeItem("access_token");
  }

  if (refreshToken) {
    localStorage.setItem("refresh_token", refreshToken);
  } else {
    localStorage.removeItem("refresh_token");
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
