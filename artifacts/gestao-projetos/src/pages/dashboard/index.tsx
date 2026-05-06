import { 
  useGetDashboardStats, 
  useGetTarefasPorUsuario, 
  useGetProjetosComPrazo,
  useGetProjetoStatsByStatus 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock, AlertCircle, LayoutDashboard, Briefcase, CheckSquare, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: workload, isLoading: loadingWorkload } = useGetTarefasPorUsuario();
  const { data: projetosPrazo, isLoading: loadingPrazo } = useGetProjetosComPrazo();
  const { data: projetosStatus, isLoading: loadingStatus } = useGetProjetoStatsByStatus();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral do sistema de gestão de projetos.</p>
      </div>

      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjetos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.projetosEmAndamento} em andamento
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.projetosAtrasados}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requer atenção imediata
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTarefas}</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={stats.totalTarefas > 0 ? (stats.tarefasConcluidas / stats.totalTarefas) * 100 : 0} className="h-2" />
                <span className="text-xs text-muted-foreground">{stats.tarefasConcluidas} concluídas</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Carga de Trabalho (Tarefas)</CardTitle>
            <CardDescription>Distribuição de tarefas por usuário.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWorkload ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : workload && workload.length > 0 ? (
              <div className="space-y-6">
                {workload.map((user) => (
                  <div key={user.usuarioId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{user.usuarioNome}</span>
                      <span className="text-muted-foreground">{user.totalTarefas} total</span>
                    </div>
                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-secondary">
                      <div 
                        className="bg-primary transition-all" 
                        style={{ width: `${user.totalTarefas > 0 ? (user.tarefasConcluidas / user.totalTarefas) * 100 : 0}%` }} 
                        title="Concluídas"
                      />
                      <div 
                        className="bg-amber-500 transition-all" 
                        style={{ width: `${user.totalTarefas > 0 ? (user.tarefasPendentes / user.totalTarefas) * 100 : 0}%` }}
                        title="Pendentes"
                      />
                      <div 
                        className="bg-destructive transition-all" 
                        style={{ width: `${user.totalTarefas > 0 ? (user.tarefasAtrasadas / user.totalTarefas) * 100 : 0}%` }}
                        title="Atrasadas"
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> {user.tarefasConcluidas} concluídas</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> {user.tarefasPendentes} pendentes</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive" /> {user.tarefasAtrasadas} atrasadas</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nenhum dado de carga de trabalho encontrado.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Próximos Prazos</CardTitle>
            <CardDescription>Projetos ordenados pela data de entrega.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPrazo ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : projetosPrazo && projetosPrazo.length > 0 ? (
              <div className="space-y-4">
                {projetosPrazo.map((projeto) => {
                  const isAtrasado = new Date(projeto.dataPrazo) < new Date() && projeto.status !== "CONCLUIDO" && projeto.status !== "CANCELADO";
                  
                  return (
                    <Link key={projeto.id} href={`/projetos/${projeto.id}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{projeto.nome}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{projeto.gerenteNome}</span>
                            <span>•</span>
                            <span className={isAtrasado ? "text-destructive font-medium" : ""}>
                              {format(new Date(projeto.dataPrazo), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={isAtrasado ? "destructive" : projeto.status === "CONCLUIDO" ? "default" : "secondary"}>
                            {projeto.status.replace("_", " ")}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {projeto.tarefasConcluidas}/{projeto.totalTarefas} tarefas
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nenhum projeto próximo do prazo.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
