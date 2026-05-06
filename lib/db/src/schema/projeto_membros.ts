import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projetosTable } from "./projetos";
import { usuariosTable } from "./usuarios";

export const projetoMembrosTable = pgTable(
  "projeto_membros",
  {
    id: serial("id").primaryKey(),
    projetoId: integer("projeto_id")
      .notNull()
      .references(() => projetosTable.id, { onDelete: "cascade" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuariosTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.projetoId, t.usuarioId)],
);

export const insertProjetoMembroSchema = createInsertSchema(
  projetoMembrosTable,
).omit({ id: true, createdAt: true });
export type InsertProjetoMembro = z.infer<typeof insertProjetoMembroSchema>;
export type ProjetoMembro = typeof projetoMembrosTable.$inferSelect;
