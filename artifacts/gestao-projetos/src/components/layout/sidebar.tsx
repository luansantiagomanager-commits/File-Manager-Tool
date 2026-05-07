import React from "react";
import { Link, useLocation } from "wouter";
import {
  Users,
  Settings,
  LogOut,
  BarChart3,
  LayoutDashboard,
  FolderKanban,
  Shield,
  Briefcase,
} from "lucide-react";
import { useGetUsuarioStatsByPerfil } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";

const PERFIL_BADGE = {
  ADMIN: { label: "Administrador", icon: Shield, cls: "bg-violet-500/15 text-violet-300" },
  GERENTE: { label: "Gerente", icon: Briefcase, cls: "bg-emerald-500/15 text-emerald-300" },
  COLABORADOR: { label: "Colaborador", icon: Users, cls: "bg-amber-500/15 text-amber-300" },
};

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: stats } = useGetUsuarioStatsByPerfil({
    query: { queryKey: ["/api/usuarios/stats/perfil"] },
  });

  const isActive = (paths: string[]) =>
    paths.some((p) =>
      p.endsWith("*")
        ? location.startsWith(p.slice(0, -1))
        : location === p,
    );

  const navLink = (href: string, icon: React.ReactNode, label: string, matchPaths: string[]) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
        isActive(matchPaths)
          ? "bg-white/10 text-white font-medium"
          : "text-[hsl(215,20%,60%)] hover:bg-white/6 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );

  const perfil = user ? PERFIL_BADGE[user.perfil] : null;
  const PIcon = perfil?.icon;

  const initials = user
    ? user.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className="w-64 flex flex-col flex-shrink-0"
        style={{ background: "hsl(222,47%,11%)" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(233,75%,48%)] flex items-center justify-center shadow-md flex-shrink-0">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">Gestão de Projetos</div>
              <div className="text-[hsl(215,20%,50%)] text-[10px] leading-tight">Sistema de gestão</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <div className="text-[10px] font-semibold text-[hsl(215,20%,40%)] px-3 py-2 uppercase tracking-widest">
            Principal
          </div>

          {navLink("/dashboard", <LayoutDashboard className="h-4 w-4" />, "Dashboard", ["/dashboard"])}
          {navLink(
            "/projetos",
            <FolderKanban className="h-4 w-4" />,
            "Projetos",
            ["/projetos", "/projetos/*"],
          )}

          <div className="text-[10px] font-semibold text-[hsl(215,20%,40%)] px-3 py-2 mt-3 uppercase tracking-widest">
            Administração
          </div>

          {(user?.perfil === "ADMIN" || user?.perfil === "GERENTE") &&
            navLink(
              "/usuarios",
              <Users className="h-4 w-4" />,
              "Usuários",
              ["/usuarios", "/usuarios/*"],
            )}
        </nav>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="px-4 py-3 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[hsl(215,20%,40%)] uppercase tracking-widest mb-2.5 px-1">
              <BarChart3 className="h-3 w-3" />
              Visão Geral Usuários
            </div>
            <div className="space-y-1.5 px-1">
              {stats.map((stat) => (
                <div key={stat.perfil} className="flex items-center justify-between">
                  <span className="text-[hsl(215,20%,55%)] text-xs capitalize">
                    {stat.perfil === "ADMIN"
                      ? "Administrador"
                      : stat.perfil === "GERENTE"
                      ? "Gerente"
                      : "Colaborador"}
                  </span>
                  <span className="text-white text-xs font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User footer */}
        <div className="p-3 border-t border-white/8">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(233,75%,48%)] to-[hsl(262,83%,58%)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate leading-tight">{user.nome.split(" ")[0]}</div>
                {perfil && PIcon && (
                  <div className={`inline-flex items-center gap-1 text-[10px] mt-0.5 ${perfil.cls} rounded px-1.5 py-0.5`}>
                    <PIcon className="h-2.5 w-2.5" />
                    {perfil.label}
                  </div>
                )}
              </div>
            </div>
          )}

          <Link
            href="/configuracoes"
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
              location === "/configuracoes"
                ? "bg-white/10 text-white"
                : "text-[hsl(215,20%,60%)] hover:bg-white/6 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[hsl(215,20%,60%)] hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all mt-0.5"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
