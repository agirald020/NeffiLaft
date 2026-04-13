import { ReactNode, useEffect } from "react";
import { useAuth } from "@/features/Auth/hooks/use-auth";

interface LoginRequiredProps {
  children: ReactNode;
}

export function LoginRequired({ children }: LoginRequiredProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login(); // redirige automáticamente a Keycloak
    }
  }, [isAuthenticated, isLoading, login]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}