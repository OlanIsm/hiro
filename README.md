# Olan's Jira

Olan's Jira is a private, single-user, local-first internship tracker desktop web application with a 4-stage Kanban workflow: **Applied**, **Test**, **Interview**, and **Next Step**.

---

## Tech Stack

- **Monorepo**: npm workspaces (`apps/web`, `apps/server`)
- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database & ORM**: SQLite, Prisma
- **Linting**: oxlint, TypeScript type checks (`tsc --noEmit`)

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

### 3. Generate Prisma Client

Generate the Prisma Client for SQLite:

```bash
npm run --workspace=apps/server prisma:generate
```

### 4. Running the Development Servers

Run both backend and frontend concurrently:

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

- `npm run dev` - Run frontend and backend concurrently.
- `npm run dev:server` - Run backend dev server with hot reload (`tsx watch`).
- `npm run dev:web` - Run frontend dev server (`vite`).
- `npm run build` - Build both backend and frontend for production.
- `npm run typecheck` - Run TypeScript compiler checks on both `apps/web` and `apps/server`.
- `npm run lint` - Run linter (`oxlint`).

---

## Architecture Boundaries & Security

- **Local-First & Single-User**: Bound to `127.0.0.1` by default.
- **Backend Data Ownership**: Frontend communicates exclusively via backend REST API. Direct database access from the client is prohibited.
- **Zero Secrets Committed**: All secret configurations and `.env` files are ignored by git.
