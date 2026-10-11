# Falcon — Backend API

Express + TypeScript + Prisma (MySQL) API for the Falcon design app, with
JWT email/password auth. Matches the frontend's `CanvasElement` /
`DesignProject` / `DesignPage` shapes so the editor's autosave can PATCH a
page's `elements` directly.

> **Note on this sandbox:** `npx prisma generate` couldn't run here because
> this environment's network allowlist doesn't include
> `binaries.prisma.sh` (where Prisma downloads its query engine). That's an
> environment restriction, not a code issue — run the setup steps below on
> your own machine (or CI) with normal internet access and it'll generate
> fine. A few files (`services/project.service.ts`,
> `middleware/error.middleware.ts`) reference Prisma's generated types
> (`Project`, `Page`, `Prisma.PrismaClientKnownRequestError`), which only
> exist after that first `generate` — expect red squiggles in your editor
> until then.

## Folder structure

```
controllers/   Express route handlers — parse req, call a service, shape the response
middleware/    requireAuth (JWT check), validateBody (Zod), global error handler
models/        TypeScript DTOs/types — element.model.ts mirrors the frontend's
               CanvasElement types 1:1, so the elements JSON column stays in sync
routes/        Route definitions, grouped by resource, mounted under /api
services/      Business logic + Prisma queries — the only layer that touches the DB
database/      Prisma client singleton (prismaClient.ts) + a dev seed script
prisma/        schema.prisma — the MySQL schema (User, Project, Page)
utils/         AppError (typed HTTP errors), asyncHandler (catches async route errors)
app.ts         Express app: middleware + routes wiring (no listen — easy to test)
server.ts      Entry point: loads .env, connects the DB, starts listening
```

## Setup

1. Have a MySQL server running (locally, Docker, or a hosted instance).
2. `cp .env.example .env` and fill in `DATABASE_URL` and `JWT_SECRET`.
3. Install deps and generate the Prisma client:
   ```bash
   npm install
   npm run prisma:generate
   ```
4. Create the tables:
   ```bash
   npm run prisma:migrate
   ```
5. (Optional) Seed a demo user + project:
   ```bash
   npm run seed
   # login with demo@falcon.app / password123
   ```
6. Start the API:
   ```bash
   npm run dev        # ts-node-dev, auto-restarts on change
   # or
   npm run build && npm start
   ```

The API listens on `http://localhost:4000` by default (`PORT` in `.env`).

## API reference

All `/api/projects/*` routes require `Authorization: Bearer <token>`.

| Method | Path                                    | Body                                  | Description                     |
|--------|------------------------------------------|----------------------------------------|----------------------------------|
| GET    | `/api/health`                            | —                                      | Liveness check                  |
| POST   | `/api/auth/register`                     | `{ name, email, password, confirmPassword }` | Create account           |
| POST   | `/api/auth/login`                        | `{ email, password }`                  | Check password, email a 6-digit code |
| POST   | `/api/auth/verify-otp`                   | `{ email, otp }`                       | Returns `{ user, token }` + session cookie |
| GET    | `/api/auth/me`                           | —                                      | Current user from the token     |
| GET    | `/api/email-templates`                   | query: `q, category, subcategory, tag, sort, premium, favorites, limit, cursor` | Browse the email template library (paged) |
| GET    | `/api/email-templates/search?q=`         | —                                      | Full-text search                |
| GET    | `/api/email-templates/categories`        | —                                      | Category tree and popular tags  |
| GET    | `/api/email-templates/:id`               | —                                      | Template document + exported HTML |
| POST   | `/api/email-templates/:id/use`           | —                                      | Clone into a design the caller owns |
| POST/DELETE | `/api/email-templates/:id/favorite` | —                                      | Add / remove a favorite         |
| GET/POST | `/api/user/email-templates`            | `{ name?, templateData? }`             | List / create the caller's designs |
| GET/PUT/DELETE | `/api/user/email-templates/:id`  | `{ name?, templateData? }`             | Read / save / delete own design |
| POST   | `/api/user/email-templates/send-test`    | `{ templateData, subject? }`           | Email the design to the caller  |
| GET    | `/api/projects`                          | —                                      | List the caller's projects      |
| POST   | `/api/projects`                          | `{ title, presetName? }`               | Create a project (1 default page)|
| GET    | `/api/projects/:projectId`               | —                                      | Full project incl. all pages    |
| PATCH  | `/api/projects/:projectId`               | `{ title?, thumbnailUrl? }`            | Rename / set thumbnail          |
| DELETE | `/api/projects/:projectId`               | —                                      | Delete a project                |
| POST   | `/api/projects/:projectId/duplicate`     | —                                      | Clone a project + its pages     |
| POST   | `/api/projects/:projectId/pages`         | —                                      | Add a blank page                |
| PATCH  | `/api/projects/:projectId/pages/:pageId` | `{ name?, background?, elements? }`    | Editor autosave                 |
| DELETE | `/api/projects/:projectId/pages/:pageId` | —                                      | Remove a page (keeps ≥1)        |

Errors are JSON: `{ "error": "message" }` with an appropriate HTTP status
(400 validation, 401 auth, 404 not found, 409 conflict, 500 unexpected).

## Wiring up the frontend

Replace `frontend/src/services/storageService.ts`'s localStorage calls with
`fetch` calls to these endpoints (send the JWT from login/register in the
`Authorization` header, and store it wherever the frontend keeps session
state). `projectService.ts` and `exportService.ts` on the frontend were
written with this swap in mind — their function signatures already match
what these endpoints return.
