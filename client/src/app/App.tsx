import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { AuthProvider } from "@/features/Auth/components/auth-provider";
import { LoginRequired } from "@/features/Auth/components/login-required";
import { queryClient } from "@/shared/lib/queryClient";
import Router from "./Router";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <LoginRequired>
            <Router />
          </LoginRequired>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
