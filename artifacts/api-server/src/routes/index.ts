import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usuariosRouter from "./usuarios";
import projetosRouter from "./projetos";
import membrosRouter from "./membros";
import tarefasRouter from "./tarefas";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usuariosRouter);
router.use(projetosRouter);
router.use(membrosRouter);
router.use(tarefasRouter);
router.use(dashboardRouter);

export default router;
