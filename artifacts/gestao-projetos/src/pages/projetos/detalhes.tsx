import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useGetProjeto, 
  useAddProjetoMembro,
  useRemoveProjetoMembro,
  useCreateTarefa,
  useUpdateTarefa,
  useDeleteTarefa,
  useListUsuarios,
  getGetProjetoQueryKey,
  getListProjetosQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { format as dateFnsFormat } from "date-fns";
import { ArrowLeft, Edit, CalendarDays, Users, CheckSquare, Plus, Trash2, Loader2, MoreHorizontal, UserMinus, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const tarefaSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório"),
  descricao: z.string().optional(),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"]),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]),
  responsavelId: z.coerce.number().optional().nullable(),
  dataVencimento: z.string().optional().nullable(),
});

type TarefaFormValues = z.infer<typeof tarefaSchema>;

export function DetalhesProjetoPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberIdToAdd, setMemberIdToAdd] = useState("");
  
  const [tarefaOpen, setTarefaOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<number | null>(null);
  
  const [deleteTarefaId, setDeleteTarefaId] = useState<number | null>(null);
  const [tarefaPage, setTarefaPage] = useState(1);
  const [tarefaFiltroStatus, setTarefaFiltroStatus] = useState<string>("TODOS");

  const { data: projeto, isLoading: loadingProjeto } = useGetProjeto(id, { 
    query: { enabled: !!id, queryKey: getGetProjetoQueryKey(id) } 
  });

  const { data: usuarios } = useListUsuarios();

  const addMemberMutation = useAddProjetoMembro({
    mutation: {
      onSuccess: () => {
        toast({ title: "Membro adicionado com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
        setAddMemberOpen(false);
        setMemberIdToAdd("");
      },
      onError: (error) => {
        toast({ title: "Erro ao adicionar membro", description: error.data?.error, variant: "destructive" });
      }
    }
  });

  const removeMemberMutation = useRemoveProjetoMembro({
    mutation: {
      onSuccess: () => {
        toast({ title: "Membro removido com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
      },
      onError: (error) => {
        toast({ title: "Erro ao remover membro", description: error.data?.error, variant: "destructive" });
      }
    }
  });

  const createTarefaMutation = useCreateTarefa({
    mutation: {
      onSuccess: () => {
        toast({ title: "Tarefa criada com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
        setTarefaOpen(false);
        tarefaForm.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao criar tarefa", description: error.data?.error, variant: "destructive" });
      }
    }
  });

  const updateTarefaMutation = useUpdateTarefa({
    mutation: {
      onSuccess: () => {
        toast({ title: "Tarefa atualizada com sucesso" });
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
        setTarefaOpen(false);
        setEditingTarefa(null);
        tarefaForm.reset();
      },
      onError: (error) => {
        toast({ title: "Erro ao atualizar tarefa", description: error.data?.error, variant: "destructive" });
      }
    }
  });

  const deleteTarefaMutation = useDeleteTarefa({
    mutation: {
      onSuccess: () => {
        toast({ title: "Tarefa excluída" });
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
        setDeleteTarefaId(null);
      }
    }
  });

  const updateTarefaStatusMutation = useUpdateTarefa({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjetoQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
      }
    }
  });

  const tarefaForm = useForm<TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      status: "PENDENTE",
      prioridade: "MEDIA",
      responsavelId: null,
      dataVencimento: "",
    },
  });

  const toDateStr = (val: Date | string | null | undefined) => {
    if (!val) return "";
    const d = val instanceof Date ? val : new Date(val);
    return dateFnsFormat(d, "yyyy-MM-dd");
  };

  const handleOpenEditTarefa = (tarefa: any) => {
    setEditingTarefa(tarefa.id);
    tarefaForm.reset({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || "",
      status: tarefa.status,
      prioridade: tarefa.prioridade,
      responsavelId: tarefa.responsavelId || null,
      dataVencimento: toDateStr(tarefa.dataVencimento),
    });
    setTarefaOpen(true);
  };

  const handleOpenCreateTarefa = () => {
    setEditingTarefa(null);
    tarefaForm.reset({
      titulo: "",
      descricao: "",
      status: "PENDENTE",
      prioridade: "MEDIA",
      responsavelId: null,
      dataVencimento: "",
    });
    setTarefaOpen(true);
  };

  const onTarefaSubmit = (values: TarefaFormValues) => {
    const data = {
      ...values,
      responsavelId: values.responsavelId ? Number(values.responsavelId) : undefined,
      dataVencimento: values.dataVencimento || undefined,
    };
    
    if (editingTarefa) {
      updateTarefaMutation.mutate({ projetoId: id, id: editingTarefa, data });
    } else {
      createTarefaMutation.mutate({ projetoId: id, data });
    }
  };

  const handleAddMember = () => {
    if (memberIdToAdd) {
      addMemberMutation.mutate({ projetoId: id, data: { usuarioId: Number(memberIdToAdd) } });
    }
  };

  if (loadingProjeto) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Projeto não encontrado</h2>
        <Link href="/projetos">
          <Button variant="outline" className="mt-4">Voltar para Projetos</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANEJAMENTO": return <Badge variant="secondary">Planejamento</Badge>;
      case "EM_ANDAMENTO": return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Em Andamento</Badge>;
      case "CONCLUIDO": return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Concluído</Badge>;
      case "CANCELADO": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTarefaStatusBadge = (status: string) => {
    switch (status) {
      case "PENDENTE": return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
      case "EM_ANDAMENTO": return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">Em Andamento</Badge>;
      case "CONCLUIDA": return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs">Concluída</Badge>;
      case "CANCELADA": return <Badge variant="destructive" className="text-xs">Cancelada</Badge>;
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "BAIXA": return <Badge variant="secondary" className="bg-slate-100 text-slate-600">Baixa</Badge>;
      case "MEDIA": return <Badge variant="secondary" className="bg-blue-50 text-blue-600">Média</Badge>;
      case "ALTA": return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Alta</Badge>;
      case "CRITICA": return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Crítica</Badge>;
      default: return <Badge variant="outline">{prioridade}</Badge>;
    }
  };

  const isAtrasado = new Date(projeto.dataPrazo) < new Date() && projeto.status !== "CONCLUIDO" && projeto.status !== "CANCELADO";
  const totalTarefas = projeto.tarefas.length;
  const tarefasConcluidas = projeto.tarefas.filter(t => t.status === "CONCLUIDA").length;
  const progress = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;
  
  const usuariosDisponiveis = usuarios?.filter(u => 
    !projeto.membros.some(m => m.usuarioId === u.id) && u.id !== projeto.gerenteId
  );

  const TAREFAS_PER_PAGE = 10;
  const tarefasFiltradas = tarefaFiltroStatus === "TODOS"
    ? projeto.tarefas
    : projeto.tarefas.filter(t => t.status === tarefaFiltroStatus);
  const totalTarefaPages = Math.max(1, Math.ceil(tarefasFiltradas.length / TAREFAS_PER_PAGE));
  const safeTarefaPage = Math.min(tarefaPage, totalTarefaPages);
  const tarefasPaginadas = tarefasFiltradas.slice(
    (safeTarefaPage - 1) * TAREFAS_PER_PAGE,
    safeTarefaPage * TAREFAS_PER_PAGE
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/projetos">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{projeto.nome}</h1>
              {getStatusBadge(projeto.status)}
              {isAtrasado && <Badge variant="destructive">Atrasado</Badge>}
            </div>
          </div>
        </div>
        <Link href={`/projetos/${id}/editar`}>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Projeto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sobre o Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-muted-foreground whitespace-pre-wrap">
              {projeto.descricao || "Nenhuma descrição fornecida para este projeto."}
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  Progresso das Tarefas
                </span>
                <span className="text-muted-foreground">
                  {tarefasConcluidas} de {totalTarefas} concluídas ({Math.round(progress)}%)
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Período</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(projeto.dataInicio), "dd/MM/yyyy")} até {format(new Date(projeto.dataPrazo), "dd/MM/yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Gerente</p>
                <p className="text-sm text-muted-foreground mt-1">{projeto.gerenteNome}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tarefas" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="tarefas" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Tarefas ({projeto.tarefas.length})
          </TabsTrigger>
          <TabsTrigger 
            value="equipe" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Users className="mr-2 h-4 w-4" />
            Equipe ({projeto.membros.length + 1})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tarefas" className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold">Lista de Tarefas</h2>
            <div className="flex items-center gap-2">
              <Select value={tarefaFiltroStatus} onValueChange={(v) => { setTarefaFiltroStatus(v); setTarefaPage(1); }}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os status</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="CANCELADA">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleOpenCreateTarefa} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            </div>
          </div>

          {tarefasFiltradas.length > 0 ? (
            <>
              <div className="space-y-3">
                {tarefasPaginadas.map(tarefa => (
                  <Card key={tarefa.id} className={`overflow-hidden ${tarefa.status === 'CONCLUIDA' ? 'bg-muted/30 opacity-70' : ''}`}>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${tarefa.status === 'CONCLUIDA' ? 'line-through text-muted-foreground' : ''}`}>
                            {tarefa.titulo}
                          </h4>
                          {getPrioridadeBadge(tarefa.prioridade)}
                        </div>
                        {tarefa.descricao && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{tarefa.descricao}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 pt-2 text-xs text-muted-foreground">
                          {tarefa.responsavelNome ? (
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px]">{tarefa.responsavelNome.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {tarefa.responsavelNome}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 italic">Sem responsável</span>
                          )}
                          {tarefa.dataVencimento && (
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3" />
                              Vence em: {format(new Date(tarefa.dataVencimento), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <Select
                          value={tarefa.status}
                          onValueChange={(val: any) => {
                            updateTarefaStatusMutation.mutate({
                              projetoId: id,
                              id: tarefa.id,
                              data: { status: val },
                            });
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-dashed">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDENTE">Pendente</SelectItem>
                            <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                            <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                            <SelectItem value="CANCELADA">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditTarefa(tarefa)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar Tarefa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => setDeleteTarefaId(tarefa.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir Tarefa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalTarefaPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {Math.min((safeTarefaPage - 1) * TAREFAS_PER_PAGE + 1, tarefasFiltradas.length)}–{Math.min(safeTarefaPage * TAREFAS_PER_PAGE, tarefasFiltradas.length)} de {tarefasFiltradas.length} tarefas
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={safeTarefaPage <= 1}
                      onClick={() => setTarefaPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {safeTarefaPage} / {totalTarefaPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={safeTarefaPage >= totalTarefaPages}
                      onClick={() => setTarefaPage(p => Math.min(totalTarefaPages, p + 1))}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">
                {tarefaFiltroStatus === "TODOS" ? "Nenhuma tarefa" : "Nenhuma tarefa com este status"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {tarefaFiltroStatus === "TODOS"
                  ? "Adicione tarefas para acompanhar o progresso deste projeto."
                  : "Tente selecionar outro filtro de status."}
              </p>
              {tarefaFiltroStatus === "TODOS" && (
                <Button onClick={handleOpenCreateTarefa} variant="outline" size="sm">
                  Criar Primeira Tarefa
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="equipe" className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Membros da Equipe</h2>
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Membro ao Projeto</DialogTitle>
                  <DialogDescription>
                    Selecione um usuário para participar deste projeto.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select value={memberIdToAdd} onValueChange={setMemberIdToAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuariosDisponiveis?.length === 0 ? (
                        <SelectItem value="none" disabled>Todos os usuários já estão no projeto</SelectItem>
                      ) : (
                        usuariosDisponiveis?.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.nome} ({user.cargo})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancelar</Button>
                  <Button 
                    onClick={handleAddMember} 
                    disabled={!memberIdToAdd || addMemberMutation.isPending}
                  >
                    {addMemberMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">{projeto.gerenteNome.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{projeto.gerenteNome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 text-[10px] h-5">Gerente do Projeto</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {projeto.membros.map(membro => (
              <Card key={membro.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{membro.usuarioNome.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{membro.usuarioNome}</p>
                      <p className="text-xs text-muted-foreground truncate">{membro.usuarioCargo}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => removeMemberMutation.mutate({ projetoId: id, usuarioId: membro.usuarioId })}
                    disabled={removeMemberMutation.isPending}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={tarefaOpen} onOpenChange={setTarefaOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTarefa ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da tarefa.
            </DialogDescription>
          </DialogHeader>
          <Form {...tarefaForm}>
            <form onSubmit={tarefaForm.handleSubmit(onTarefaSubmit)} className="space-y-4">
              <FormField
                control={tarefaForm.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Criar wireframes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={tarefaForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes da tarefa..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tarefaForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                          <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                          <SelectItem value="CANCELADA">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tarefaForm.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BAIXA">Baixa</SelectItem>
                          <SelectItem value="MEDIA">Média</SelectItem>
                          <SelectItem value="ALTA">Alta</SelectItem>
                          <SelectItem value="CRITICA">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={tarefaForm.control}
                  name="responsavelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável (Opcional)</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} 
                        value={field.value ? field.value.toString() : "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          <SelectItem value={projeto.gerenteId.toString()}>
                            {projeto.gerenteNome} (Gerente)
                          </SelectItem>
                          {projeto.membros.map(m => (
                            <SelectItem key={m.usuarioId} value={m.usuarioId.toString()}>
                              {m.usuarioNome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={tarefaForm.control}
                  name="dataVencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vencimento (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setTarefaOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createTarefaMutation.isPending || updateTarefaMutation.isPending}>
                  {(createTarefaMutation.isPending || updateTarefaMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarefaId !== null} onOpenChange={(open) => !open && setDeleteTarefaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A tarefa será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarefaId && deleteTarefaMutation.mutate({ projetoId: id, id: deleteTarefaId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
