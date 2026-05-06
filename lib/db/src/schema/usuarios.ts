import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const perfilEnum = pgEnum("perfil", ["ADMIN", "GERENTE", "COLABORADOR"]);

export const usuariosTable = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  email: text("email").notNull().unique(),
  cargo: text("cargo").notNull(),
  login: text("login").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  perfil: perfilEnum("perfil").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuariosTable.$inferSelect;
