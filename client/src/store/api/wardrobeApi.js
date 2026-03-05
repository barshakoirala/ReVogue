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

export const wardrobeApi = createApi({
  reducerPath: "wardrobeApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Wardrobe"],
  endpoints: (builder) => ({
    getWardrobe: builder.query({
      query: () => "/wardrobe",
      transformResponse: (res) => res.items ?? [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map(({ _id }) => ({ type: "Wardrobe", id: _id })),
              { type: "Wardrobe", id: "LIST" },
            ]
          : [{ type: "Wardrobe", id: "LIST" }],
    }),
    createWardrobeItem: builder.mutation({
      query: (body) => ({
        url: "/wardrobe",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Wardrobe", id: "LIST" }],
    }),
    updateWardrobeItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/wardrobe/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Wardrobe", id },
        { type: "Wardrobe", id: "LIST" },
      ],
    }),
    deleteWardrobeItem: builder.mutation({
      query: (id) => ({
        url: `/wardrobe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Wardrobe", id },
        { type: "Wardrobe", id: "LIST" },
      ],
    }),
    getStyleSuggestions: builder.query({
      query: ({ wardrobeItemIds, targetSubcategoryId }) => {
        const params = new URLSearchParams();
        if (Array.isArray(wardrobeItemIds) && wardrobeItemIds.length)
          params.set("wardrobeItemIds", wardrobeItemIds.join(","));
        if (targetSubcategoryId) params.set("targetSubcategoryId", targetSubcategoryId);
        return `/wardrobe/style-suggestions?${params.toString()}`;
      },
      transformResponse: (res) => res.suggestions ?? [],
    }),
  }),
});

export const {
  useGetWardrobeQuery,
  useCreateWardrobeItemMutation,
  useUpdateWardrobeItemMutation,
  useDeleteWardrobeItemMutation,
  useLazyGetStyleSuggestionsQuery,
} = wardrobeApi;

