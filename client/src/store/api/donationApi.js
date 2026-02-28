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

export const donationApi = createApi({
  reducerPath: "donationApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Donations"],
  endpoints: (builder) => ({
    getMyDonations: builder.query({
      query: () => "/donations",
      transformResponse: (res) => res.donations ?? [],
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map(({ _id }) => ({ type: "Donations", id: _id })),
              { type: "Donations", id: "LIST" },
            ]
          : [{ type: "Donations", id: "LIST" }],
    }),
    getDonation: builder.query({
      query: (id) => `/donations/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Donations", id }],
    }),
    createDonation: builder.mutation({
      query: (body) => ({ url: "/donations", method: "POST", body }),
      invalidatesTags: [{ type: "Donations", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyDonationsQuery,
  useGetDonationQuery,
  useCreateDonationMutation,
} = donationApi;
