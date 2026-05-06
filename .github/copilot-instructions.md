# Copilot Instructions

## Project Overview

This is a **bachelor project** — an appointment booking system with a service catalog. Users can browse services, book appointments at specific locations, and manage their bookings.

## Tech Stack

- **Runtime:** Bun
- **Monorepo:** Bun workspaces
- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Hono (lightweight web framework)
- **Database:** PostgreSQL 17 (Docker), Drizzle ORM
- **Language:** TypeScript (strict)
- **Linting:** ESLint (flat config), Prettier
- **Containerization:** Docker Compose

## Project Structure

```
apps/
  backend/     → Hono API server (Bun runtime)
  frontend/    → React + Vite + Tailwind app
packages/
  config/      → Shared ESLint, Prettier, and TypeScript configs
  db/          → Drizzle ORM schema, relations, and database client
  shared/      → Shared types and utilities
```

## Code Style Rules (MUST follow)

### Formatting (Prettier)
- Single quotes (`'`), not double quotes
- Semicolons required
- Trailing commas everywhere (`trailingComma: 'all'`)
- 2-space indentation (no tabs)
- Bracket spacing enabled
- Always use arrow parens: `(x) => x`, not `x => x`

### TypeScript / ESLint
- **Named imports/exports only** — no default imports, no default exports
- **Type imports:** use `import type { Foo } from '...'` for type-only imports
- **Type definitions:** use `type`, not `interface`
- **No `console.log`** — use `console.warn` or `console.error` only
- **No unused variables** — prefix intentionally unused params with `_` (e.g. `_req`)
- **No floating promises** — always `await` or handle promises
- **No `any`** — use proper types

### Database (Drizzle ORM)
- All primary keys are **UUIDs** (`uuid().primaryKey().defaultRandom()`)
- Column names use **snake_case** with table prefix (e.g. `user_email`, `service_title`)
- Foreign keys are named `<table>_fk` or `<column>_fk` (e.g. `user_location_fk`)
- Soft deletes via `*_deleted_at` timestamp columns
- All tables have `*_created_at` (defaultNow) and `*_updated_at` timestamps
- Schema files live in `packages/db/src/schema/`, one file per table
- Use `@repo/db` to import schema and db client

### General
- Use `bun` for all commands (not `npm` or `yarn`)
- Shared code goes in `packages/shared`
- Environment variables are in `.env` at the project root
