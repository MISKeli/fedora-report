import { indexApi } from "./indexApi";

const fgInventoryApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["fg"] })
  .injectEndpoints({
    endpoints: (builder) => ({
    
      Reports: builder.query({
        query: (params) => ({
          url: `/Reports/fg-inventory`,
          method: "GET",
          params,
        }),
        providesTags: ["fg"],
      }),
    }),
  });

export const {
  useReportsQuery, useLazyReportsQuery
} = fgInventoryApi;
