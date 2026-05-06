import { Router, type IRouter } from "express";
import { eq, sql, asc } from "drizzle-orm";
import { db, projetosTable, usuariosTable, projetoMembrosTable, tarefasTable } from "@workspace/db";
import {
  CreateProjetoBody,
  UpdateProjetoBody,
  GetProjetoParams,
  UpdateProjetoParams,
  DeleteProjetoParams,
  ListProjetosResponse,
  GetProjetoResponse,
  UpdateProjetoResponse,
  GetProjetoStatsByStatusResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const projetoSelect = {
  id: projetosTable.id,
  nome: projetosTable.nome,
  descricao: projetosTable.descricao,
  status: projetosTable.status,
  dataInicio: projetosTable.dataInicio,
  dataPrazo: projetosTable.dataPrazo,
  gerenteId: projetosTable.gerenteId,
  gerenteNome: usuariosTable.nome,
  createdAt: projetosTable.createdAt,
  updatedAt: projetosTable.updatedAt,
};

router.get("/projetos", async (req, res): Promise<void> => {
  req.log.info("Listing projetos");
  const rows = await db
    .select({
      ...projetoSelect,
      totalMembros: sql<number>`cast(count(distinct ${projetoMembrosTable.id}) as int)`,
      totalTarefas: sql<number>`cast(count(distinct ${tarefasTable.id}) as int)`,
      tarefasConcluidas: sql<number>`cast(count(distinct case when ${tarefasTable.status} = 'CONCLUIDA' then ${tarefasTable.id} end) as int)`,
    })
    .from(projetosTable)
    .leftJoin(usuariosTable, eq(projetosTable.gerenteId, usuariosTable.id))
    .leftJoin(projetoMembrosTable, eq(projetosTable.id, projetoMembrosTable.projetoId))
    .leftJoin(tarefasTable, eq(projetosTable.id, tarefasTable.projetoId))
    .groupBy(projetosTable.id, usuariosTable.nome)
    .orderBy(projetosTable.createdAt);
  res.json(ListProjetosResponse.parse(rows));
});

router.post("/projetos", async (req, res): Promise<void> => {
  const parsed = CreateProjetoBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid create projeto body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(projetosTable)
    .values(parsed.data)
    .returning();

  const [full] = await db
    .select({
      ...projetoSelect,
      totalMembros: sql<number>`cast(0 as int)`,
      totalTarefas: sql<number>`cast(0 as int)`,
      tarefasConcluidas: sql<number>`cast(0 as int)`,
    })
    .from(projetosTable)
    .leftJoin(usuariosTable, eq(projetosTable.gerenteId, usuariosTable.id))
    .where(eq(projetosTable.id, row.id));

  res.status(201).json(GetProjetoResponse.parse(full));
});

router.get("/projetos/stats/status", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      status: projetosTable.status,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(projetosTable)
    .groupBy(projetosTable.status);
  res.json(GetProjetoStatsByStatusResponse.parse(rows));
});

router.get("/projetos/:id", async (req, res): Promise<void> => {
  const params = GetProjetoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [projeto] = await db
    .select(projetoSelect)
    .from(projetosTable)
    .leftJoin(usuariosTable, eq(projetosTable.gerenteId, usuariosTable.id))
    .where(eq(projetosTable.id, params.data.id));

  if (!projeto) {
    res.status(404).json({ error: "Projeto não encontrado." });
    return;
  }

  const membros = await db
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
    .where(eq(projetoMembrosTable.projetoId, params.data.id));

  const tarefas = await db
    .select({
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
    })
    .from(tarefasTable)
    .leftJoin(usuariosTable, eq(tarefasTable.responsavelId, usuariosTable.id))
    .where(eq(tarefasTable.projetoId, params.data.id))
    .orderBy(tarefasTable.createdAt);

  res.json(GetProjetoResponse.parse({ ...projeto, membros, tarefas }));
});

router.patch("/projetos/:id", async (req, res): Promise<void> => {
  const params = UpdateProjetoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjetoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(projetosTable)
    .set(parsed.data)
    .where(eq(projetosTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Projeto não encontrado." });
    return;
  }

  const [full] = await db
    .select({
      ...projetoSelect,
      totalMembros: sql<number>`cast(count(distinct ${projetoMembrosTable.id}) as int)`,
      totalTarefas: sql<number>`cast(count(distinct ${tarefasTable.id}) as int)`,
      tarefasConcluidas: sql<number>`cast(count(distinct case when ${tarefasTable.status} = 'CONCLUIDA' then ${tarefasTable.id} end) as int)`,
    })
    .from(projetosTable)
    .leftJoin(usuariosTable, eq(projetosTable.gerenteId, usuariosTable.id))
    .leftJoin(projetoMembrosTable, eq(projetosTable.id, projetoMembrosTable.projetoId))
    .leftJoin(tarefasTable, eq(projetosTable.id, tarefasTable.projetoId))
    .where(eq(projetosTable.id, params.data.id))
    .groupBy(projetosTable.id, usuariosTable.nome);

  res.json(UpdateProjetoResponse.parse(full));
});

router.delete("/projetos/:id", async (req, res): Promise<void> => {
  const params = DeleteProjetoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(projetosTable)
    .where(eq(projetosTable.id, params.data.id))
    .returning({ id: projetosTable.id });

  if (!row) {
    res.status(404).json({ error: "Projeto não encontrado." });
    return;
  }

  res.sendStatus(204);
});

export default router;
