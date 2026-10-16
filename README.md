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
- `PORT`: `29200`
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

## ⚡ Zero-Config Quick Start (Global `hiro` Command)

Run Hiro instantly with zero manual setup. Database, migrations, secrets, and builds are provisioned automatically in `~/.hiro`:

```bash
# Link binary once (or install globally)
npm link

# Launch anywhere, anytime
hiro
```

- **Zero-Setup Database**: Auto-provisions SQLite database at `~/.hiro/hiro.db` and deploys Prisma migrations automatically.
- **Zero-Config Secrets**: Auto-generates and persists cryptographically random secrets in `~/.hiro/config.json`.
- **Instant Browser Access**: Automatically launches your default browser at `http://127.0.0.1:29200`.
- **Process Guard**: If Hiro is already active, typing `hiro` opens the existing tab instead of creating duplicate processes.

---

## 🚀 Local Launcher (Production Mode)

To start Olan's Jira as a self-contained local desktop web app:

```bash
npm start
# or:
hiro
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
- **Duplicate Prevention**: If the server is already active on port `29200`, the launcher will not start a second process; it simply opens the existing instance in your default browser.
- **Loopback Binding**: Strictly bound to `127.0.0.1` by default (not exposed to the local network).
- **Graceful Shutdown**: Pressing `Ctrl + C` in the launcher terminal gracefully stops the background server process.

---

## Development Mode

Run backend and frontend concurrently in development with HMR:

```bash
npm run dev
```

Or run them individually in separate terminal sessions:

- **Backend** (Express API on `http://127.0.0.1:29200`):
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

- `npm run verify` - Complete QA verification: lint, typecheck, test suite, and build.
- `npm start` - Launch the production application and open the browser.
- `npm run dev` - Run frontend and backend concurrently in dev mode.
- `npm run build` - Build both backend and frontend for production.
- `npm test` - Run automated test suite (Vitest + Supertest).
- `npm run typecheck` - Run TypeScript compiler checks on both `apps/web` and `apps/server`.
- `npm run lint` - Run linter (`oxlint`).

---

## 💾 Database Backup & Restore

Hiro stores all application data in a local SQLite database (`apps/server/prisma/dev.db`).

### 1. Manual Backup
To create a safe snapshot of your data:

**PowerShell (Windows):**
```powershell
Copy-Item apps/server/prisma/dev.db "apps/server/prisma/backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').db"
```

**Bash (Linux / macOS):**
```bash
cp apps/server/prisma/dev.db apps/server/prisma/backup-$(date +%Y%m%d-%H%M%S).db
```

### 2. Restoring from a Backup
1. Stop the application server (`Ctrl + C`).
2. Replace `apps/server/prisma/dev.db` with your backup copy:
   ```powershell
   Copy-Item apps/server/prisma/backup-YYYYMMDD-HHMMSS.db apps/server/prisma/dev.db
   ```
3. Restart the application (`npm start` or `npm run dev`).

---

## 📤 Data Export (CSV & JSON)

Hiro provides instant data export directly from the UI or via API:
- **From UI**: Click **Export CSV** in the collapsible sidebar.
- **Via API**:
  - `GET /api/internships/export?format=csv` — Downloads RFC 4180 compliant CSV file.
  - `GET /api/internships/export?format=json` — Downloads full JSON array with parsed tech stacks and history.

---

## 📬 Gmail Integration (Phase 7)

Hiro includes an intelligent, privacy-first Gmail synchronization engine to automatically detect recruitment stages (Online Assessments, Interview Invites, Offer Letters):

### 1. Google Cloud Setup
1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable the **Gmail API**.
3. Configure the OAuth Consent Screen and create an **OAuth 2.0 Web Client ID**:
   - Authorized redirect URI: `http://127.0.0.1:29200/api/gmail/callback`
4. Add the credentials to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://127.0.0.1:29200/api/gmail/callback"
   GMAIL_TOKEN_ENCRYPTION_KEY="your-32-byte-hex-encryption-key" # Optional, defaults to hashed SESSION_SECRET
   ```

### 2. Privacy & Security Safeguards
- **Narrowest Scope**: Only requests `https://www.googleapis.com/auth/gmail.readonly`.
- **Encrypted at Rest**: Refresh tokens are encrypted with `AES-256-GCM` using `scryptSync` derived keys and stored strictly server-side.
- **No Silent Updates**: Ambiguous matches or confidence < 65% are flagged for human review. Applications will never silently change status without user verification.
- **Audit History**: Applying a recommendation atomically updates the Kanban card and writes a `StatusHistory` record with `source: GMAIL` and the associated email ID.
- **Offline / Sandbox Simulation**: You can test recruitment detection at any time using the "Simulate Test Email Match" button in the Gmail modal without live Google credentials.

---

## 🛠️ Troubleshooting

- **Port 29200 already in use**: The launcher checks `http://127.0.0.1:29200/api/health` before starting to avoid duplicate processes. If a stale node process is holding port 29200, you can terminate it in PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 29200).OwningProcess -Force
  ```
- **Session invalid or expired**: If your session cookie expires, the application automatically redirects to the password unlock screen.
- **Clean Database Reset**: To completely reinitialize the database (will delete all existing records):
  ```bash
  npx prisma migrate reset --schema=apps/server/prisma/schema.prisma
  ```

---

## Architecture Boundaries & Security

- **Local-First & Single-User**: Bound to `127.0.0.1` by default.
- **Backend Data Ownership**: Frontend communicates exclusively via backend REST API. Direct database access from the client is prohibited.
- **Zero Secrets Committed**: All secret configurations and `.env` files are ignored by git.
