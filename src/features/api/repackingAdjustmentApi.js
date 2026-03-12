import { indexApi } from "./indexApi";

const repackingAdjustmentApi = indexApi
  .enhanceEndpoints({ addTagTypes: ["ra"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      rmMacro: builder.query({
        query: (params) => ({
          url: `/RepackingAdj/raw_materials/macro`,
          method: "GET",
          params,
        }),
        providesTags: ["ra"],
      }),
      rmMicro: builder.query({
        query: (params) => ({
          url: `/RepackingAdj/raw_materials/micro`,
          method: "GET",
          params,
        }),
        providesTags: ["ra"],
      }),
      rmReceived: builder.query({
        query: (params) => ({
          url: `/RepackingAdj/raw_materials/received`,
          method: "GET",
          params,
        }),
        providesTags: ["ra"],
      }),
      rmMUpdateActual: builder.mutation({
        query: (body) => ({
          url: `/RepackingAdj/raw_materials/update-actual`,
          method: "PUT",
          body,
        }),
        invalidatesTags: ["ra"], // ✅ mutations use invalidatesTags, not providesTags
      }),
    }),
  });

export const {
  useRmMacroQuery,
  useRmMicroQuery,
  useRmReceivedQuery,
  useRmMUpdateActualMutation, // ✅ mutation hook, not Query
  useLazyRmMacroQuery,
  useLazyRmMicroQuery,
  useLazyRmReceivedQuery,
} = repackingAdjustmentApi;
