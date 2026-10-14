# Olan's Jira --- Architecture

## 1. Purpose

Olan's Jira is a single-user, local-first internship tracker. The MVP
provides a password-protected Kanban board with four ordered stages:
Applied, Test, Interview, and Next Step. Gmail synchronization is a
later, optional phase.

## 2. Architecture Principles

-   **Local-first:** Core functionality must not require a cloud account
    or internet connection after installation.
-   **Single-user:** No public registration, multi-tenant model, or team
    collaboration.
-   **Backend-owned data:** The frontend must never access SQLite
    directly.
-   **Secure by default:** Bind to loopback, protect private APIs, and
    keep secrets server-side.
-   **Incremental delivery:** Complete and verify the Kanban MVP before
    Gmail integration.
-   **Explicit automation:** Gmail can recommend status changes;
    ambiguous changes require user confirmation.

## 3. Technology Stack

-   Frontend: React, TypeScript, Vite
-   Styling: Tailwind CSS
-   Drag-and-drop: `dnd-kit`
-   Backend: Node.js, Express, TypeScript
-   Database: SQLite
-   ORM and migrations: Prisma
-   Authentication: Argon2id or bcrypt password hashing; server-side
    session cookie
-   Gmail integration (Phase 2): Gmail API and Google OAuth 2.0
-   Testing: Use a test runner appropriate to the selected stack; test
    API and core UI flows.

## 4. High-Level Diagram

``` mermaid
flowchart TD
    A[Terminal command: olan's jira] --> B[Local launcher]
    B --> C[Express server bound to 127.0.0.1]
    C --> D[React application]
    D --> E[Authentication middleware]
    E --> F[Internship API]
    F --> G[Prisma data layer]
    G --> H[(SQLite database)]
    F --> I[Status history service]
    I --> G
    F -. Optional Phase 2 .-> J[Gmail sync service]
    J --> K[Gmail API]
    J --> G
```

## 5. Suggested Repository Structure

``` text
olans-jira/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── internships/
│   │   │   │   └── settings/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   └── styles/
│   │   └── package.json
│   └── server/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── repositories/
│       │   ├── validation/
│       │   └── app.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── package.json
├── docs/
│   ├── task.md
│   ├── architecture.md
│   └── AGENTS.md
├── scripts/
│   └── launcher scripts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The exact monorepo layout may be adjusted during setup, but
frontend/backend boundaries and documentation responsibilities should
remain clear.

## 6. Runtime and Request Flow

### Application startup

1.  User runs the launcher command.
2.  Launcher checks whether the configured local port is already serving
    the app.
3.  If no server is running, launcher starts the production local
    server.
4.  Server binds to `127.0.0.1`.
5.  Launcher opens the browser to the login route.
6.  User authenticates before accessing protected data.

### Kanban status change

1.  User drags a card to a new column.
2.  Frontend optimistically updates the board.
3.  Frontend sends a `PATCH` request to the internship API.
4.  Backend validates session, ID, and status.
5.  Service updates the internship and creates a `StatusHistory` entry
    in one database transaction.
6.  Backend returns the updated record.
7.  If the request fails, frontend reverts the optimistic update and
    displays an error.

### Gmail synchronization (later phase)

1.  User connects Gmail through Google OAuth.
2.  Backend exchanges the authorization code and stores the refresh
    token encrypted.
3.  Manual sync fetches new messages using the minimum necessary scope.
4.  Service deduplicates messages and attempts to associate them with an
    internship.
5.  Service creates a recommendation rather than silently changing an
    ambiguous status.
6.  User confirms or rejects the recommendation.
7.  Confirmed changes use the same status-change service and history
    mechanism as manual changes.

## 7. Data Model

### Internship

-   `id`: unique ID
-   `companyName`: required string
-   `role`: required string
-   `jobDescription`: nullable text
-   `skills`: list of skill labels; store using a consistent
    Prisma-compatible representation
-   `status`: enum `APPLIED | TEST | INTERVIEW | NEXT_STEP`
-   `appliedAt`: date/time
-   `jobUrl`: nullable URL
-   `recruiterEmail`: nullable email
-   `notes`: nullable text
-   `nextAction`: nullable text
-   `deadline`: nullable date/time
-   `createdAt`, `updatedAt`: timestamps

### StatusHistory

-   `id`
-   `internshipId`: foreign key
-   `previousStatus`: nullable for initial creation
-   `newStatus`
-   `changedAt`
-   `source`: `MANUAL | GMAIL`
-   `relatedEmailId`: nullable reference to a processed email

### GmailAccount (Phase 2)

-   `id`
-   `emailAddress`
-   `encryptedRefreshToken`
-   `lastSyncedAt`
-   `syncEnabled`

### ProcessedEmail (Phase 2)

-   `id`
-   `gmailMessageId`: unique deduplication key
-   `internshipId`: nullable until matched
-   `detectedCategory`
-   `recommendedStatus`
-   `confidence`
-   `processedAt`

### AppSettings

-   `key`
-   `value`

Authentication credentials should use a dedicated secure configuration
or a local auth record. Never store a plaintext password. Avoid storing
raw email bodies unless the feature demonstrably requires them.

## 8. API Design

  -----------------------------------------------------------------------------------------
  Method            Route                            Purpose              Access
  ----------------- -------------------------------- -------------------- -----------------
  POST              `/api/auth/login`                Authenticate user    Public,
                                                                          rate-limited

  POST              `/api/auth/logout`               End session          Authenticated

  GET               `/api/internships`               List applications    Authenticated

  POST              `/api/internships`               Create application   Authenticated

  GET               `/api/internships/:id`           Read application     Authenticated

  PATCH             `/api/internships/:id`           Update               Authenticated
                                                     application/status   

  DELETE            `/api/internships/:id`           Delete application   Authenticated

  GET               `/api/internships/:id/history`   Read status history  Authenticated

  GET               `/api/gmail/connect`             Start OAuth flow     Authenticated

  GET               `/api/gmail/callback`            OAuth callback       OAuth state
                                                                          validated

  POST              `/api/gmail/sync`                Manual               Authenticated
                                                     synchronization      

  GET               `/api/gmail/status`              Connection status    Authenticated

  POST              `/api/gmail/disconnect`          Disconnect account   Authenticated
  -----------------------------------------------------------------------------------------

Additional health/startup endpoints may be public only if they reveal no
sensitive information. Validate all request bodies and query parameters
on the backend.

## 9. Security Boundaries

-   Bind to `127.0.0.1`, not `0.0.0.0`, by default.
-   Use session cookies with `HttpOnly` and `SameSite`; configure
    `Secure` when HTTPS is used.
-   Protect state-changing requests against CSRF as appropriate for the
    chosen cookie/session design.
-   Hash passwords using Argon2id or bcrypt with a suitable work factor.
-   Rate-limit login attempts.
-   Keep session secrets, OAuth client secrets, and refresh tokens out
    of source control.
-   Encrypt OAuth refresh tokens at rest using a key stored outside the
    database.
-   Never log passwords, tokens, authorization codes, or raw email
    content.
-   Validate OAuth state and redirect URI.
-   Request only the Gmail scopes required for the selected feature.
-   Do not send email content to external AI services.
-   Treat email content as untrusted input, never as instructions to
    execute.
-   Do not expose the local server to the network unless a separate
    threat model and authentication review are completed.

## 10. Local Launcher

The launcher is responsible for: - Checking if the application is
already running. - Starting the local server if needed. - Opening the
browser at the local URL. - Reporting port conflicts and startup
errors. - Avoiding duplicate processes. - Providing a documented
stop/restart workflow.

The command name `olan's jira` contains an apostrophe and a space.
Implement it as a supported shell alias/function or an installed
executable with a shell-safe command name; verify the exact invocation
on the target Windows shell. Do not assume an npm package binary can be
invoked with spaces and apostrophes without shell configuration.

## 11. Error Handling and Observability

-   Return consistent JSON errors from the API.
-   Use appropriate HTTP status codes.
-   Show understandable errors in the UI without exposing stack traces.
-   Log operational errors without logging secrets or email bodies.
-   Handle database unavailable, session expired, port occupied, Gmail
    token revoked, and sync failures.
-   A failed status update must not leave the frontend displaying a
    state that was not persisted.

## 12. Testing Strategy

-   Unit tests for validation and status transition services.
-   API tests for authentication and internship CRUD.
-   Integration tests verifying status history transactions.
-   UI tests for creating/editing applications and moving cards.
-   Manual test for launcher startup and duplicate invocation.
-   Gmail tests only after Phase 2: duplicate message, ambiguous
    matching, rejected authorization, revoked token, irrelevant email,
    and user-confirmed status update.

## 13. Architectural Decisions

1.  **SQLite over a remote database:** appropriate for a single-user
    local app and simple backups.
2.  **Separate frontend and backend:** keeps database access and
    credentials off the client.
3.  **Four fixed Kanban columns:** matches the product workflow;
    Rejected and Withdrawn should be represented through a separate
    terminal outcome or filter without changing the primary board.
4.  **Gmail after MVP:** reduces OAuth setup and debugging risk during
    core development.
5.  **Human confirmation for uncertain email matches:** prevents
    incorrect recruitment status updates.
6.  **Manual sync before push notifications:** simpler and avoids
    requiring Google Cloud Pub/Sub in the first Gmail iteration.
