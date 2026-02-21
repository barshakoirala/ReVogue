import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { productsApi } from "./api/productsApi";
import { vendorProductsApi } from "./api/vendorProductsApi";
import { adminApi } from "./api/adminApi";
import { cartApi } from "./api/cartApi";
import { orderApi } from "./api/orderApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [vendorProductsApi.reducerPath]: vendorProductsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      productsApi.middleware,
      vendorProductsApi.middleware,
      adminApi.middleware,
      cartApi.middleware,
      orderApi.middleware
    ),
});

setupListeners(store.dispatch);
