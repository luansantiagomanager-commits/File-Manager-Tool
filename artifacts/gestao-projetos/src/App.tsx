import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/contexts/auth";
import { LoginPage } from "@/pages/auth/login";
import { ConfiguracoesPage } from "@/pages/configuracoes";
import { Sidebar } from "@/components/layout/sidebar";

import { UsuariosPage } from "@/pages/usuarios/index";
import { NovoUsuarioPage } from "@/pages/usuarios/novo";
import { EditarUsuarioPage } from "@/pages/usuarios/editar";
import { DetalhesUsuarioPage } from "@/pages/usuarios/detalhes";

import { DashboardPage } from "@/pages/dashboard/index";
import { ProjetosPage } from "@/pages/projetos/index";
import { NovoProjetoPage } from "@/pages/projetos/novo";
import { EditarProjetoPage } from "@/pages/projetos/editar";
import { DetalhesProjetoPage } from "@/pages/projetos/detalhes";

const queryClient = new QueryClient();

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(240,20%,98%)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(233,75%,48%)]" />
          <span className="text-sm text-muted-foreground">Carregando…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (location !== "/login") {
      return <Redirect to="/login" />;
    }
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
      </Switch>
    );
  }

  if (location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Sidebar>
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>

        <Route path="/dashboard" component={DashboardPage} />

        <Route path="/projetos" component={ProjetosPage} />
        <Route path="/projetos/novo" component={NovoProjetoPage} />
        <Route path="/projetos/:id/editar" component={EditarProjetoPage} />
        <Route path="/projetos/:id" component={DetalhesProjetoPage} />

        <Route path="/usuarios" component={UsuariosPage} />
        <Route path="/usuarios/novo" component={NovoUsuarioPage} />
        <Route path="/usuarios/:id/editar" component={EditarUsuarioPage} />
        <Route path="/usuarios/:id" component={DetalhesUsuarioPage} />

        <Route path="/configuracoes" component={ConfiguracoesPage} />

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
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
