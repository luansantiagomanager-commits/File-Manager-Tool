import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usuariosRouter from "./usuarios";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usuariosRouter);

export default router;
