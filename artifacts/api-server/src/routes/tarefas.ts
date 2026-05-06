import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tarefasTable, usuariosTable } from "@workspace/db";
import {
  ListTarefasParams,
  CreateTarefaParams,
  CreateTarefaBody,
  UpdateTarefaParams,
  UpdateTarefaBody,
  DeleteTarefaParams,
  ListTarefasResponse,
  UpdateTarefaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const tarefaSelect = {
  id: tarefasTable.id,
  titulo: tarefasTable.titulo,
  descricao: tarefasTable.descricao,
  status: tarefasTable.status,
  prioridade: tarefasTable.prioridade,
  projetoId: tarefasTable.projetoId,
  responsavelId: tarefasTable.responsavelId,
  responsavelNome: usuariosTable.nome,
  dataVencimento: tarefasTable.dataVencimento,
  createdAt: tarefasTable.createdAt,
  updatedAt: tarefasTable.updatedAt,
};

router.get("/projetos/:projetoId/tarefas", async (req, res): Promise<void> => {
  const params = ListTarefasParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select(tarefaSelect)
    .from(tarefasTable)
    .leftJoin(usuariosTable, eq(tarefasTable.responsavelId, usuariosTable.id))
    .where(eq(tarefasTable.projetoId, params.data.projetoId))
    .orderBy(tarefasTable.createdAt);

  res.json(ListTarefasResponse.parse(rows));
});

router.post("/projetos/:projetoId/tarefas", async (req, res): Promise<void> => {
  const params = CreateTarefaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateTarefaBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid create tarefa body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(tarefasTable)
    .values({ ...parsed.data, projetoId: params.data.projetoId })
    .returning();

  const [full] = await db
    .select(tarefaSelect)
    .from(tarefasTable)
    .leftJoin(usuariosTable, eq(tarefasTable.responsavelId, usuariosTable.id))
    .where(eq(tarefasTable.id, row.id));

  res.status(201).json(full);
});

router.patch("/projetos/:projetoId/tarefas/:id", async (req, res): Promise<void> => {
  const params = UpdateTarefaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTarefaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(tarefasTable)
    .set(parsed.data)
    .where(
      and(
        eq(tarefasTable.id, params.data.id),
        eq(tarefasTable.projetoId, params.data.projetoId),
      ),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Tarefa não encontrada." });
    return;
  }

  const [full] = await db
    .select(tarefaSelect)
    .from(tarefasTable)
    .leftJoin(usuariosTable, eq(tarefasTable.responsavelId, usuariosTable.id))
    .where(eq(tarefasTable.id, updated.id));

  res.json(UpdateTarefaResponse.parse(full));
});

router.delete("/projetos/:projetoId/tarefas/:id", async (req, res): Promise<void> => {
  const params = DeleteTarefaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(tarefasTable)
    .where(
      and(
        eq(tarefasTable.id, params.data.id),
        eq(tarefasTable.projetoId, params.data.projetoId),
      ),
    )
    .returning({ id: tarefasTable.id });

  if (!row) {
    res.status(404).json({ error: "Tarefa não encontrada." });
    return;
  }

  res.sendStatus(204);
});

export default router;
