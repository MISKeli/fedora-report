import { indexApi } from "./indexApi";

const loginApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["auth"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      //GL API
      //   postLogin: builder.mutation({
      //     query: (body) => ({
      //       url: "/auth",
      //       method: "POST",
      //       body,
      //     }),
      //   }),
      // }),
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

export const { usePostLoginMutation, useAuthMutation } = loginApi;
