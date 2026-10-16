# Hiro (Olan's Jira)

Hiro is a private, single-user, local-first internship application tracker desktop web app built with a focused 4-stage Kanban workflow: **Applied**, **Test**, **Interview**, and **Next Step**.

Like Omniroute, Hiro is designed with **zero-setup convenience**: install once, type `hiro` from any terminal, and your board opens instantly in your default browser without manual database setup, port configuration, or `.env` files.

---

## ⚡ Zero-Config Quick Start (Recommended)

### 1. Installation

You can install and link Hiro globally on your machine:

```bash
# Clone the repository
git clone https://github.com/OlanIsm/hiro.git
cd hiro

# Install dependencies and link the global CLI binary
npm install
npm link
```

### 2. Launch Anywhere

Open any terminal (PowerShell, CMD, Bash, or Zsh) and run:

```bash
hiro
```

**What happens automatically:**
1. **Zero-Setup Database**: Auto-provisions SQLite database at `~/.hiro/hiro.db` and deploys Prisma migrations silently.
2. **Zero-Config Secrets**: Generates and persists cryptographically secure session secrets in `~/.hiro/config.json`.
3. **Instant Browser Access**: Automatically launches your default browser at `http://127.0.0.1:29200`.
4. **Process Guard**: If Hiro is already running, typing `hiro` brings up your existing tab without starting duplicate servers.
5. **Graceful Exit**: Press `Ctrl + C` in the terminal to stop the server cleanly.

---

## 📁 Where is My Data Stored?

All personal data, settings, and credentials are kept strictly local on your machine:

- **Database**: `~/.hiro/hiro.db` (SQLite database containing all applications, history, and notes)
- **Configuration**: `~/.hiro/config.json` (Local port, host, and encrypted session keys)

> [!NOTE]
> Storing your data in your user home directory (`~/.hiro`) ensures that your application records survive code updates, branch switches, or package reinstalls.

---

## 🛠️ Development Mode (For Contributors)

If you are developing or customizing Hiro:

### 1. Environment Setup

```bash
cp .env.example .env
```

Default variables:
- `PORT`: `29200`
- `HOST`: `127.0.0.1`
- `DATABASE_URL`: `"file:./dev.db"`
- `CLIENT_ORIGIN`: `"http://localhost:5173"`

### 2. Run Database Migrations for Dev

```bash
npm run --workspace=apps/server prisma:generate
npm run --workspace=apps/server prisma:migrate
```

### 3. Start Development Server with HMR

Run backend (Express) and frontend (Vite) concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:29200`

### 4. Available Scripts

From the repository root:

- `npm run verify` — Full QA check: linter (`oxlint`), TypeScript type checks, test suite, and production build.
- `npm run dev` — Run frontend and backend concurrently in dev mode with hot module reloading.
- `npm run build` — Build both client and server production distributions.
- `npm test` — Run the automated test suite (Vitest + Supertest).
- `npm run typecheck` — Run TypeScript type checking on both `apps/web` and `apps/server`.
- `npm run lint` — Run `oxlint` on frontend codebase.
- `npm start` or `hiro` — Start the production desktop web app.

---

## ✨ Key Features

- **4-Stage Kanban Board**: Ordered flow: *Applied* → *Test* → *Interview* → *Next Step* with drag-and-drop powered by `@dnd-kit`.
- **Neumorphic & Desktop-First UI**: Soft lighting, tactile card interactions, and Nunito Sans typography.
- **Audit History**: Every stage transition records timestamps and trigger sources (`MANUAL` or `GMAIL`).
- **Smart Gmail Sync**: Optional read-only recruitment email synchronization that extracts assessment tests and interview invites into reviewable suggestions. Ambiguous emails are never updated silently.
- **Local Authentication**: Single-user password protection with bcrypt/argon2 hashing, rate-limiting, and server-side sessions.
- **Instant Data Export**: Download your records anytime in RFC 4180 CSV or structured JSON format.

---

## 💾 Database Backup & Restore

### 1. Manual Backup

**PowerShell (Windows):**
```powershell
Copy-Item "$HOME\.hiro\hiro.db" "$HOME\.hiro\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').db"
```

**Bash (Linux / macOS):**
```bash
cp ~/.hiro/hiro.db ~/.hiro/backup-$(date +%Y%m%d-%H%M%S).db
```

### 2. Restoring from a Backup

1. Stop Hiro (`Ctrl + C` in terminal).
2. Overwrite `~/.hiro/hiro.db` with your backup copy:
   ```powershell
   Copy-Item "$HOME\.hiro\backup-YYYYMMDD-HHMMSS.db" "$HOME\.hiro\hiro.db"
   ```
3. Run `hiro` again.

---

## 📤 Data Export (CSV & JSON)

Hiro provides instant data portability:
- **From UI**: Click **Export CSV** in the collapsible sidebar.
- **Via API**:
  - `GET /api/internships/export?format=csv` — Downloads RFC 4180 compliant CSV file.
  - `GET /api/internships/export?format=json` — Downloads full JSON array with parsed tech stacks and history.

---

## 📬 Gmail Integration (Optional)

Hiro includes an intelligent, privacy-first Gmail synchronization engine to automatically detect recruitment stages:

### 1. Google Cloud Setup
1. Create a Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable the **Gmail API**.
3. Configure OAuth Consent Screen and create an **OAuth 2.0 Web Client ID**:
   - Authorized redirect URI: `http://127.0.0.1:29200/api/gmail/callback`
4. Configure credentials in `.env` (or in `~/.hiro/config.json`):
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REDIRECT_URI="http://127.0.0.1:29200/api/gmail/callback"
   ```

### 2. Privacy & Security Safeguards
- **Narrowest Scope**: Requests only `https://www.googleapis.com/auth/gmail.readonly`.
- **Encrypted at Rest**: Refresh tokens are encrypted with `AES-256-GCM` using `scryptSync` derived keys and stored strictly server-side.
- **No Silent Updates**: Ambiguous matches or confidence < 65% are flagged for manual review. Applications will never change status silently.
- **Audit History**: Applying a recommendation updates the Kanban card and writes a `StatusHistory` record with `source: GMAIL`.
- **Sandbox Simulation**: Test recruitment detection anytime using the "Simulate Test Email Match" button in the Gmail modal without live Google credentials.

---

## 🛠️ Troubleshooting

- **Port 29200 already in use**: The launcher checks `http://127.0.0.1:29200/api/health` before starting. If an orphaned Node process is holding the port, terminate it in PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 29200).OwningProcess -Force
  ```
- **Login loop / Session issues**: In production local mode, session cookies run over `http://127.0.0.1`. The server automatically uses non-secure cookies on loopback HTTP so your browser accepts and persists sessions.
- **Reset Master Password / Clean DB**: If you forget your password and want a fresh start, delete the local database file:
  ```powershell
  Remove-Item "$HOME\.hiro\hiro.db"
  ```
  The next time you type `hiro`, it will prompt for a fresh first-run password setup.
