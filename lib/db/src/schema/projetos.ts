import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const statusProjetoEnum = pgEnum("status_projeto", [
  "PLANEJAMENTO",
  "EM_ANDAMENTO",
  "CONCLUIDO",
  "CANCELADO",
]);

export const projetosTable = pgTable("projetos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  status: statusProjetoEnum("status").notNull().default("PLANEJAMENTO"),
  dataInicio: timestamp("data_inicio", { withTimezone: true }).notNull(),
  dataPrazo: timestamp("data_prazo", { withTimezone: true }).notNull(),
  gerenteId: integer("gerente_id")
    .notNull()
    .references(() => usuariosTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProjetoSchema = createInsertSchema(projetosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProjeto = z.infer<typeof insertProjetoSchema>;
export type Projeto = typeof projetosTable.$inferSelect;
