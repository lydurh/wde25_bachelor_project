# Database Integration Plan — Drizzle + PostgreSQL

## Overview

Import the provided PostgreSQL schema into the project using **Drizzle ORM** inside `packages/db`. The project already has `drizzle-orm`, `drizzle-kit`, and `postgres` (postgres.js driver) installed.

---

## Current State

- `packages/db/index.ts` — empty (`export {}`)
- `packages/db/src/` — empty folder
- `packages/db/package.json` — has `drizzle-orm`, `drizzle-kit`, `postgres` deps
- Database runs via Docker Compose (`postgres:17`) on port `5432`
- Env vars: `POSTGRES_USER=dev`, `POSTGRES_PASSWORD=dev`, `POSTGRES_DB=bachelor`

---

## Step 1 — Create Drizzle Schema Files

Create one file per table inside `packages/db/src/schema/`:

### `packages/db/src/schema/locations.ts`

Define `locations` table using `pgTable`:

| Column               | Drizzle Type                          | Constraints / Default        |
| -------------------- | ------------------------------------- | ---------------------------- |
| `location_pk`        | `serial`                              | `primaryKey()`               |
| `location_address`   | `varchar(255)`                        | `notNull()`                  |
| `location_postal_code` | `varchar(20)`                       |                              |
| `location_city`      | `varchar(100)`                        | `notNull()`                  |
| `location_country`   | `varchar(100)`                        |                              |
| `location_latitude`  | `decimal(9, 6)`                       |                              |
| `location_longitude` | `decimal(9, 6)`                       |                              |
| `location_created_at`| `timestamp({ withTimezone: true })`   | `notNull()`, `defaultNow()`  |
| `location_updated_at`| `timestamp({ withTimezone: true })`   |                              |
| `location_deleted_at`| `timestamp({ withTimezone: true })`   |                              |

### `packages/db/src/schema/users.ts`

Define `users` table:

| Column            | Drizzle Type                          | Constraints / Default                          |
| ----------------- | ------------------------------------- | ---------------------------------------------- |
| `user_pk`         | `serial`                              | `primaryKey()`                                 |
| `user_role`       | `varchar(50)`                         | `notNull()`, `default('client')`               |
| `user_email`      | `varchar(255)`                        | `notNull()`, `unique()`                        |
| `user_first_name` | `varchar(100)`                        | `notNull()`                                    |
| `user_last_name`  | `varchar(100)`                        | `notNull()`                                    |
| `user_location_fk`| `integer`                             | `references(() => locations.location_pk, { onDelete: 'set null' })` |
| `user_password`   | `text`                                | `notNull()`                                    |
| `user_note`       | `text`                                |                                                |
| `user_created_at` | `timestamp({ withTimezone: true })`   | `notNull()`, `defaultNow()`                    |
| `user_updated_at` | `timestamp({ withTimezone: true })`   |                                                |
| `user_deleted_at` | `timestamp({ withTimezone: true })`   |                                                |
| `user_verified_at`| `timestamp({ withTimezone: true })`   |                                                |

### `packages/db/src/schema/services.ts`

Define `services` table:

| Column                | Drizzle Type                          | Constraints / Default        |
| --------------------- | ------------------------------------- | ---------------------------- |
| `service_pk`          | `serial`                              | `primaryKey()`               |
| `service_title`       | `varchar(255)`                        | `notNull()`                  |
| `service_description` | `text`                                |                              |
| `service_duration`    | `integer`                             | `notNull()` (minutes)        |
| `service_price`       | `decimal(10, 2)`                      | `notNull()`                  |
| `service_created_at`  | `timestamp({ withTimezone: true })`   | `notNull()`, `defaultNow()`  |
| `service_updated_at`  | `timestamp({ withTimezone: true })`   |                              |
| `service_deleted_at`  | `timestamp({ withTimezone: true })`   |                              |

### `packages/db/src/schema/availability.ts`

Define `availability` table:

| Column                    | Drizzle Type                          | Constraints / Default                 |
| ------------------------- | ------------------------------------- | ------------------------------------- |
| `availability_pk`         | `serial`                              | `primaryKey()`                        |
| `availability_date`       | `date`                                | `notNull()`                           |
| `availability_start_time` | `time`                                | `notNull()`                           |
| `availability_end_time`   | `time`                                | `notNull()`                           |
| `availability_type`       | `varchar(50)`                         | `notNull()`, `default('available')`   |
| `availability_created_at` | `timestamp({ withTimezone: true })`   | `notNull()`, `defaultNow()`           |
| `availability_updated_at` | `timestamp({ withTimezone: true })`   |                                       |
| `availability_deleted_at` | `timestamp({ withTimezone: true })`   |                                       |

### `packages/db/src/schema/appointments.ts`

Define `appointments` table:

| Column                    | Drizzle Type                          | Constraints / Default                                                |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `appointment_pk`          | `serial`                              | `primaryKey()`                                                       |
| `appointment_user_fk`     | `integer`                             | `notNull()`, `references(() => users.user_pk, { onDelete: 'cascade' })` |
| `location_fk`             | `integer`                             | `references(() => locations.location_pk, { onDelete: 'set null' })`  |
| `appointment_time`        | `time`                                | `notNull()`                                                          |
| `appointment_date`        | `date`                                | `notNull()`                                                          |
| `appointment_notes`       | `text`                                |                                                                      |
| `appointment_duration`    | `integer`                             | (minutes)                                                            |
| `appointment_total_price` | `decimal(10, 2)`                      |                                                                      |
| `appointment_status`      | `varchar(50)`                         | `notNull()`, `default('pending')`                                    |
| `appointment_created_at`  | `timestamp({ withTimezone: true })`   | `notNull()`, `defaultNow()`                                          |
| `appointment_updated_at`  | `timestamp({ withTimezone: true })`   |                                                                      |
| `appointment_deleted_at`  | `timestamp({ withTimezone: true })`   |                                                                      |

Add an index: `idx_appointments_user_fk` on `appointment_user_fk` using Drizzle's `.index()`.

### `packages/db/src/schema/appointmentServices.ts`

Define `appointment_services` junction table:

| Column           | Drizzle Type | Constraints / Default                                                     |
| ---------------- | ------------ | ------------------------------------------------------------------------- |
| `appointment_fk` | `integer`    | `notNull()`, `references(() => appointments.appointment_pk, { onDelete: 'cascade' })` |
| `service_fk`     | `integer`    | `notNull()`, `references(() => services.service_pk, { onDelete: 'cascade' })`         |
| `quantity`       | `integer`    | `notNull()`, `default(1)`                                                 |

Composite primary key on `(appointment_fk, service_fk)` using `primaryKey({ columns: [table.appointment_fk, table.service_fk] })`.

### `packages/db/src/schema/index.ts`

Barrel file — re-exports everything from all schema files above.

---

## Step 2 — Define Drizzle Relations (Optional but Recommended)

Create `packages/db/src/schema/relations.ts` to define Drizzle `relations()` for type-safe joins:

- `locations` → has many `users`, has many `appointments`
- `users` → belongs to `locations`, has many `appointments`
- `services` → has many `appointmentServices`
- `appointments` → belongs to `users`, belongs to `locations`, has many `appointmentServices`
- `appointmentServices` → belongs to `appointments`, belongs to `services`

---

## Step 3 — Database Connection Client

Create `packages/db/src/client.ts`:

1. Import `postgres` from the `postgres` package (postgres.js driver)
2. Import `drizzle` from `drizzle-orm/postgres-js`
3. Build the connection string from env vars: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}`
4. Export the `db` instance: `export const db = drizzle(client, { schema })`

---

## Step 4 — Update `packages/db/index.ts`

Replace the empty export with:

```ts
export * from './src/schema';
export * from './src/client';
```

This makes `@repo/db` the public API for the rest of the monorepo.

---

## Step 5 — Drizzle Kit Config

Create `packages/db/drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',           // migration output folder
  dbCredentials: {
    url: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`,
  },
});
```

---

## Step 6 — Add Scripts to `packages/db/package.json`

Add these scripts:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

- `db:generate` — generates SQL migration files from schema changes
- `db:migrate` — runs pending migrations against the database
- `db:push` — pushes schema directly to the DB (dev shortcut, skips migration files)
- `db:studio` — opens Drizzle Studio (GUI for browsing data)

---

## Step 7 — Push Schema to Database

1. Make sure Docker Compose is running: `docker compose up -d`
2. From `packages/db`, run: `bun run db:push`
3. Verify tables exist via pgAdmin at `http://localhost:5050` or `drizzle-kit studio`

---

## File Tree After Implementation

```
packages/db/
├── drizzle.config.ts          ← NEW
├── eslint.config.mjs
├── index.ts                   ← MODIFIED (re-exports)
├── package.json               ← MODIFIED (new scripts)
├── tsconfig.json
└── src/
    ├── client.ts              ← NEW
    └── schema/
        ├── index.ts           ← NEW (barrel)
        ├── locations.ts       ← NEW
        ├── users.ts           ← NEW
        ├── services.ts        ← NEW
        ├── availability.ts    ← NEW
        ├── appointments.ts    ← NEW
        ├── appointmentServices.ts  ← NEW
        └── relations.ts       ← NEW (optional)
```

---

## Notes

- The project uses **Bun** as the runtime (based on `@types/bun` in devDeps), so use `bun run` for scripts.
- The `postgres` package (postgres.js) is already installed — no need to add `pg` or `@neondatabase/serverless`.
- Password hashing for `user_password` should be handled at the application layer (backend), not in the schema.
- Soft deletes (`*_deleted_at` columns) are present on most tables — consider adding a Drizzle helper/filter for excluding soft-deleted rows in queries.
- The `DATABASE_URL` env var is not currently in `.env` — it will either need to be added, or the connection string can be built from the existing `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` vars.
