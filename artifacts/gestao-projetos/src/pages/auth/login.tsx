import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";
import { LayoutDashboard, Eye, EyeOff, Loader2, FolderKanban, Users, BarChart3 } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginVal, setLoginVal] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginVal, senha);
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between bg-[hsl(222,47%,11%)] p-12 relative overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(210,40%,98%) 1px, transparent 1px), linear-gradient(90deg, hsl(210,40%,98%) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow accent */}
        <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[hsl(233,75%,48%)] opacity-10 blur-[100px]" />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-[hsl(262,83%,58%)] opacity-8 blur-[80px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[hsl(233,75%,48%)] flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Gestão de Projetos</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gerencie seus projetos<br />com precisão e clareza
          </h1>
          <p className="text-[hsl(215,20%,65%)] text-lg leading-relaxed max-w-md">
            Plataforma profissional para equipes que buscam organização, produtividade e visibilidade total sobre seus projetos.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          {[
            {
              icon: FolderKanban,
              title: "Gestão de Projetos",
              desc: "Crie, acompanhe e controle projetos com visibilidade total sobre prazos e status.",
            },
            {
              icon: Users,
              title: "Controle de Equipes",
              desc: "Administre perfis de Administrador, Gerente e Colaborador com permissões distintas.",
            },
            {
              icon: BarChart3,
              title: "Relatórios em Tempo Real",
              desc: "Dashboard com métricas, cargas de trabalho e visão geral do portfólio.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-[hsl(215,80%,75%)]" />
              </div>
              <div>
                <div className="text-white font-medium text-sm mb-0.5">{title}</div>
                <div className="text-[hsl(215,16%,55%)] text-sm leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-[hsl(215,16%,45%)] text-xs">
          © {new Date().getFullYear()} Sistema de Gestão de Projetos. Todos os direitos reservados.
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-[hsl(240,20%,98%)] px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[hsl(233,75%,48%)] flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[hsl(222,47%,11%)]">Gestão de Projetos</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[hsl(222,47%,11%)] mb-2">Bem-vindo de volta</h2>
            <p className="text-[hsl(215,16%,47%)] text-sm">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[hsl(222,47%,11%)] mb-1.5">
                Login
              </label>
              <input
                type="text"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                placeholder="Seu login de acesso"
                required
                autoFocus
                autoComplete="username"
                className="w-full h-11 px-3.5 rounded-lg border border-[hsl(214,32%,88%)] bg-white text-[hsl(222,47%,11%)] text-sm placeholder:text-[hsl(215,16%,65%)] outline-none focus:ring-2 focus:ring-[hsl(233,75%,48%)]/20 focus:border-[hsl(233,75%,48%)] transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(222,47%,11%)] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-11 rounded-lg border border-[hsl(214,32%,88%)] bg-white text-[hsl(222,47%,11%)] text-sm placeholder:text-[hsl(215,16%,65%)] outline-none focus:ring-2 focus:ring-[hsl(233,75%,48%)]/20 focus:border-[hsl(233,75%,48%)] transition-all shadow-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(215,16%,55%)] hover:text-[hsl(222,47%,11%)] transition-colors"
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                <span className="font-medium">Erro:</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !loginVal || !senha}
              className="w-full h-11 rounded-lg bg-[hsl(233,75%,48%)] hover:bg-[hsl(233,75%,43%)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[hsl(215,16%,55%)]">
            Não tem uma conta? Solicite acesso ao administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
