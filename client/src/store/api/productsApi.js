import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ tier, section } = {}) => {
        const params = new URLSearchParams();
        if (tier) params.set("tier", tier);
        if (section) params.set("section", section);
        const qs = params.toString();
        return `/products${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res) => res.products,
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = productsApi;
