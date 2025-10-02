import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = () => {
  const stage = import.meta.env.VITE_FEDORA_STAGE;


  switch (stage) {
    case "LOCAL":
      return import.meta.env.VITE_FEDORA_ENDPOINT_LOCAL;
    case "PRETEST":
      return import.meta.env.VITE_FEDORA_ENDPOINT_PRETEST;
    case "PRODUCTION":
      return import.meta.env.VITE_FEDORA_ENDPOINT_PRODUCTION;
    default:
      throw new Error(`Unknown stage: ${stage}`);
  }
};
// when using Fedora API
export const indexApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl(),
    prepareHeaders: (headers, { getState }) => {
    

      headers.set("x-api-key", getState().auth.apiKey);
   
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  endpoints: () => ({}),
});
