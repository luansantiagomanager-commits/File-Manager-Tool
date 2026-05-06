import React from "react";
import { Link, useLocation } from "wouter";
import { Users, UserPlus, Settings, LogOut, BarChart3, LayoutDashboard, FolderKanban } from "lucide-react";
import { useGetUsuarioStatsByPerfil } from "@workspace/api-client-react";

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  const { data: stats } = useGetUsuarioStatsByPerfil({
    query: { queryKey: ["/api/usuarios/stats/perfil"] }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-semibold tracking-tight">
            <LayoutDashboard className="h-5 w-5" />
            <span>Gestão de Projetos</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground px-2 py-2 mb-1 uppercase tracking-wider">
            Principal
          </div>
          
          <Link href="/dashboard" className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${location === "/dashboard" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link href="/projetos" className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${location === "/projetos" || location.match(/^\/projetos\/\d+$/) || location === "/projetos/novo" || location.match(/^\/projetos\/\d+\/editar$/) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <FolderKanban className="h-4 w-4" />
            <span>Projetos</span>
          </Link>

          <div className="text-xs font-medium text-muted-foreground px-2 py-2 mt-4 mb-1 uppercase tracking-wider">
            Administração
          </div>
          
          <Link href="/usuarios" className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${location === "/usuarios" || location.match(/^\/usuarios\/\d+$/) || location === "/usuarios/novo" || location.match(/^\/usuarios\/\d+\/editar$/) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </Link>
        </nav>

        {stats && stats.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground px-2 mb-3 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              <span>Visão Geral Usuários</span>
            </div>
            <div className="space-y-2 px-2">
              {stats.map((stat) => (
                <div key={stat.perfil} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{stat.perfil.toLowerCase()}</span>
                  <span className="font-medium">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded-md hover:bg-muted">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors rounded-md hover:bg-muted mt-1">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
