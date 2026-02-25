import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              NEFFI Trust
            </CardTitle>
            <CardDescription>
              Sistema de Gestión Fiduciaria
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-secondary">
              Debe autenticarse para acceder al sistema de gestión fiduciaria.
            </p>
            <Button 
              onClick={login} 
              className="w-full bg-primary hover:bg-blue-700 text-white flex items-center justify-center gap-2"
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