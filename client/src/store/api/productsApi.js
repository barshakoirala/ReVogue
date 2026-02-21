import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ tier, section, limit } = {}) => {
        const params = new URLSearchParams();
        if (tier) params.set("tier", tier);
        if (section) params.set("section", section);
        if (limit) params.set("limit", limit);
        const qs = params.toString();
        return `/products${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res) => res.products,
    }),
    getProductsPaginated: builder.query({
      query: ({ tier, section, page = 1, limit = 12 } = {}) => {
        const params = new URLSearchParams();
        if (tier) params.set("tier", tier);
        if (section) params.set("section", section);
        params.set("page", page);
        params.set("limit", limit);
        return `/products?${params}`;
      },
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
    }),
    getCategories: builder.query({
      query: () => "/categories",
      transformResponse: (res) => res.categories,
    }),
    getBrands: builder.query({
      query: () => "/brands",
      transformResponse: (res) => res.brands,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsPaginatedQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} = productsApi;
