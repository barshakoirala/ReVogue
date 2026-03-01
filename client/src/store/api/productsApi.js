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
      query: ({ tier, section, page = 1, limit = 12, search } = {}) => {
        const params = new URLSearchParams();
        if (tier) params.set("tier", tier);
        if (section) params.set("section", section);
        if (search) params.set("search", search);
        params.set("page", page);
        params.set("limit", limit);
        return `/products?${params}`;
      },
    }),
    getGoesWith: builder.query({
      query: ({ productIds, limit = 8 } = {}) => {
        const ids = Array.isArray(productIds) ? productIds : [];
        const params = new URLSearchParams();
        if (ids.length > 0) params.set("productIds", ids.join(","));
        params.set("limit", String(limit));
        return `/products/goes-with?${params}`;
      },
      transformResponse: (res) => res.products,
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
  useGetGoesWithQuery,
} = productsApi;
