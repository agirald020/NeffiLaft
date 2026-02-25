import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LogIn } from "lucide-react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">NeffiLaft</h1>
          <p className="text-muted-foreground mt-2">
            Validación de terceros en listas restrictivas
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground">
              Inicia sesión con tu cuenta corporativa para acceder al sistema
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              onClick={handleLogin}
              className="w-full gap-2"
              size="lg"
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión con SSO
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Autenticación segura mediante Keycloak SSO
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Parte del ecosistema NeffiTrust
        </p>
      </div>
    </div>
  );
}
