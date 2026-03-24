import { apiRequest } from "@/shared/lib/queryClient";


export const getNeffiTrusttUrl = async (): Promise<string> => {
  const res = await apiRequest(
    "GET",
    "/api/neffi-trust-url"
  );
  return res.text();
};