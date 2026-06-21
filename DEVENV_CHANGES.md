# Dev Env Changes — Docker, CI/CD & Security

Hardening of the containerization + GitHub Actions pipeline for the Bun monorepo
(Hono backend, Vite/React frontend, Drizzle/Postgres), deployed via **Dokploy pulling
prebuilt `ghcr.io` images**. Because Dokploy runs the image CD pushes, the ghcr build
**is** the prod artifact — anything missing at build time is missing in prod.

> Scope kept intentionally lean for this stage: Docker hardening, CI/CD improvements, and
> one real dependency security fix. Several broader ideas were considered and left out on
> purpose (see "Deliberately left out").

---

## ⚠️ TL;DR — what YOU must still do (not in code)

1. **GitHub Actions secret `VITE_GOOGLE_MAPS_API_KEY`** — Settings → Secrets and
   variables → Actions. CD passes it as a Docker build-arg; if absent the arg is empty →
   the key never inlines into the frontend bundle → **prod maps / location autocomplete
   dead.**
2. **Restrict the Maps key in Google Cloud Console** (browser key): Application
   restrictions → **Websites** → `https://yourdomain.com/*`; API restrictions → only
   *Maps JavaScript API* + *Places API (New)*. It ships in the public client bundle, so
   public-but-restricted is the correct posture.
3. **Dokploy backend service env** — the live DB already works, so `POSTGRES_*` are set.
   Just keep the server-side `GOOGLE_MAPS_API_KEY` (separate, IP-restricted key) and
   `CORS_ORIGIN` = the real frontend domain set there.

---

## What's being committed (by area)

### Docker — Bun pin + prod hardening
- **Pinned Bun** in all 4 Dockerfiles: `oven/bun:1-alpine` → `oven/bun:1.3.13-alpine`
  (matches the CI-pinned Bun). Stops silent drift to an untested runtime.
- **Layer caching** in both prod Dockerfiles: copy workspace `package.json`s + `bun.lock`
  first → `bun install --frozen-lockfile` → *then* `COPY . .`. Docker now skips the whole
  install layer unless a manifest/lockfile changes (source edits no longer trigger a
  reinstall). All workspace manifests are copied because `--frozen-lockfile` validates the
  single shared lockfile.
- **Backend prod** (`apps/backend/Dockerfile.prod`): non-root `USER bun` + a `HEALTHCHECK`
  that pings the server on `$PORT`. Kept single-stage — runtime needs `drizzle-kit` for
  migrate-on-start, so multi-stage wouldn't shrink the costly `node_modules`.
- **Frontend prod** (`apps/frontend/Dockerfile.prod`): `ARG`/`ENV VITE_GOOGLE_MAPS_API_KEY`
  (placed after install so the cached install layer stays warm) — fed by the CD build-arg.

### CI/CD (`.github/workflows/`)
- **Bun cache key fixed** (`actions/bun-setup`): `bun.lockb` → `bun.lock` (old glob matched
  nothing → cache never hit).
- **GHA build cache + buildx** in both CI and CD docker steps (`cache-from/to: type=gha`,
  per-app scope) so builds share layers across runs.
- **Frontend Maps build-arg** (`cd.yaml`): passed frontend-only via a matrix conditional.
  CI does **not** pass it — the CI image is build-validate-only and discarded, so it needs
  no prod secret.
- **Build-once / scan-what-you-ship**: CI `docker` job is **PR-only** (build-validate, no
  push) so main doesn't rebuild redundantly; CD tags the build `id: build` and scans the
  **pushed image by digest** — the scanned image is the deployed image.
- **Security checks (report-only, lean)**: `audit` job runs `bun audit --audit-level=high`
  (dependency CVEs); CD runs `trivy image` on the pushed prod image (base-OS CVEs). Both
  `continue-on-error` + `exit-code: '0'` → findings print to the job log without failing
  the pipeline. No Dockerfile-misconfig scan, no step-summary/artifact ceremony, no
  duplicate PR-time image scan.
- Fixed `trivy-action` tag `@0.28.0` → `@v0.36.0`.

### Dependency security
- **hono** bumped `^4.12.17` → `^4.12.26` in both apps (patches a HIGH CORS advisory in the
  direct dependency), plus a root **`overrides: { "hono": "4.12.26" }`** collapsing the
  duplicate `hono@4.12.17` pulled by `@hono/zod-validator`. Audit highs: 4 → 3.

### Local tooling
- `package.json` `security:*` scripts — `security:deps` (`bun audit`), `security:config`
  (trivy Dockerfile scan), `security:image:backend`/`:frontend` (trivy image scan), and
  `security` to run all.

---

## Proposed commit grouping (conventional commits)
1. `build(docker): pin Bun to 1.3.13 and harden prod images with layer caching, non-root user and healthcheck`
   — the 4 Dockerfiles
2. `ci(pipeline): add gha build cache, fix the bun cache key, and validate prod images on PRs only`
   — `bun-setup` + pipeline hunks of `ci.yml`/`cd.yaml`
3. `ci(security): add report-only bun audit and trivy image scan`
   — security hunks of `ci.yml`/`cd.yaml`
4. `fix(deps): bump hono to 4.12.26 and pin via overrides to patch the CORS advisory`
   — app `package.json`s, `overrides` hunk of root `package.json`, `bun.lock`
5. `chore(tooling): add local security scan scripts`
   — `security:*` hunk of `package.json`
6. `docs(devenv): document the dev-env, CI/CD and security changes`
   — this file

---

## Security posture & audit triage

**Static review of injection sinks** (raw SQL, XSS, command-exec): none found —
Drizzle parameterizes all queries, React auto-escapes, no `child_process`/`eval` usage.

**Dependency audit — 3 remaining HIGH, all not-actionable:**
- **nodemailer ×2** — advisory range `<=7.0.10`; no patched release exists yet. Used only
  as a dev/test mock transporter; real mail goes via Resend.
- **vite ×1** — `server.fs.deny` bypass, Windows-only, and vite is a build-time tool not
  shipped to the Linux prod image → not applicable.

**Why report-only (and why it's correct):** of the original 4 highs one was fixed (hono);
the rest are unfixable-upstream or platform-inapplicable, and `bun audit` has no
suppression/allowlist mechanism — so a *blocking* gate would be permanently red with no
remedy. Report-only surfaces everything without blocking development.

---

## Known CI warnings (harmless, left as-is)
- **"Node.js 20 deprecated"** on `docker/build-push-action@v6` / `docker/login-action@v3`
  — upstream actions still ship a Node-20 entrypoint; GitHub forces Node 24 and warns.
  Latest tags already; clears when Docker republishes.
- **`SecretsUsedInArgOrEnv`** on the frontend `VITE_GOOGLE_MAPS_API_KEY` ARG/ENV — generic
  buildkit lint; the Maps key is a public browser key that must be inlined, so expected.

---

## Deliberately left out (with reasons — defense-ready)
- **CI `drizzle-kit push` → `migrate` drift guard** — DB is frozen and the site is live; a
  drift guard buys nothing now (reverted to `push`).
- **DB connection helper (DATABASE_URL / port / SSL)** — the live DB already works on
  `localhost:5432`; kept the diff smaller (reverted).
- **nodemailer / vite bumps** — no fix available / not applicable + breaking.
- **Blocking dependency-audit gate** — see report-only rationale.
- **GitHub Deployments/Environments + Dokploy status polling** — a deployment record would
  only mean "Dokploy accepted the webhook," not "app healthy"; honest status needs polling
  Dokploy's API (future work).
- **Maps Path B (backend-proxied Places, key never in the browser)** — a real rewrite;
  restricting the browser key (Path A) is the standard choice.
- **`turbo prune` for slim per-app images** — would shrink the single-stage backend image,
  but adds Turborepo; unnecessary at this scale.

---

## Verification run locally
- Both prod images build cleanly; frontend Maps key inlines when the build-arg is passed;
  backend runs as `uid=1000(bun)`.
- backend + frontend + `@repo/db` typecheck pass (incl. after the hono override).
- trivy + bun audit run via the `security:*` scripts.

## Files touched (final)
```
.github/actions/bun-setup/action.yml   cache key bun.lockb -> bun.lock
.github/workflows/ci.yml               bun-audit job, gha cache, PR-only build-validate
.github/workflows/cd.yaml              gha cache, Maps build-arg, trivy scan pushed image by digest
apps/backend/Dockerfile                bun pin 1.3.13
apps/frontend/Dockerfile               bun pin 1.3.13
apps/backend/Dockerfile.prod           bun pin, layer cache, non-root USER, healthcheck
apps/frontend/Dockerfile.prod          bun pin, layer cache, Maps ARG/ENV
apps/backend/package.json              hono ^4.12.26
apps/frontend/package.json             hono ^4.12.26
package.json                           hono override, security:* scripts
bun.lock                               hono dedupe / override
DEVENV_CHANGES.md                      this file
```
