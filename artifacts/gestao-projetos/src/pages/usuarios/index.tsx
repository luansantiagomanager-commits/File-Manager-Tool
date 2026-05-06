import { Link } from "wouter";
import { Users, UserPlus, Settings, LogOut, BarChart3, LayoutDashboard, Search, Trash2, Edit, Eye, MoreHorizontal, Shield, User, Briefcase } from "lucide-react";
import { 
  useListUsuarios, 
  useDeleteUsuario,
  getListUsuariosQueryKey,
  getGetUsuarioStatsByPerfilQueryKey
} from "@workspace/api-client-react";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  const { data: usuarios, isLoading } = useListUsuarios();
  const deleteMutation = useDeleteUsuario();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredUsuarios = useMemo(() => {
    if (!usuarios) return [];
    if (!searchTerm) return usuarios;
    
    const term = searchTerm.toLowerCase();
    return usuarios.filter((u) => 
      u.nome.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term) ||
      u.cpf.includes(term) ||
      u.cargo.toLowerCase().includes(term) ||
      u.perfil.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteMutation.mutateAsync({ id: userToDelete });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: getListUsuariosQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUsuarioStatsByPerfilQueryKey() });
    } catch (error) {
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'ADMIN':
        return <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'GERENTE':
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground"><Briefcase className="w-3 h-3 mr-1" /> Gerente</Badge>;
      case 'COLABORADOR':
        return <Badge variant="outline" className="text-muted-foreground"><User className="w-3 h-3 mr-1" /> Colaborador</Badge>;
      default:
        return <Badge variant="outline">{perfil}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Colaboradores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os membros da equipe e seus acessos.</p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Colaborador
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <CardDescription>
              {usuarios ? `${usuarios.length} usuários cadastrados` : "Carregando..."}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email, cpf..."
              className="pl-9 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Contato</TableHead>
                  <TableHead className="font-medium">Cargo</TableHead>
                  <TableHead className="font-medium">Perfil</TableHead>
                  <TableHead className="font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /><Skeleton className="h-3 w-24 mt-1" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="group transition-colors hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium text-foreground">{usuario.nome}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{usuario.cpf}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{usuario.email}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{usuario.login}</div>
                      </TableCell>
                      <TableCell className="text-sm">{usuario.cargo}</TableCell>
                      <TableCell>
                        {getPerfilBadge(usuario.perfil)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu de ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/usuarios/${usuario.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                Visualizar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/usuarios/${usuario.id}/editar`} className="flex items-center cursor-pointer">
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                              onClick={() => setUserToDelete(usuario.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}