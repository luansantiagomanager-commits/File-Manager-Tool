import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { 
  useGetUsuario, 
  useUpdateUsuario, 
  getGetUsuarioQueryKey,
  getListUsuariosQueryKey,
  getGetUsuarioStatsByPerfilQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100).optional(),
  cpf: z.string().min(11, "CPF inválido").max(14).optional(),
  email: z.string().email("E-mail inválido").max(100).optional(),
  cargo: z.string().min(2, "Cargo obrigatório").max(50).optional(),
  login: z.string().min(3, "Login deve ter no mínimo 3 caracteres").max(50).optional(),
  senha: z.string().max(50).optional().or(z.literal("")),
  perfil: z.enum(["ADMIN", "GERENTE", "COLABORADOR"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: usuario, isLoading, isError } = useGetUsuario(userId, { 
    query: { 
      enabled: !!userId, 
      queryKey: getGetUsuarioQueryKey(userId) 
    } 
  });
  
  const updateMutation = useUpdateUsuario();
  const initializedForId = useRef<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      email: "",
      cargo: "",
      login: "",
      senha: "",
      perfil: "COLABORADOR",
    },
  });

  useEffect(() => {
    if (usuario && initializedForId.current !== userId) {
      initializedForId.current = userId;
      form.reset({
        nome: usuario.nome,
        cpf: usuario.cpf,
        email: usuario.email,
        cargo: usuario.cargo,
        login: usuario.login,
        senha: "", // leave empty, only send if user wants to change
        perfil: usuario.perfil as any,
      });
    }
  }, [usuario, userId, form]);

  const onSubmit = async (data: FormValues) => {
    // Only include senha if it's not empty
    const payload = { ...data };
    if (!payload.senha) {
      delete payload.senha;
    }

    try {
      await updateMutation.mutateAsync({ 
        id: userId, 
        data: payload as any
      });
      
      toast({
        title: "Usuário atualizado",
        description: "Os dados foram salvos com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: getListUsuariosQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUsuarioStatsByPerfilQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUsuarioQueryKey(userId) });
      
      setLocation(`/usuarios/${userId}`);
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    }
  };

  if (isError) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados deste usuário. Ele pode ter sido removido ou não existir.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/usuarios"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Editar Colaborador</h1>
            <p className="text-sm text-muted-foreground mt-1">Atualize os dados de {usuario?.nome}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Acesso e Permissões</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Função</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perfil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Acesso (Perfil)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                        <SelectItem value="GERENTE">Gerente</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Usuário (Login)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Deixe em branco para não alterar" {...field} />
                    </FormControl>
                    <FormDescription>
                      Preencha apenas se desejar redefinir a senha atual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border bg-muted/20">
              <Button type="button" variant="outline" asChild disabled={updateMutation.isPending}>
                <Link href={`/usuarios/${userId}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="min-w-32">
                {updateMutation.isPending ? "Salvando..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}