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

export const agentChatApi = createApi({
  reducerPath: "agentChatApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Conversation", "Message"],
  endpoints: (builder) => ({
    listConversations: builder.query({
      query: () => "/conversations",
      transformResponse: (res) => res.conversations,
      providesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    createConversation: builder.mutation({
      query: () => ({
        url: "/conversations",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    getConversation: builder.query({
      query: (id) => `/conversations/${id}`,
      providesTags: (result, err, id) => [{ type: "Conversation", id }],
    }),
    getMessages: builder.query({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      transformResponse: (res) => res.messages,
      providesTags: (result, err, conversationId) => [
        { type: "Message", id: conversationId },
      ],
    }),
    appendMessage: builder.mutation({
      query: ({ conversationId, role, content }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: { role, content },
      }),
      async onQueryStarted(
        { conversationId, role, content },
        { dispatch, queryFulfilled }
      ) {
        const tempId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const optimistic = {
          _id: tempId,
          conversation: conversationId,
          role,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const patch = dispatch(
          agentChatApi.util.updateQueryData(
            "getMessages",
            conversationId,
            (draft) => {
              draft.push(optimistic);
            }
          )
        );
        try {
          const { data } = await queryFulfilled;
          if (data?._id) {
            dispatch(
              agentChatApi.util.updateQueryData(
                "getMessages",
                conversationId,
                (draft) => {
                  const idx = draft.findIndex((m) => m._id === tempId);
                  if (idx >= 0) draft[idx] = data;
                }
              )
            );
          }
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (result, err, { conversationId }) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id: conversationId },
      ],
    }),
    getLivekitToken: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/livekit-token`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useListConversationsQuery,
  useCreateConversationMutation,
  useGetConversationQuery,
  useGetMessagesQuery,
  useAppendMessageMutation,
  useGetLivekitTokenMutation,
} = agentChatApi;
