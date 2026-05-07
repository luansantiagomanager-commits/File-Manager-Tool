import { useState } from "react";
import { useListProjetos, useDeleteProjeto, getListProjetosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, CalendarDays, Users, CheckSquare, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROJETOS_PER_PAGE = 9;

export function ProjetosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projetos, isLoading } = useListProjetos();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useDeleteProjeto({
    mutation: {
      onSuccess: () => {
        toast({ title: "Projeto excluído com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
        setDeleteId(null);
      },
      onError: () => {
        toast({ title: "Erro ao excluir projeto", variant: "destructive" });
        setDeleteId(null);
      }
    }
  });

  const filteredProjetos = projetos?.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.gerenteNome.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const totalPages = Math.max(1, Math.ceil(filteredProjetos.length / PROJETOS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjetos = filteredProjetos.slice(
    (safePage - 1) * PROJETOS_PER_PAGE,
    safePage * PROJETOS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANEJAMENTO": return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">Planejamento</Badge>;
      case "EM_ANDAMENTO": return <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">Em Andamento</Badge>;
      case "CONCLUIDO": return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">Concluído</Badge>;
      case "CANCELADO": return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os projetos da organização.</p>
        </div>
        <Link href="/projetos/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Projetos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar projetos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : filteredProjetos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedProjetos.map((projeto) => {
                const isAtrasado = new Date(projeto.dataPrazo) < new Date() && projeto.status !== "CONCLUIDO" && projeto.status !== "CANCELADO";
                const progress = projeto.totalTarefas > 0 ? (projeto.tarefasConcluidas / projeto.totalTarefas) * 100 : 0;
                
                return (
                  <Card key={projeto.id} className={`overflow-hidden transition-all hover:shadow-md ${isAtrasado ? 'border-destructive/50' : ''}`}>
                    <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1 pr-4">
                          <Link href={`/projetos/${projeto.id}`} className="font-semibold text-lg hover:underline truncate block">
                            {projeto.nome}
                          </Link>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {projeto.descricao || "Sem descrição"}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href={`/projetos/${projeto.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Detalhes
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/projetos/${projeto.id}/editar`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer"
                              onClick={() => setDeleteId(projeto.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {getStatusBadge(projeto.status)}
                        {isAtrasado && <Badge variant="destructive" className="bg-destructive/10 text-destructive border-transparent hover:bg-destructive/20">Atrasado</Badge>}
                      </div>

                      <div className="space-y-3 mt-auto">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5" title="Gerente">
                            <Users className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[100px]">{projeto.gerenteNome}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${isAtrasado ? 'text-destructive font-medium' : ''}`} title="Prazo">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>{format(new Date(projeto.dataPrazo), "dd/MM/yyyy")}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Tarefas</span>
                            <span>{projeto.tarefasConcluidas}/{projeto.totalTarefas} ({Math.round(progress)}%)</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}

          {!isLoading && filteredProjetos.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {Math.min((safePage - 1) * PROJETOS_PER_PAGE + 1, filteredProjetos.length)}–{Math.min(safePage * PROJETOS_PER_PAGE, filteredProjetos.length)} de {filteredProjetos.length} projetos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={safePage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {!isLoading && filteredProjetos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto text-muted mb-4" />
              <p className="text-lg font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm mt-1">Crie um novo projeto para começar a gerenciar sua equipe.</p>
              <Link href="/projetos/novo">
                <Button variant="outline" className="mt-4">
                  Criar Projeto
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto, 
              suas tarefas e associações de membros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
