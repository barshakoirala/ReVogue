import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TOKEN_KEY = "revogue_token";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
  }
  return result;
};

export const vendorProductsApi = createApi({
  reducerPath: "vendorProductsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["VendorProducts"],
  endpoints: (builder) => ({
    getMyProducts: builder.query({
      query: () => "/vendor/products",
      transformResponse: (res) => res.products,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "VendorProducts", id: _id })),
              { type: "VendorProducts", id: "LIST" },
            ]
          : [{ type: "VendorProducts", id: "LIST" }],
    }),
    getMyProduct: builder.query({
      query: (id) => `/vendor/products/${id}`,
      providesTags: (_, __, id) => [{ type: "VendorProducts", id }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/vendor/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VendorProducts", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/vendor/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "VendorProducts", id },
        { type: "VendorProducts", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/vendor/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "VendorProducts", id },
        { type: "VendorProducts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyProductsQuery,
  useGetMyProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = vendorProductsApi;
