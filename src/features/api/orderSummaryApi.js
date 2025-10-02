import { indexApi } from "./indexApi";

const orderSummaryApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["os"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      orderSummary: builder.query({
        query: (params) => ({
          url: `/Reports/order-summary`,
          method: "GET",
          params,
        }),
        providesTags: ["os"],
      }),
      orderServed: builder.query({
        query: (params) => ({
          url: `/Reports/order-served`,
          method: "GET",
          params,
        }),
        providesTags: ["os"],
      }),
    }),
  });

export const {
  useOrderSummaryQuery,
  useLazyOrderSummaryQuery,
  useLazyOrderServedQuery,
  useOrderServedQuery,
} = orderSummaryApi;
