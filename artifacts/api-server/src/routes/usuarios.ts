import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";
import {
  CreateUsuarioBody,
  UpdateUsuarioBody,
  GetUsuarioParams,
  UpdateUsuarioParams,
  DeleteUsuarioParams,
  ListUsuariosResponse,
  GetUsuarioResponse,
  UpdateUsuarioResponse,
  GetUsuarioStatsByPerfilResponse,
} from "@workspace/api-zod";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashSenha(senha: string): string {
  return createHash("sha256").update(senha).digest("hex");
}

router.get("/usuarios", async (req, res): Promise<void> => {
  req.log.info("Listing usuarios");
  const rows = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      cpf: usuariosTable.cpf,
      email: usuariosTable.email,
      cargo: usuariosTable.cargo,
      login: usuariosTable.login,
      perfil: usuariosTable.perfil,
      createdAt: usuariosTable.createdAt,
      updatedAt: usuariosTable.updatedAt,
    })
    .from(usuariosTable)
    .orderBy(usuariosTable.createdAt);
  res.json(ListUsuariosResponse.parse(rows));
});

router.post("/usuarios", async (req, res): Promise<void> => {
  const parsed = CreateUsuarioBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid create body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { senha, ...rest } = parsed.data;

  try {
    const [row] = await db
      .insert(usuariosTable)
      .values({ ...rest, senhaHash: hashSenha(senha) })
      .returning({
        id: usuariosTable.id,
        nome: usuariosTable.nome,
        cpf: usuariosTable.cpf,
        email: usuariosTable.email,
        cargo: usuariosTable.cargo,
        login: usuariosTable.login,
        perfil: usuariosTable.perfil,
        createdAt: usuariosTable.createdAt,
        updatedAt: usuariosTable.updatedAt,
      });
    res.status(201).json(GetUsuarioResponse.parse(row));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "CPF, email ou login já cadastrado." });
      return;
    }
    throw err;
  }
});

router.get("/usuarios/stats/perfil", async (req, res): Promise<void> => {
  req.log.info("Getting stats by perfil");
  const rows = await db
    .select({
      perfil: usuariosTable.perfil,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(usuariosTable)
    .groupBy(usuariosTable.perfil);
  res.json(GetUsuarioStatsByPerfilResponse.parse(rows));
});

router.get("/usuarios/:id", async (req, res): Promise<void> => {
  const params = GetUsuarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      cpf: usuariosTable.cpf,
      email: usuariosTable.email,
      cargo: usuariosTable.cargo,
      login: usuariosTable.login,
      perfil: usuariosTable.perfil,
      createdAt: usuariosTable.createdAt,
      updatedAt: usuariosTable.updatedAt,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  res.json(GetUsuarioResponse.parse(row));
});

router.patch("/usuarios/:id", async (req, res): Promise<void> => {
  const params = UpdateUsuarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUsuarioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { senha, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (senha) {
    updateData.senhaHash = hashSenha(senha);
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ error: "Nenhum campo para atualizar." });
    return;
  }

  try {
    const [row] = await db
      .update(usuariosTable)
      .set(updateData)
      .where(eq(usuariosTable.id, params.data.id))
      .returning({
        id: usuariosTable.id,
        nome: usuariosTable.nome,
        cpf: usuariosTable.cpf,
        email: usuariosTable.email,
        cargo: usuariosTable.cargo,
        login: usuariosTable.login,
        perfil: usuariosTable.perfil,
        createdAt: usuariosTable.createdAt,
        updatedAt: usuariosTable.updatedAt,
      });

    if (!row) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    res.json(UpdateUsuarioResponse.parse(row));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "CPF, email ou login já cadastrado." });
      return;
    }
    throw err;
  }
});

router.delete("/usuarios/:id", async (req, res): Promise<void> => {
  const params = DeleteUsuarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(usuariosTable)
    .where(eq(usuariosTable.id, params.data.id))
    .returning({ id: usuariosTable.id });

  if (!row) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  res.sendStatus(204);
});

export default router;
