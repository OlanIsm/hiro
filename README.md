# Olan's Jira

Olan's Jira is a private, single-user, local-first internship tracker desktop web application with a 4-stage Kanban workflow: **Applied**, **Test**, **Interview**, and **Next Step**.

---

## Tech Stack

- **Monorepo**: npm workspaces (`apps/web`, `apps/server`)
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database & ORM**: SQLite, Prisma
- **Linting & Testing**: oxlint, TypeScript type checks (`tsc --noEmit`), Vitest + Supertest

---

## Prerequisites

- **Node.js**: v18+ (tested on Node v24+)
- **npm**: v9+ (tested on npm v11+)

---

## Getting Started

### 1. Install Dependencies

Install all dependencies across the monorepo from the root directory:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and adjust if necessary:

```bash
cp .env.example .env
```

Default variables:
- `PORT`: `4000`
- `HOST`: `127.0.0.1`
- `DATABASE_URL`: `"file:./dev.db"`
- `CLIENT_ORIGIN`: `"http://localhost:5173"`

### 3. Generate Prisma Client & Migrate

Generate the Prisma Client and run migrations for SQLite:

```bash
npm run --workspace=apps/server prisma:generate
npm run --workspace=apps/server prisma:migrate
```

---

## 🚀 Local Launcher (Production Mode)

To start Olan's Jira as a self-contained local desktop web app:

```bash
npm start
```
or:
```bash
node scripts/launcher.mjs
```

### Windows Shell Alias / Command (`olan's jira`)

To invoke Olan's Jira directly using the command name `olan's jira` in PowerShell:

1. Open your PowerShell profile:
   ```powershell
   notepad $PROFILE
   ```
2. Add the following function:
   ```powershell
   function global:olan's` jira {
       & "C:\Users\pilia\orca\workspaces\hiro\leatherjacket\scripts\olans-jira.ps1"
   }
   # Or alternatively without spaces/quotes:
   Set-Alias olans-jira "C:\Users\pilia\orca\workspaces\hiro\leatherjacket\scripts\olans-jira.cmd"
   ```
3. Save and reload (`. $PROFILE`). Now running `olan's jira` or `olans-jira` will launch the app!

### Launcher Features & Safety:
- **Duplicate Prevention**: If the server is already active on port `4000`, the launcher will not start a second process; it simply opens the existing instance in your default browser.
- **Loopback Binding**: Strictly bound to `127.0.0.1` by default (not exposed to the local network).
- **Graceful Shutdown**: Pressing `Ctrl + C` in the launcher terminal gracefully stops the background server process.

---

## Development Mode

Run backend and frontend concurrently in development with HMR:

```bash
npm run dev
```

Or run them individually in separate terminal sessions:

- **Backend** (Express API on `http://127.0.0.1:4000`):
  ```bash
  npm run dev:server
  ```
- **Frontend** (Vite Dev Server on `http://localhost:5173`):
  ```bash
  npm run dev:web
  ```

---

## Available Scripts

From the repository root:

- `npm start` - Launch the production application and open the browser.
- `npm run dev` - Run frontend and backend concurrently in dev mode.
- `npm run build` - Build both backend and frontend for production.
- `npm test` - Run automated test suite (Vitest + Supertest).
- `npm run typecheck` - Run TypeScript compiler checks on both `apps/web` and `apps/server`.
- `npm run lint` - Run linter (`oxlint`).

---

## Architecture Boundaries & Security

- **Local-First & Single-User**: Bound to `127.0.0.1` by default.
- **Backend Data Ownership**: Frontend communicates exclusively via backend REST API. Direct database access from the client is prohibited.
- **Zero Secrets Committed**: All secret configurations and `.env` files are ignored by git.
