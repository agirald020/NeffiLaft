import { ReactNode } from "react";
import { useAuth } from "@/features/Auth/hooks/use-auth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { LogIn, Shield } from "lucide-react";

interface LoginRequiredProps {
  children: ReactNode;
}

export function LoginRequired({ children }: LoginRequiredProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-secondary">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Neffi Laft
            </CardTitle>
            <CardDescription>
              Validación en Listas Restrictivas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-secondary">
              Debe autenticarse para acceder al sistema de validación en listas restrictivas.
            </p>
            <Button 
              onClick={login} 
              className="w-full btn-gradient-primary text-white flex items-center justify-center gap-2"
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión con SSO
            </Button>
            <p className="text-xs text-secondary">
              Utilice sus credenciales corporativas para acceder
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
