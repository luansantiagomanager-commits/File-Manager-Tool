import { Router } from "express";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";

const router = Router();

router.post("/auth/login", async (req, res) => {
  req.log.info("Login attempt");
  const { login, senha } = req.body ?? {};

  if (!login || !senha) {
    return res.status(400).json({ error: "Login e senha são obrigatórios" });
  }

  const senhaHash = createHash("sha256").update(String(senha)).digest("hex");

  const [user] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      login: usuariosTable.login,
      email: usuariosTable.email,
      cargo: usuariosTable.cargo,
      perfil: usuariosTable.perfil,
      senhaHash: usuariosTable.senhaHash,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.login, String(login)));

  if (!user || user.senhaHash !== senhaHash) {
    return res.status(401).json({ error: "Usuário ou senha incorretos" });
  }

  req.session.userId = user.id;

  const { senhaHash: _hash, ...safeUser } = user;
  req.log.info({ userId: user.id }, "Login successful");
  return res.json(safeUser);
});

router.post("/auth/logout", (req, res) => {
  req.log.info({ userId: req.session.userId }, "Logout");
  req.session.destroy(() => {
    res.status(204).send();
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const [user] = await db
    .select({
      id: usuariosTable.id,
      nome: usuariosTable.nome,
      login: usuariosTable.login,
      email: usuariosTable.email,
      cargo: usuariosTable.cargo,
      perfil: usuariosTable.perfil,
    })
    .from(usuariosTable)
    .where(eq(usuariosTable.id, req.session.userId));

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Usuário não encontrado" });
  }

  return res.json(user);
});

export default router;
