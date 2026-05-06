import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, projetoMembrosTable, usuariosTable } from "@workspace/db";
import {
  ListProjetoMembrosParams,
  AddProjetoMembroParams,
  AddProjetoMembroBody,
  RemoveProjetoMembroParams,
  ListProjetoMembrosResponse,
} from "@workspace/api-zod";

const router: IRouter = Router({ mergeParams: true });

router.get("/projetos/:projetoId/membros", async (req, res): Promise<void> => {
  const params = ListProjetoMembrosParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: projetoMembrosTable.id,
      projetoId: projetoMembrosTable.projetoId,
      usuarioId: projetoMembrosTable.usuarioId,
      usuarioNome: usuariosTable.nome,
      usuarioCargo: usuariosTable.cargo,
      usuarioPerfil: usuariosTable.perfil,
      createdAt: projetoMembrosTable.createdAt,
    })
    .from(projetoMembrosTable)
    .leftJoin(usuariosTable, eq(projetoMembrosTable.usuarioId, usuariosTable.id))
    .where(eq(projetoMembrosTable.projetoId, params.data.projetoId));

  res.json(ListProjetoMembrosResponse.parse(rows));
});

router.post("/projetos/:projetoId/membros", async (req, res): Promise<void> => {
  const params = AddProjetoMembroParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AddProjetoMembroBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [row] = await db
      .insert(projetoMembrosTable)
      .values({ projetoId: params.data.projetoId, usuarioId: body.data.usuarioId })
      .returning();

    const [full] = await db
      .select({
        id: projetoMembrosTable.id,
        projetoId: projetoMembrosTable.projetoId,
        usuarioId: projetoMembrosTable.usuarioId,
        usuarioNome: usuariosTable.nome,
        usuarioCargo: usuariosTable.cargo,
        usuarioPerfil: usuariosTable.perfil,
        createdAt: projetoMembrosTable.createdAt,
      })
      .from(projetoMembrosTable)
      .leftJoin(usuariosTable, eq(projetoMembrosTable.usuarioId, usuariosTable.id))
      .where(eq(projetoMembrosTable.id, row.id));

    res.status(201).json(full);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "Usuário já é membro deste projeto." });
      return;
    }
    throw err;
  }
});

router.delete("/projetos/:projetoId/membros/:usuarioId", async (req, res): Promise<void> => {
  const params = RemoveProjetoMembroParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(projetoMembrosTable)
    .where(
      and(
        eq(projetoMembrosTable.projetoId, params.data.projetoId),
        eq(projetoMembrosTable.usuarioId, params.data.usuarioId),
      ),
    )
    .returning({ id: projetoMembrosTable.id });

  if (!row) {
    res.status(404).json({ error: "Membro não encontrado neste projeto." });
    return;
  }

  res.sendStatus(204);
});

export default router;
