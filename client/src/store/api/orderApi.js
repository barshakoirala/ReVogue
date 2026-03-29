import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TOKEN_KEY = "revogue_token";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem(TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) localStorage.removeItem(TOKEN_KEY);
  return result;
};

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({ url: "/orders/checkout", method: "POST", body }),
      invalidatesTags: ["Orders", "Cart"],
    }),
    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (result, _err, orderId) => [{ type: "Orders", id: orderId }],
    }),
    getMyOrders: builder.query({
      query: () => "/orders",
      transformResponse: (res) => res.orders ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map(({ _id }) => ({ type: "Orders", id: _id })), { type: "Orders", id: "LIST" }]
          : [{ type: "Orders", id: "LIST" }],
    }),
  }),
});

export const { useCheckoutMutation, useGetOrderByIdQuery, useGetMyOrdersQuery } = orderApi;
