import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth";
import { useUpdateUsuario } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Shield, Briefcase, Users, Loader2, Check, Eye, EyeOff } from "lucide-react";

const PERFIL_CONFIG = {
  ADMIN: {
    label: "Administrador",
    icon: Shield,
    color: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  GERENTE: {
    label: "Gerente de Projetos",
    icon: Briefcase,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  COLABORADOR: {
    label: "Colaborador",
    icon: Users,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
};

type Tab = "perfil" | "seguranca";

export function ConfiguracoesPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  const [nome, setNome] = useState(user?.nome ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [cargo, setCargo] = useState(user?.cargo ?? "");
  const [loginVal, setLoginVal] = useState(user?.login ?? "");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  const updateMutation = useUpdateUsuario({
    mutation: {
      onSuccess: async () => {
        await refreshUser();
        toast({ title: "Perfil atualizado com sucesso!" });
      },
      onError: (err) => {
        toast({
          title: "Erro ao atualizar",
          description: err.data?.error ?? "Tente novamente",
          variant: "destructive",
        });
      },
    },
  });

  if (!user) return null;

  const perfil = PERFIL_CONFIG[user.perfil];
  const PIcon = perfil.icon;

  const canEditCargo = user.perfil === "ADMIN" || user.perfil === "GERENTE";
  const canEditLogin = user.perfil === "ADMIN";

  const handleSavePerfil = (e: FormEvent) => {
    e.preventDefault();
    const body: Record<string, string> = { nome, email };
    if (canEditCargo) body["cargo"] = cargo;
    if (canEditLogin) body["login"] = loginVal;
    updateMutation.mutate({ id: user.id, data: body });
  };

  const handleSaveSenha = (e: FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (novaSenha.length < 6) {
      toast({ title: "A nova senha deve ter ao menos 6 caracteres", variant: "destructive" });
      return;
    }
    updateMutation.mutate(
      { id: user.id, data: { senha: novaSenha } },
      {
        onSuccess: () => {
          setSenhaAtual("");
          setNovaSenha("");
          setConfirmarSenha("");
          toast({ title: "Senha alterada com sucesso!" });
        },
      },
    );
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "perfil", label: "Meu Perfil", icon: User },
    { id: "seguranca", label: "Segurança", icon: Lock },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie suas informações pessoais e de acesso.</p>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(233,75%,48%)] to-[hsl(262,83%,58%)] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
          {user.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-lg truncate">{user.nome}</div>
          <div className="text-muted-foreground text-sm truncate">{user.email}</div>
          <div className="text-muted-foreground text-xs mt-0.5">{user.cargo}</div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${perfil.color} flex-shrink-0`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${perfil.dot}`} />
          <PIcon className="h-3 w-3" />
          {perfil.label}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? "border-[hsl(233,75%,48%)] text-[hsl(233,75%,48%)]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Meu Perfil */}
      {activeTab === "perfil" && (
        <form onSubmit={handleSavePerfil} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-foreground mb-4">Informações Pessoais</h2>

          <Field label="Nome completo">
            <Input value={nome} onChange={setNome} placeholder="Seu nome completo" required />
          </Field>

          <Field label="E-mail">
            <Input type="email" value={email} onChange={setEmail} placeholder="seu@email.com" required />
          </Field>

          {canEditCargo ? (
            <Field label="Cargo">
              <Input value={cargo} onChange={setCargo} placeholder="Seu cargo na organização" required />
            </Field>
          ) : (
            <Field label="Cargo">
              <ReadOnlyField value={cargo} hint="Apenas administradores podem alterar o cargo." />
            </Field>
          )}

          {canEditLogin ? (
            <Field label="Login de acesso">
              <Input value={loginVal} onChange={setLoginVal} placeholder="login" required />
            </Field>
          ) : (
            <Field label="Login de acesso">
              <ReadOnlyField value={user.login} hint="O login não pode ser alterado." />
            </Field>
          )}

          <div className="pt-2 flex justify-end">
            <SaveButton loading={updateMutation.isPending} />
          </div>
        </form>
      )}

      {/* Tab: Segurança */}
      {activeTab === "seguranca" && (
        <form onSubmit={handleSaveSenha} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Alterar Senha</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Use uma senha forte com letras, números e símbolos.
            </p>
          </div>

          <Field label="Nova senha">
            <PasswordInput
              value={novaSenha}
              onChange={setNovaSenha}
              show={showNovaSenha}
              onToggle={() => setShowNovaSenha((v) => !v)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </Field>

          <Field label="Confirmar nova senha">
            <PasswordInput
              value={confirmarSenha}
              onChange={setConfirmarSenha}
              show={showNovaSenha}
              onToggle={() => setShowNovaSenha((v) => !v)}
              placeholder="Repita a nova senha"
              required
            />
            {novaSenha && confirmarSenha && novaSenha !== confirmarSenha && (
              <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
            )}
          </Field>

          {/* Nota informativa */}
          <div className="flex gap-3 p-4 rounded-xl bg-[hsl(233,75%,48%)]/5 border border-[hsl(233,75%,48%)]/15">
            <Lock className="h-4 w-4 text-[hsl(233,75%,48%)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Após alterar a senha, você precisará usá-la na próxima vez que fizer login.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <SaveButton
              loading={updateMutation.isPending}
              disabled={!novaSenha || !confirmarSenha || novaSenha !== confirmarSenha}
            />
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full h-10 px-3.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[hsl(233,75%,48%)]/20 focus:border-[hsl(233,75%,48%)] transition-all"
    />
  );
}

function ReadOnlyField({ value, hint }: { value: string; hint: string }) {
  return (
    <>
      <div className="w-full h-10 px-3.5 flex items-center rounded-lg border border-input bg-muted text-muted-foreground text-sm">
        {value}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3.5 pr-11 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[hsl(233,75%,48%)]/20 focus:border-[hsl(233,75%,48%)] transition-all"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SaveButton({ loading, disabled }: { loading?: boolean; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="h-9 px-5 rounded-lg bg-[hsl(233,75%,48%)] hover:bg-[hsl(233,75%,43%)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Salvando…
        </>
      ) : (
        <>
          <Check className="h-3.5 w-3.5" />
          Salvar alterações
        </>
      )}
    </button>
  );
}
