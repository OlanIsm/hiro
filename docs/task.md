# Olan's Jira --- Task Plan

## Project Rules

-   Build the MVP before Gmail integration.
-   Keep the application local-first and single-user.
-   Use React + TypeScript + Vite, Express + TypeScript, SQLite, and
    Prisma.
-   Do not add features outside this task plan without updating the PRD.
-   Mark a task complete only after implementation and relevant
    verification.

## Phase 0 --- Project Setup

-   [x] Create repository structure for frontend and backend.
-   [x] Configure TypeScript, linting, formatting, and environment
    configuration.
-   [x] Set up React + Vite frontend.
-   [x] Set up Express + TypeScript backend.
-   [x] Configure Prisma with SQLite.
-   [x] Add root development scripts to run frontend and backend
    together.
-   [x] Add `.env.example` containing placeholders only; never commit
    secrets.
-   [x] Add README with development setup and run instructions.

**Acceptance criteria** - Frontend and backend start locally using
documented commands. - TypeScript checks pass. - No secrets or local
database files are committed.

## Phase 1 --- Database and API Foundation

-   [x] Define Prisma models for `Internship`, `StatusHistory`,
    `GmailAccount`, `ProcessedEmail`, and `AppSettings`.
-   [x] Define internship statuses: `APPLIED`, `TEST`, `INTERVIEW`,
    `NEXT_STEP`.
-   [x] Add migrations and seed/setup instructions.
-   [x] Implement centralized request validation and error handling.
-   [x] Implement health endpoint for local startup checks.
-   [x] Implement internship list endpoint.
-   [x] Implement create internship endpoint.
-   [x] Implement get internship detail endpoint.
-   [x] Implement update internship endpoint.
-   [x] Implement delete internship endpoint.
-   [x] Implement status history endpoint.
-   [x] Record status history whenever an internship status changes.
-   [x] Validate that IDs exist and reject malformed inputs.

**Acceptance criteria** - CRUD operations persist to SQLite. -
Restarting the backend does not remove records. - Status changes create
a history entry. - Invalid input returns a clear 4xx response.

## Phase 2 --- Local Authentication

-   [x] Implement first-run password setup flow or documented secure
    initialization.
-   [x] Hash password using Argon2id or bcrypt.
-   [x] Implement login and logout endpoints.
-   [x] Use server-side sessions with `HttpOnly` and `SameSite` cookies.
-   [x] Set `Secure` cookies when running behind HTTPS; localhost HTTP
    development must remain usable.
-   [x] Protect all private API endpoints with authentication
    middleware.
-   [x] Add login rate limiting and generic authentication error
    messages.
-   [x] Add frontend login screen and logout action.
-   [x] Add tests for unauthenticated access and invalid passwords.

**Acceptance criteria** - Private API routes reject requests without a
valid session. - Passwords are never stored as plaintext. - Login state
survives page navigation but logout invalidates the session. - Password
and session secrets are not committed to source control.

## Phase 3 --- Kanban Dashboard

-   [x] Build desktop-first application shell and top navigation.
-   [x] Build summary metrics for total, active, test, and interview
    applications.
-   [x] Build four ordered columns: Applied, Test, Interview, Next Step.
-   [x] Build internship cards with company, role, status, applied date,
    skills, and last updated.
-   [x] Add loading, error, and empty states.
-   [x] Implement drag-and-drop using `dnd-kit`.
-   [x] Persist status changes through the API.
-   [x] Restore the previous UI state and show an error if saving a drag
    operation fails.
-   [x] Add search by company and role.
-   [x] Add status filter and sorting by updated date.
-   [x] Ensure horizontal board scrolling works on laptop-sized screens.
-   [x] Add keyboard-accessible alternatives for moving a card where
    practical.

**Acceptance criteria** - A card can be moved between all four
columns. - The new status persists after reload. - A failed API request
does not leave the UI falsely showing a saved status. - Search, filter,
and sorting work together.

## Phase 4 --- Internship Create, Edit, and Detail

-   [ ] Build Add Internship form.
-   [ ] Require company name and role.
-   [ ] Support optional job description, skills/tags, application date,
    job URL, recruiter email, notes, next action, and deadline.
-   [ ] Default application date to today and status to Applied.
-   [ ] Build edit flow.
-   [ ] Build delete confirmation.
-   [ ] Build detail modal/page.
-   [ ] Show status history in the detail view.
-   [ ] Validate URL, email, dates, and required fields.
-   [ ] Add clear save, cancel, and error feedback.

**Acceptance criteria** - A new application can be created in under one
minute. - Editing preserves fields that were not changed. - Deletion
requires explicit confirmation. - Details and status history match
persisted backend data.

## Phase 5 --- Local Launcher

-   [ ] Implement a launcher command named `olan's jira` appropriate for
    the target shell/OS.
-   [ ] Check whether the local server is already running before
    starting another instance.
-   [ ] Start the backend and serve the built frontend locally.
-   [ ] Bind the server to `127.0.0.1` by default.
-   [ ] Open the browser at the local application URL.
-   [ ] Handle startup failures and port conflicts with readable
    messages.
-   [ ] Document installation of the command on Windows.
-   [ ] Ensure closing the terminal or stopping the process has
    documented behavior.

**Acceptance criteria** - Running the command opens the login page. -
Running the command twice does not create duplicate server processes. -
The application is not exposed to the local network by default.

## Phase 6 --- MVP Quality and Data Safety

-   [ ] Add tests for authentication, internship CRUD, and status
    changes.
-   [ ] Add tests for search and filtering.
-   [ ] Add frontend validation and API error states.
-   [ ] Add database backup/export instructions.
-   [ ] Add CSV or JSON export if included in the agreed MVP scope.
-   [ ] Add dependency and build checks.
-   [ ] Verify no Gmail credentials are required for core functionality.
-   [ ] Complete a manual acceptance-test pass using the PRD checklist.

**MVP release gate** - \[ \] All MVP acceptance criteria pass. - \[ \]
Data survives a normal restart. - \[ \] No critical authentication or
data-loss bugs remain. - \[ \] README covers setup, usage, backup, and
troubleshooting.

## Phase 7 --- Gmail Integration (After MVP)

-   [ ] Configure Google Cloud project and Gmail API credentials.
-   [ ] Implement OAuth 2.0 authorization and callback.
-   [ ] Request the narrowest appropriate read-only Gmail scope.
-   [ ] Encrypt refresh tokens at rest and keep all tokens server-side.
-   [ ] Implement connection status and disconnect.
-   [ ] Implement manual email sync first.
-   [ ] Fetch relevant message metadata and only retrieve message
    content when necessary and authorized.
-   [ ] Deduplicate messages by Gmail message ID.
-   [ ] Match messages using sender, domain, company, role, and
    recruitment keywords.
-   [ ] Create reviewable status recommendations with confidence and
    evidence.
-   [ ] Require confirmation for ambiguous matches or status changes.
-   [ ] Allow manual mapping of an email to an internship.
-   [ ] Add sync timestamps and useful failure messages.
-   [ ] Test irrelevant email, duplicate email, ambiguous matching, and
    token revocation cases.

**Acceptance criteria** - Gmail is optional and the core application
works when disconnected. - Email matching never silently changes a
status when the match is ambiguous. - Tokens and message content are not
written to logs. - Disconnecting Gmail removes or disables stored
credentials safely.

## Phase 8 --- Optional Enhancements

-   [ ] Gmail push notifications through Gmail `watch` and Google Cloud
    Pub/Sub.
-   [ ] Deadline reminders.
-   [ ] CSV/JSON import and export.
-   [ ] Backup and restore UI.
-   [ ] Additional application analytics.

## Definition of Done

A task is done only when: 1. The implementation matches the PRD and
architecture. 2. Input validation and error handling are present. 3.
Relevant tests pass. 4. No secrets or personal email contents are
exposed in logs. 5. Documentation is updated when behavior or setup
changes.
