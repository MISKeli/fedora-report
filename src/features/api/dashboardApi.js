import { indexApi } from "./indexApi";

const DashboardApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["dashboard"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      ProductionDashboard: builder.query({
        query: (params) => ({
          url: `/Dashboard/production-dashboard`,
          method: "GET",
          params,
          headers: {
            "x-api-key": sessionStorage.getItem("apiKey") ?? "",
          },
        }),
        providesTags: ["dashboard"],
      }),
    }),
  });

export const { useProductionDashboardQuery, useLazyProductionDashboardQuery } =
  DashboardApi;
