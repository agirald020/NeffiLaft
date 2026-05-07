import { ReactNode } from "react";
import { useWorkingSchedule } from "../hooks/useWorkingSchedule";
import { useAuth } from "@/features/Auth/hooks/use-auth";

interface WorkingScheduleGuardProps {
  children: ReactNode;
}

// 🕐 helper para formatear hora
function formatToAmPm(time?: string): string {
  if (!time) return "";

  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);

  const suffix = hour >= 12 ? "p.m." : "a.m.";

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${minute} ${suffix}`;
}

export function WorkingScheduleGuard({ children }: WorkingScheduleGuardProps) {
  const { isAllowed, isLoading, schedule } = useWorkingSchedule();
  const { logout } = useAuth();

  if (isLoading) return null;

  if (!isAllowed) {
    const startTime = formatToAmPm(schedule?.startTime ?? "08:00");
    const endTime = formatToAmPm(schedule?.endTime ?? "17:30");

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-600/80">
        <div className="w-[460px] rounded-xl bg-white p-6 text-center shadow-lg">

          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Acceso restringido
          </h2>

          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            El acceso a esta funcionalidad está habilitado únicamente en el horario de{" "}
            {startTime} a {endTime}
            <br />
            Por favor, inténtelo nuevamente dentro de este rango.
          </p>

          <button
            onClick={logout}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}