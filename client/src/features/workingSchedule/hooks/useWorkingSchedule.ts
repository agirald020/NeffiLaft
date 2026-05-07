import { useQuery } from "@tanstack/react-query";
import { validateWorkingSchedule } from "../services/workingSchedule.service";

export function useWorkingSchedule() {
  const query = useQuery({
    queryKey: ["business-hours"],
    queryFn: validateWorkingSchedule,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  return {
    isAllowed: query.data?.allowed ?? null,
    isLoading: query.isLoading,
    schedule: query.data ?? null,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}