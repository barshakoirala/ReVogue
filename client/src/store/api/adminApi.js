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

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["AdminProducts", "AdminCategories", "AdminBrands"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "/admin/products",
      transformResponse: (res) => res.products,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "AdminProducts", id: _id })), { type: "AdminProducts", id: "LIST" }]
          : [{ type: "AdminProducts", id: "LIST" }],
    }),
    getCategories: builder.query({
      query: () => "/admin/categories",
      transformResponse: (res) => res.categories,
      providesTags: (result) =>
        result
          ? [...result.flatMap((c) => [{ type: "AdminCategories", id: c._id }, ...(c.subcategories || []).map((s) => ({ type: "AdminCategories", id: s._id }))]), { type: "AdminCategories", id: "LIST" }]
          : [{ type: "AdminCategories", id: "LIST" }],
    }),
    createCategory: builder.mutation({
      query: (body) => ({ url: "/admin/categories", method: "POST", body }),
      invalidatesTags: [{ type: "AdminCategories", id: "LIST" }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/categories/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "AdminCategories", id }, { type: "AdminCategories", id: "LIST" }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "AdminCategories", id }, { type: "AdminCategories", id: "LIST" }],
    }),
    getBrands: builder.query({
      query: () => "/admin/brands",
      transformResponse: (res) => res.brands,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: "AdminBrands", id: _id })), { type: "AdminBrands", id: "LIST" }]
          : [{ type: "AdminBrands", id: "LIST" }],
    }),
    createBrand: builder.mutation({
      query: (body) => ({ url: "/admin/brands", method: "POST", body }),
      invalidatesTags: [{ type: "AdminBrands", id: "LIST" }],
    }),
    updateBrand: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/brands/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "AdminBrands", id }, { type: "AdminBrands", id: "LIST" }],
    }),
    deleteBrand: builder.mutation({
      query: (id) => ({ url: `/admin/brands/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "AdminBrands", id }, { type: "AdminBrands", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = adminApi;
