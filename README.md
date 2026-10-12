<!-- Header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:000000,50:0070F3,100:00DFD8&text=FALCON&fontColor=ffffff&fontSize=80&fontAlignY=38&desc=Design%20with%20purpose.%20Create%20without%20limits.&descAlignY=60&descSize=18" alt="Falcon — Design with purpose. Create without limits." width="100%" />
</p>

<!-- Views -->
<p align="right">
  <a href="https://github.com/Sumit0802-afk/FALCON">
    <img src="https://komarev.com/ghpvc/?username=Sumit0802-afk-FALCON&label=Repo%20Views&color=0070F3&style=flat" alt="Repo views" />
  </a>
</p>

<!-- Typing SVG -->
<p align="center">
  <a href="https://falcon-six-nu.vercel.app">
    <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=22&duration=3500&pause=900&color=0070F3&center=true&vCenter=true&multiline=false&repeat=true&random=false&width=720&height=50&lines=An+AI-assisted+design+platform;Editor+%C2%B7+Templates+%C2%B7+Email+designer+%C2%B7+AI+Studio;From+an+idea+to+a+finished+design" alt="An AI-assisted design platform" />
  </a>
</p>

<!-- Links -->
<p align="center">
  <a href="https://falcon-six-nu.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo" />
  </a>&nbsp;
  <a href="https://github.com/Sumit0802-afk/FALCON" target="_blank">
    <img src="https://img.shields.io/badge/Repository-000000?style=for-the-badge&logo=github&logoColor=white" alt="Repository" />
  </a>&nbsp;
  <a href="#-quick_start">
    <img src="https://img.shields.io/badge/Quick_Start-000000?style=for-the-badge&logo=gnubash&logoColor=white" alt="Quick start" />
  </a>&nbsp;
  <a href="#-deploy">
    <img src="https://img.shields.io/badge/Deploy-000000?style=for-the-badge&logo=rocket&logoColor=white" alt="Deploy" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React_18-000000?style=flat-square&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-000000?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-000000?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-000000?style=flat-square&logo=postgresql&logoColor=4169E1" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-000000?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
</p>

<br>

<!-- About -->
## `> about.ts`

```typescript
const falcon = {
    tagline: "Design with purpose. Create without limits.",
    what: "An AI-assisted design platform, from one sentence to a finished, editable design",
    liveDemo: "https://falcon-six-nu.vercel.app",
    parts: ["Design editor", "Template library", "Email designer", "AI Studio"],
    stack: {
        frontend: ["Next.js 15", "React 18", "TypeScript", "Tailwind CSS"],
        backend: ["Node.js 22", "Express", "Prisma", "Zod"],
        database: ["PostgreSQL", "full-text search"],
        hosting: ["Vercel", "Neon"]
    },
    exports: ["PNG", "JPG", "PDF", "PowerPoint"],
    belief: "AI should not replace the designer. It should make the designer better."
};
```

<br>

<!-- Tech Stack -->
## `> tech_stack`

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,threejs,nodejs,express,prisma,postgres,vercel,git,github&theme=dark&perline=12" alt="Next.js, React, TypeScript, Tailwind CSS, three.js, Node.js, Express, Prisma, PostgreSQL, Vercel, Git, GitHub" />
  </a>
</p>

<br>

<!-- Features -->
## `> features`

```typescript
const editor = {
    canvas: "move, resize, rotate, crop, layer, group, align; pages; autosave; resize to any format",
    tools: {
        templates: "start from, or switch to, a library design",
        elements: "shapes, lines, frames, stickers, charts and graphics",
        text: "headings, body text, pairings and styles, with Google Fonts",
        uploads: "your own pictures, kept with your account on every device",
        photos: "stock photographs",
        portrait: "film looks, coloured light, sketches and lens effects for a photo",
        qrCode: "links, Wi-Fi, contacts and events, in a library of designs, with scan warnings",
        brandKit: "your colours, fonts and logos, plus palettes, pairings and marks to start from",
        aiTools: ["AI Coach", "AI Write", "Background Remover"]
    }
};

const aiStudio = {
    reference: "the visual blueprint: up to four pictures, each with a role",
    prompt: "the creative instruction, compiled into a full prompt you can edit",
    result: "ONE finished design, then regenerate, vary, or fix a single detail",
    rule: "never invents facts: dates, prices, names and venues come only from you"
};

const libraries = {
    designs: ["posters", "presentations", "certificates"],   // searchable, every one editable
    emails: "newsletters, offers, confirmations and more, by category and tag"
};

const emailDesigner = {
    build: "block by block, or paste HTML and edit it visually",
    check: ["desktop preview", "mobile preview", "send a test"],
    output: "clean HTML"
};

const accounts = {
    signIn: "email + password, confirmed by a one-time code",
    also: ["password reset", "change password", "end other sessions"],
    promise: "codes never appear in responses, logs or the browser"
};
```

<br>

<!-- Quick Start -->
## `> quick_start`

**You need:** Node.js 22, npm and PostgreSQL 14 or newer.

```bash
# 1. clone
git clone https://github.com/Sumit0802-afk/FALCON.git
cd FALCON

# 2. backend  ->  http://localhost:4000
cd falcon-backend/backend
npm install
cp .env.example .env          # then fill it in, see > config.env
npx prisma migrate deploy     # creates the tables
npm run library:seed          # posters, presentations, certificates
npm run email:seed            # email templates
npm run dev

# 3. frontend  ->  http://localhost:3000   (in a second terminal)
cd frontend
npm install
npm run dev
```

Both seed scripts take `--count`, which keeps a small database small: `npm run library:seed -- --count 5000`.

<br>

<!-- Config -->
## `> config.env`

```bash
# required
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/falcon
JWT_SECRET=                    # the server will not start in production without it

# when hosted
CORS_ORIGIN=                   # the frontend's address
PUBLIC_API_URL=                # the backend's own address

# email: one of the two
SMTP_HOST=  SMTP_PORT=  SMTP_SECURE=  SMTP_USER=  SMTP_PASSWORD=  SMTP_FROM=
BREVO_API_KEY=  EMAIL_FROM=    # over HTTPS, for hosts that close the SMTP ports

# AI: any OpenAI-compatible text model (Gemini, Groq, OpenRouter)
AI_BASE_URL=  AI_API_KEY=  AI_TEXT_MODEL=

# optional
IMAGE_PROVIDER=  FAL_API_KEY=  # pictures for Portrait and AI Studio
PEXELS_API_KEY=                # stock photographs
```

The frontend reads `NEXT_PUBLIC_API_URL` (the backend's address ending in `/api`) from `frontend/.env.local`.
`.env` files stay on your machine and are ignored by Git.

<br>

<!-- Architecture -->
## `> architecture`

```mermaid
flowchart LR
    U([Browser]) --> F[Frontend<br/>Next.js on Vercel]
    F -- REST /api --> B[Backend<br/>Express on Vercel]
    B --> D[(PostgreSQL<br/>Neon)]
    B --> M[Email<br/>SMTP or Brevo]
    B --> A[AI<br/>text and picture models]
    B --> P[Stock photos<br/>Pexels]
```

```
Falcon/
├── frontend/src/
│   ├── pages/                 site pages, /editor/[projectId], /email-designer
│   ├── components/            Editor · Canvas · Sidebar · AiStudio · EmailDesigner
│   └── services/              calls to the backend
└── falcon-backend/backend/
    ├── server.ts              the API on a machine with a disk
    ├── api/index.ts           the same API as a Vercel function
    ├── routes/                auth · projects · ai · uploads · library · email
    ├── services/              the logic behind each route
    ├── templates/             the design and email layout engines
    └── prisma/                schema and migrations
```

<br>

<!-- Deploy -->
## `> deploy`

The live demo runs on free tiers: two Vercel projects from this one repository, and a Neon database.

```yaml
frontend:
  host: Vercel
  rootDirectory: frontend
  env: { NEXT_PUBLIC_API_URL: "https://<backend>/api" }

backend:
  host: Vercel
  rootDirectory: falcon-backend/backend
  frameworkPreset: Other
  env: [DATABASE_URL, JWT_SECRET, CORS_ORIGIN, SMTP_*, AI_*]

database:
  host: Neon
  setup: |
    DATABASE_URL="<neon string>" npx prisma migrate deploy
    DATABASE_URL="<neon string>" npm run library:seed -- --count 50000
    DATABASE_URL="<neon string>" npm run email:seed -- --count 15000

limitsOnFreeTiers:
  - files do not last, so uploaded pictures live in the database (3 MB each, 60 MB per account)
  - video, audio and PDF uploads need a host with a disk
  - requests are capped at 4.5 MB and 60 seconds
  - the hosted demo carries part of the library, not all of it
```

A `render.yaml` blueprint is included for running the backend on a host with a disk.

<br>

<!-- API -->
## `> api`

```http
POST   /api/auth/register        POST   /api/auth/login          POST   /api/auth/verify-otp
POST   /api/auth/forgot-password POST   /api/auth/reset-password GET    /api/auth/me

GET    /api/projects             POST   /api/projects            PATCH  /api/projects/:id
GET    /api/uploads              POST   /api/uploads             DELETE /api/uploads/:id

GET    /api/library              GET    /api/library/facets      POST   /api/library/:id/use
GET    /api/email-templates      GET    /api/user/email-templates

POST   /api/ai/studio/analyze    POST   /api/ai/studio/compile   POST   /api/ai/studio/layout
GET    /api/ai/portrait/styles   POST   /api/ai/portrait         GET    /api/health
```

People can only read and change their own projects, uploads and templates.

```bash
cd falcon-backend/backend
npm run test:auth       # sign-up, login, one-time codes, password reset
npm run test:account    # profile, password change, sessions
npm run test:library    # the design library and its search
npm run test:email      # email templates, rendering and search
```

<br>

<!-- Roadmap -->
## `> roadmap`

```diff
+ accounts with email codes, password reset and sessions
+ design editor with pages, resize and export
+ design library, email templates and the email designer
+ AI Studio with reference pictures and prompt compilation
+ Portrait, QR Code and Brand Kit tools
+ uploads kept with the account on every device
+ light theme
+ PostgreSQL, deployed on Vercel and Neon

- picture generation for Portrait and AI Studio (needs a paid picture model)
- Brand Kit saved to the account instead of the browser
- lasting storage for AI pictures and thumbnails
- design history and collaboration
- end-to-end tests
```

<br>

<!-- Repository -->
## `> repository`

<p align="center">
  <a href="https://github.com/Sumit0802-afk/FALCON">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=Sumit0802-afk&repo=FALCON&bg_color=000000&title_color=FFFFFF&text_color=888888&icon_color=0070F3&border_color=333333&hide_border=false" alt="FALCON repository" />
  </a>
</p>

<br>

<!-- Author -->
## `> author`

```typescript
const contributions = {
    author: "Sumit Bhamu",
    role: "design, frontend, backend, database and deployment",
    code: {
        typescript: "117,000+ lines in 275 files",
        frontend: { pages: 17, components: 75 },
        backend: { endpoints: 87, services: 21, databaseModels: 23 },
        tests: "275 checks: sign-in, accounts, the design library and email"
    },
    built: [
        "the design editor: canvas, pages, layers, resize and export",
        "AI Studio: reference pictures, prompt compilation and one-detail fixes",
        "the design library and its full-text search",
        "the email designer, its templates and the HTML it sends",
        "Portrait, QR Code and Brand Kit tools",
        "accounts: one-time codes, password reset and sessions",
        "uploads kept with the account on every device",
        "the move from MySQL to PostgreSQL",
        "hosting on Vercel and Neon"
    ]
};
```

<p align="center">
  <img src="https://img.shields.io/github/commit-activity/t/Sumit0802-afk/FALCON?style=for-the-badge&label=Commits&labelColor=000000&color=0070F3" alt="Commits" />&nbsp;
  <img src="https://img.shields.io/github/last-commit/Sumit0802-afk/FALCON?style=for-the-badge&label=Last_commit&labelColor=000000&color=0070F3" alt="Last commit" />&nbsp;
  <img src="https://img.shields.io/github/languages/code-size/Sumit0802-afk/FALCON?style=for-the-badge&label=Code_size&labelColor=000000&color=0070F3" alt="Code size" />
</p>

<p align="center">
  <a href="https://github.com/Sumit0802-afk/FALCON">
    <img height="180em" src="https://github-readme-stats.vercel.app/api/top-langs/?username=Sumit0802-afk&langs_count=8&layout=compact&bg_color=000000&title_color=FFFFFF&text_color=888888&icon_color=0070F3&border_color=333333&hide_border=false" alt="Most used languages" />
  </a>
</p>

<p align="center">
  Built by <a href="https://github.com/Sumit0802-afk"><b>Sumit Bhamu</b></a>
</p>

<p align="center">
  <a href="https://github.com/Sumit0802-afk" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-000000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>&nbsp;
  <a href="https://falcon-six-nu.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Try_Falcon-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Try Falcon" />
  </a>
</p>

<br>

<!-- Footer -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:00DFD8,50:0070F3,100:000000&section=footer" alt="" width="100%" />
</p>
