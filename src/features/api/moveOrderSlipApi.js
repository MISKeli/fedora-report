import { indexApi } from "./indexApi";

const moveOrderSlipApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["mo"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      moveOrder: builder.query({
        query: (params) => ({
          url: `/Reports/move-order-slip`,
          method: "GET",
          params,
        }),
        providesTags: ["mo"],
      }),
    }),
  });

export const { useMoveOrderQuery } = moveOrderSlipApi;
