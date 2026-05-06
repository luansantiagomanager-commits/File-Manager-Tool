import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projetosTable } from "./projetos";
import { usuariosTable } from "./usuarios";

export const statusTarefaEnum = pgEnum("status_tarefa", [
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "CANCELADA",
]);

export const prioridadeTarefaEnum = pgEnum("prioridade_tarefa", [
  "BAIXA",
  "MEDIA",
  "ALTA",
  "CRITICA",
]);

export const tarefasTable = pgTable("tarefas", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  status: statusTarefaEnum("status").notNull().default("PENDENTE"),
  prioridade: prioridadeTarefaEnum("prioridade").notNull().default("MEDIA"),
  projetoId: integer("projeto_id")
    .notNull()
    .references(() => projetosTable.id, { onDelete: "cascade" }),
  responsavelId: integer("responsavel_id").references(
    () => usuariosTable.id,
    { onDelete: "set null" },
  ),
  dataVencimento: timestamp("data_vencimento", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertTarefaSchema = createInsertSchema(tarefasTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTarefa = z.infer<typeof insertTarefaSchema>;
export type Tarefa = typeof tarefasTable.$inferSelect;
