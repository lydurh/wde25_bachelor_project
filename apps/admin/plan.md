# Admin Panel Frontend — Scaffolding Plan

## Project Context

- **Monorepo**: Bun workspaces (`apps/*`, `packages/*`)
- **Runtime**: Bun
- **Backend**: Hono (port 3000)
- **Database**: PostgreSQL + Drizzle ORM
- **Shared packages**: `@repo/config` (eslint, prettier, typescript), `@repo/db`, `@repo/shared`
- **TypeScript**: Strict mode, JSX configured as `react-jsx`
- **Docker**: Backend runs via `docker-compose.yaml` using `oven/bun:1-alpine` base image

---

## Tech Stack

**Minimal React + Vite + TypeScript**:

- `react-jsx` is already configured in the shared tsconfig
- Vite has first-class Bun support
- Lightweight, fast dev server
- React Router for basic routing (added later if needed)
- Plain `fetch` for API calls — no extra data-fetching libraries

**Styling**: Tailwind CSS v4

---

## Scaffolding Steps

### 1. Initialize `package.json`

Create `apps/admin/package.json`:

- `"name": "admin"`
- Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`
- Dependencies: `react`, `react-dom`
- Dev dependencies: `@vitejs/plugin-react`, `vite`, `@repo/config`, `@types/react`, `@types/react-dom`

### 2. Configure Vite

Create `apps/admin/vite.config.ts`:

- React plugin
- Dev server port (e.g., 5173)
- Proxy `/api` requests to the backend at `http://backend:3000` (Docker service name) or `http://localhost:3000` (local dev)

### 3. Configure TypeScript

Create `apps/admin/tsconfig.json`:

- Extend `@repo/config/typescript/base.json`
- Add `"lib": ["ESNext", "DOM", "DOM.Iterable"]` (base only has ESNext)
- Add `"jsxImportSource": "react"` (compilerOptions)
- Add `"types": ["vite/client"]`
- Include `src`

### 4. Configure ESLint

Create `apps/admin/eslint.config.mjs`:

- Import and spread `baseConfig` from `@repo/config/eslint/base.mjs` (same pattern as backend)

### 5. Set Up Tailwind CSS v4

- Install `tailwindcss`, `@tailwindcss/vite`
- Add Tailwind Vite plugin to `vite.config.ts`
- Create `apps/admin/src/index.css` with `@import "tailwindcss";`

### 6. Create Entry Files

- `index.html`: Standard Vite HTML with `<div id="root">` and `<script type="module" src="/src/main.tsx">`
- `src/main.tsx`: `createRoot(document.getElementById('root')).render(<App />)`
- `src/app.tsx`: Simple `<h1>Admin Panel</h1>` placeholder

### 7. Create Dockerfile

Create `apps/admin/Dockerfile` (follows the same pattern as the backend Dockerfile):

```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app

COPY . .
RUN bun install

EXPOSE 3001
CMD ["bun", "run", "dev:admin"]
```

**Note**: Vite dev server must bind to `0.0.0.0` (not localhost) so it's accessible from outside the container. Add `--host` flag in the dev script or set `server.host: true` in `vite.config.ts`.

### 8. Update `docker-compose.yaml`

Add the admin service:

```yaml
  admin:
    container_name: admin
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - backend
    env_file:
      - .env
```

### 9. Update Root Monorepo Config

- Add `dev:admin` script to root `package.json`: `"dev:admin": "bun run --filter admin dev"`

### 10. Install Dependencies

Run `bun install` at the monorepo root to link everything.

---

## Optional / Future Enhancements (not part of initial scaffold)

- React Router for multi-page navigation
- TanStack Query for data fetching
- Authentication / auth guards
- Shared API client using Hono RPC types
- Form handling (React Hook Form)
- UI component library (shadcn/ui, Radix)
- Testing setup (Vitest + Testing Library)

---

## File Tree After Scaffolding

```
apps/admin/
├── Dockerfile
├── index.html
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── app.tsx
    └── index.css
```
