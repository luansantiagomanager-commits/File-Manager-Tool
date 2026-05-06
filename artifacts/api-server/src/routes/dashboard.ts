import { Router, type IRouter } from "express";
import { eq, sql, lt, asc } from "drizzle-orm";
import { db, projetosTable, tarefasTable, usuariosTable, projetoMembrosTable } from "@workspace/db";
import {
  GetDashboardStatsResponse,
  GetTarefasPorUsuarioResponse,
  GetProjetosComPrazoResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  req.log.info("Getting dashboard stats");
  const now = new Date();

  const [[projStats], [tarefaStats], [userCount]] = await Promise.all([
    db
      .select({
        totalProjetos: sql<number>`cast(count(*) as int)`,
        projetosEmAndamento: sql<number>`cast(count(case when ${projetosTable.status} = 'EM_ANDAMENTO' then 1 end) as int)`,
        projetosConcluidos: sql<number>`cast(count(case when ${projetosTable.status} = 'CONCLUIDO' then 1 end) as int)`,
        projetosAtrasados: sql<number>`cast(count(case when ${projetosTable.status} != 'CONCLUIDO' and ${projetosTable.status} != 'CANCELADO' and ${projetosTable.dataPrazo} < ${now.toISOString()} then 1 end) as int)`,
      })
      .from(projetosTable),
    db
      .select({
        totalTarefas: sql<number>`cast(count(*) as int)`,
        tarefasConcluidas: sql<number>`cast(count(case when ${tarefasTable.status} = 'CONCLUIDA' then 1 end) as int)`,
        tarefasPendentes: sql<number>`cast(count(case when ${tarefasTable.status} = 'PENDENTE' then 1 end) as int)`,
      })
      .from(tarefasTable),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(usuariosTable),
  ]);

  res.json(
    GetDashboardStatsResponse.parse({
      ...projStats,
      ...tarefaStats,
      totalUsuarios: userCount.count,
    }),
  );
});

router.get("/dashboard/tarefas-por-usuario", async (req, res): Promise<void> => {
  const now = new Date();

  const rows = await db
    .select({
      usuarioId: usuariosTable.id,
      usuarioNome: usuariosTable.nome,
      totalTarefas: sql<number>`cast(count(${tarefasTable.id}) as int)`,
      tarefasConcluidas: sql<number>`cast(count(case when ${tarefasTable.status} = 'CONCLUIDA' then 1 end) as int)`,
      tarefasPendentes: sql<number>`cast(count(case when ${tarefasTable.status} in ('PENDENTE','EM_ANDAMENTO') then 1 end) as int)`,
      tarefasAtrasadas: sql<number>`cast(count(case when ${tarefasTable.status} not in ('CONCLUIDA','CANCELADA') and ${tarefasTable.dataVencimento} is not null and ${tarefasTable.dataVencimento} < ${now.toISOString()} then 1 end) as int)`,
    })
    .from(usuariosTable)
    .leftJoin(tarefasTable, eq(tarefasTable.responsavelId, usuariosTable.id))
    .groupBy(usuariosTable.id, usuariosTable.nome)
    .orderBy(sql`count(${tarefasTable.id}) desc`);

  res.json(GetTarefasPorUsuarioResponse.parse(rows));
});

router.get("/dashboard/projetos-com-prazo", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: projetosTable.id,
      nome: projetosTable.nome,
      status: projetosTable.status,
      dataPrazo: projetosTable.dataPrazo,
      gerenteNome: usuariosTable.nome,
      totalTarefas: sql<number>`cast(count(distinct ${tarefasTable.id}) as int)`,
      tarefasConcluidas: sql<number>`cast(count(distinct case when ${tarefasTable.status} = 'CONCLUIDA' then ${tarefasTable.id} end) as int)`,
    })
    .from(projetosTable)
    .leftJoin(usuariosTable, eq(projetosTable.gerenteId, usuariosTable.id))
    .leftJoin(tarefasTable, eq(projetosTable.id, tarefasTable.projetoId))
    .groupBy(projetosTable.id, usuariosTable.nome)
    .orderBy(asc(projetosTable.dataPrazo))
    .limit(10);

  res.json(GetProjetosComPrazoResponse.parse(rows));
});

export default router;
