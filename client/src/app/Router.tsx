
import Layout from "@/components/layout";
import NotFound from "@/app/not-found";
import TrustDetails from "@/pages/trust-details";
import { Switch, Route } from "wouter";
import ValidateClients from "@/features/validateClients/ValidateClientsPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/trust/:id" component={TrustDetails} />
        <Route path="/validar" component={ValidateClients} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
} 
export default Router;