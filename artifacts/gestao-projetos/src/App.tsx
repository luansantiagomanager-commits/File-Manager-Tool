import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/layout/sidebar";
import { UsuariosPage } from "@/pages/usuarios/index";
import { NovoUsuarioPage } from "@/pages/usuarios/novo";
import { EditarUsuarioPage } from "@/pages/usuarios/editar";
import { DetalhesUsuarioPage } from "@/pages/usuarios/detalhes";

const queryClient = new QueryClient();

function Router() {
  return (
    <Sidebar>
      <Switch>
        <Route path="/">
          <Redirect to="/usuarios" />
        </Route>
        
        <Route path="/usuarios" component={UsuariosPage} />
        <Route path="/usuarios/novo" component={NovoUsuarioPage} />
        <Route path="/usuarios/:id/editar" component={EditarUsuarioPage} />
        <Route path="/usuarios/:id" component={DetalhesUsuarioPage} />

        <Route component={NotFound} />
      </Switch>
    </Sidebar>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;