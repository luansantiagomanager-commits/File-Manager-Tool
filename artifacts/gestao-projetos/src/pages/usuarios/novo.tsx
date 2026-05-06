import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateUsuario, getListUsuariosQueryKey, getGetUsuarioStatsByPerfilQueryKey } from "@workspace/api-client-react";
import { Perfil } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  cpf: z.string().min(11, "CPF inválido").max(14),
  email: z.string().email("E-mail inválido").max(100),
  cargo: z.string().min(2, "Cargo obrigatório").max(50),
  login: z.string().min(3, "Login deve ter no mínimo 3 caracteres").max(50),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(50),
  perfil: z.enum(["ADMIN", "GERENTE", "COLABORADOR"], {
    required_error: "Selecione um perfil",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function NovoUsuarioPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateUsuario();

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

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync({ data });
      
      toast({
        title: "Usuário cadastrado",
        description: "O usuário foi criado com sucesso.",
      });
      
      queryClient.invalidateQueries({ queryKey: getListUsuariosQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetUsuarioStatsByPerfilQueryKey() });
      
      setLocation("/usuarios");
    } catch (error) {
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao criar o usuário. Verifique os dados.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="h-8 w-8">
          <Link href="/usuarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Novo Colaborador</h1>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados para registrar um novo usuário no sistema.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              <CardDescription>Dados básicos de identificação do colaborador.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Maria Silva" {...field} />
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
                      <Input placeholder="000.000.000-00" {...field} />
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
                      <Input type="email" placeholder="maria@exemplo.com" {...field} />
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
              <CardDescription>Configure como o usuário irá acessar o sistema.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo / Função</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desenvolvedor Sênior" {...field} />
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
                    <FormDescription>
                      Define as permissões do usuário no sistema.
                    </FormDescription>
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
                      <Input placeholder="Ex: maria.silva" {...field} />
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
                    <FormLabel>Senha Temporária</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border bg-muted/20">
              <Button type="button" variant="outline" asChild disabled={createMutation.isPending}>
                <Link href="/usuarios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="min-w-32">
                {createMutation.isPending ? "Salvando..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Colaborador
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