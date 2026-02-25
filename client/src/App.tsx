import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { LoginRequired } from "@/components/login-required";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TrustDetails from "@/pages/trust-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/trust/:id" component={TrustDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

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
