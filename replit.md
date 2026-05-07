# Sistema de Gestão de Projetos

A web app for managing project team members, registering users with roles (Admin, Gerente, Colaborador), and tracking their organizational information. Includes session-based authentication, role-aware settings, and a premium light design.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied via `/api`)
- `pnpm --filter @workspace/gestao-projetos run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — secret for express-session

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (shadcn/ui), Wouter routing, TanStack React Query
- API: Express 5 + Pino logging + express-session (MemoryStore)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/usuarios.ts` — usuarios table + Drizzle types
- `artifacts/api-server/src/routes/auth.ts` — login/logout/me routes (public)
- `artifacts/api-server/src/routes/usuarios.ts` — user CRUD routes (auth-protected)
- `artifacts/api-server/src/middleware/auth.ts` — requireAuth middleware
- `artifacts/api-server/src/app.ts` — Express setup + session middleware
- `artifacts/gestao-projetos/src/contexts/auth.tsx` — AuthContext + useAuth hook
- `artifacts/gestao-projetos/src/pages/auth/login.tsx` — login page
- `artifacts/gestao-projetos/src/pages/configuracoes/index.tsx` — settings page
- `artifacts/gestao-projetos/src/` — React frontend
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (server validation)

## Architecture decisions

- Passwords are hashed with SHA-256 before storage (field: `senha_hash`)
- `senhaHash` is never returned from any API response (select list is explicit on all routes)
- `GET /api/usuarios/stats/perfil` must be registered BEFORE `GET /api/usuarios/:id` in Express to avoid route shadowing
- Orval `schemas` option was removed from the zod output config to avoid duplicate exports between `generated/api.ts` and `generated/types/`
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (not types) to avoid TS2308 conflicts
- Auth routes (`/auth/login`, `/auth/logout`, `/auth/me`) and `/healthz` are public; all other API routes require a valid session
- Sessions use MemoryStore (single-server dev setup); for multi-instance deployment, swap to connect-pg-simple
- `lib/api-client-react/src/custom-fetch.ts` includes `credentials: "include"` so cookies are sent with all API calls
- Role-based access: sidebar shows "Usuários" only for ADMIN/GERENTE; settings page controls what fields each role can edit

## Product

- **Login screen**: Split-panel premium design (dark navy left panel + white form right), session-based auth
- **Sidebar**: Dark navy with user avatar, name, role badge (Administrador/Gerente/Colaborador), and functional "Sair" logout
- **Settings page** (`/configuracoes`): "Meu Perfil" tab (role-aware field editing) + "Segurança" tab (password change)
- **Role-based settings**: ADMIN can edit all fields including login; GERENTE can edit nome/email/cargo; COLABORADOR edits nome/email only
- List all registered users with search, profile badges, and delete
- Register new users with all required fields and role assignment
- View and edit individual user details
- Pagination: 9 projects/page, 10 tasks/page with status filter

## User preferences

- Linguagem: Português BR em toda a UI
- Design: Premium light/clear palette — deep navy sidebar (`hsl(222,47%,11%)`), rich indigo-blue primary (`hsl(233,75%,48%)`), clean white cards with multi-layer shadows

## Gotchas

- Always re-run codegen after editing `openapi.yaml`
- After codegen, manually ensure `lib/api-zod/src/index.ts` only has `export * from "./generated/api"` (orval may not update it cleanly)
- Do not run `pnpm dev` at workspace root — use individual artifact workflows
- Google Fonts `@import url(...)` must be the VERY FIRST line of `index.css` (before Tailwind imports)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
