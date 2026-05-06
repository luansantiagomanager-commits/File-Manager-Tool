import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProjeto, useListUsuarios, getListProjetosQueryKey, getGetProjetoStatsByStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  status: z.enum(["PLANEJAMENTO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataPrazo: z.string().min(1, "Data de prazo é obrigatória"),
  gerenteId: z.coerce.number().min(1, "Gerente é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

export function NovoProjetoPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: usuarios, isLoading: loadingUsuarios } = useListUsuarios();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      status: "PLANEJAMENTO",
      dataInicio: new Date().toISOString().split("T")[0],
      dataPrazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      gerenteId: 0,
    },
  });

  const createMutation = useCreateProjeto({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Projeto criado com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getListProjetosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProjetoStatsByStatusQueryKey() });
        setLocation(`/projetos/${data.id}`);
      },
      onError: (error) => {
        toast({ 
          title: "Erro ao criar projeto", 
          description: error.error || "Ocorreu um erro inesperado",
          variant: "destructive" 
        });
      }
    }
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate({ data: values });
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/projetos">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Projeto</h1>
          <p className="text-muted-foreground mt-1">Preencha os dados para criar um novo projeto.</p>
        </div>
      </div>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>
                Defina os detalhes principais, prazos e o gerente responsável.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Redesign do Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os objetivos e escopo deste projeto..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PLANEJAMENTO">Planejamento</SelectItem>
                          <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                          <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                          <SelectItem value="CANCELADO">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gerenteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gerente do Projeto</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        defaultValue={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger disabled={loadingUsuarios}>
                            <SelectValue placeholder="Selecione um gerente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios?.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.nome} ({user.cargo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataPrazo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Prazo</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-6">
              <Link href="/projetos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Projeto
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
