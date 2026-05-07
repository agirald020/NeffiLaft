import { apiRequest } from "@/shared/lib/queryClient";
import type { WorkingScheduleResponse } from "../types/workingSchedule.types";

export const validateWorkingSchedule = async (): Promise<WorkingScheduleResponse> => {
  const res = await apiRequest("GET", "/api/auth/business-hours");

  const json = await res.json();

  return {
    allowed: json.data.isBusinessHours,
    startTime: json.data.startHour,
    endTime: json.data.endHour,
  };
};