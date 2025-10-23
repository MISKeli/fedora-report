import { indexApi } from "./indexApi";

const loginApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["auth"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      //FEDORA API
      Auth: builder.mutation({
        query: (body) => ({
          url: "/Auth/login",
          method: "POST",
          body,
        }),
      }),
    }),
  });

export const { useAuthMutation } = loginApi;
