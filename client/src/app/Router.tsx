import Layout from "@/shared/components/Layout";
import NotFound from "@/app/not-found";
import { Switch, Route } from "wouter";
import ValidateClients from "@/features/validateClients/ValidateClientsPage";
import HomePage from "@/features/HomePage/HomePage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/validar" component={ValidateClients} />
        <Route path="/" component={HomePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
} 
export default Router;