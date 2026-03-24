import { useQuery } from "@tanstack/react-query";
import { getNeffiTrusttUrl } from "../services/redirectService";

export const useNeffiTrustUrl = () => {
  return useQuery({
    queryKey: ["neffi-trust-url"],
    queryFn: getNeffiTrusttUrl,
    staleTime: Infinity,
  });
};