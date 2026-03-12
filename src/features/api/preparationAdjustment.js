import { indexApi } from "./indexApi";

const preparationAdjustment = indexApi
  .enhanceEndpoints({ addTagTypes: ["pa"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      paActivePreparation: builder.query({
        query: (params) => ({
          url: `/PreparationAdj/preparation/active_production`,
          method: "GET",
          params,
        }),
        providesTags: ["pa"],
      }),
      paItem: builder.query({
        query: (params) => ({
          url: `/PreparationAdj/preparation/items`,
          method: "GET",
          params,
        }),
        providesTags: ["pa"],
      }),

      paDeactivate: builder.mutation({
        query: (body) => ({
          url: `/PreparationAdj/preparation/deactivate`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["pa"], // ✅ mutations use invalidatesTags, not providesTags
      }),
    }),
  });

export const {
  useLazyPaActivePreparationQuery,
  useLazyPaItemQuery,
  usePaActivePreparationQuery,
  usePaItemQuery,
  usePaDeactivateMutation, // ✅ mutation hook, not Query
} = preparationAdjustment;
