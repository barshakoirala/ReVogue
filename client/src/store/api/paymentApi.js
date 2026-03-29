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

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Payments", "Orders"],
  endpoints: (builder) => ({
    getMyPayments: builder.query({
      query: () => "/payments",
      transformResponse: (res) => res.payments ?? [],
      providesTags: (result) =>
        result?.length
          ? [...result.map(({ _id }) => ({ type: "Payments", id: _id })), { type: "Payments", id: "LIST" }]
          : [{ type: "Payments", id: "LIST" }],
    }),
    initiateEsewa: builder.mutation({
      query: (body) => ({ url: "/payments/esewa/initiate", method: "POST", body }),
    }),
    verifyEsewa: builder.mutation({
      query: (body) => ({ url: "/payments/esewa/verify", method: "POST", body }),
      invalidatesTags: ["Payments", "Orders"],
    }),
    initiateKhalti: builder.mutation({
      query: (body) => ({ url: "/payments/khalti/initiate", method: "POST", body }),
    }),
    verifyKhalti: builder.mutation({
      query: (body) => ({ url: "/payments/khalti/verify", method: "POST", body }),
      invalidatesTags: ["Payments", "Orders"],
    }),
  }),
});

export const {
  useGetMyPaymentsQuery,
  useInitiateEsewaMutation,
  useVerifyEsewaMutation,
  useInitiateKhaltiMutation,
  useVerifyKhaltiMutation,
} = paymentApi;
