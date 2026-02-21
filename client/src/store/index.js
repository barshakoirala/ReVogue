import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { productsApi } from "./api/productsApi";
import { vendorProductsApi } from "./api/vendorProductsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [vendorProductsApi.reducerPath]: vendorProductsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      vendorProductsApi.middleware
    ),
});

setupListeners(store.dispatch);
