import { Link, useParams } from "wouter";
import { ArrowLeft, Edit, AlertCircle, Shield, Briefcase, User, Calendar, Mail, KeyRound, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useGetUsuario, getGetUsuarioQueryKey } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function DetalhesUsuarioPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  
  const { data: usuario, isLoading, isError } = useGetUsuario(userId, { 
    query: { 
      enabled: !!userId, 
      queryKey: getGetUsuarioQueryKey(userId) 
    } 
  });

  if (isError) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados deste usuário.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/usuarios"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !usuario) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="col-span-1 md:col-span-2 h-64 rounded-xl" />
          <Skeleton className="col-span-1 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'ADMIN':
        return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"><Shield className="w-3 h-3 mr-1.5" /> Administrador</Badge>;
      case 'GERENTE':
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground"><Briefcase className="w-3 h-3 mr-1.5" /> Gerente</Badge>;
      case 'COLABORADOR':
        return <Badge variant="outline" className="text-muted-foreground"><User className="w-3 h-3 mr-1.5" /> Colaborador</Badge>;
      default:
        return <Badge variant="outline">{perfil}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{usuario.nome}</h1>
              {getPerfilBadge(usuario.perfil)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{usuario.cargo}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/usuarios/${userId}/editar`} className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar Perfil
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" /> Nome Completo
                  </div>
                  <div className="text-foreground font-medium">{usuario.nome}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> CPF
                  </div>
                  <div className="text-foreground font-medium">{usuario.cpf}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> E-mail
                  </div>
                  <div className="text-foreground font-medium">{usuario.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Cargo
                  </div>
                  <div className="text-foreground font-medium">{usuario.cargo}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Acesso ao Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                  <KeyRound className="h-4 w-4" /> Login
                </div>
                <div className="text-foreground font-mono bg-background p-2 rounded border inline-block text-sm">
                  {usuario.login}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Criado em
                  </div>
                  <div className="text-sm text-foreground">{formatDate(usuario.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                    <Edit className="h-4 w-4" /> Última atualização
                  </div>
                  <div className="text-sm text-foreground">{formatDate(usuario.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}