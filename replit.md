# Sistema de Gestão de Projetos

A web app for managing project team members, registering users with roles (Admin, Gerente, Colaborador), and tracking their organizational information.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied via `/api`)
- `pnpm --filter @workspace/gestao-projetos run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (shadcn/ui), Wouter routing, TanStack React Query
- API: Express 5 + Pino logging
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/usuarios.ts` — usuarios table + Drizzle types
- `artifacts/api-server/src/routes/usuarios.ts` — user CRUD routes
- `artifacts/gestao-projetos/src/` — React frontend
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (server validation)

## Architecture decisions

- Passwords are hashed with SHA-256 before storage (field: `senha_hash`)
- `senhaHash` is never returned from any API response (select list is explicit on all routes)
- `GET /api/usuarios/stats/perfil` must be registered BEFORE `GET /api/usuarios/:id` in Express to avoid route shadowing
- Orval `schemas` option was removed from the zod output config to avoid duplicate exports between `generated/api.ts` and `generated/types/`
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (not types) to avoid TS2308 conflicts

## Product

- List all registered users with search, profile badges (Admin / Gerente / Colaborador), and delete
- Register new users with all required fields and role assignment
- View and edit individual user details
- Sidebar shows profile count breakdown (Admin / Gerente / Colaborador stats)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always re-run codegen after editing `openapi.yaml`
- After codegen, manually ensure `lib/api-zod/src/index.ts` only has `export * from "./generated/api"` (orval may not update it cleanly)
- Do not run `pnpm dev` at workspace root — use individual artifact workflows

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
