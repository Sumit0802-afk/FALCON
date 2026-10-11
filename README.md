# Falcon

**Design With Purpose. Create Without Limits.**

Falcon is an AI-assisted design platform that takes a creative idea from concept to finished design. It combines a visual editor, a template library, an email designer, AI generation, design analysis and campaign creation in one workflow.

The goal is simple: make professional design faster without hiding the creative process behind complicated tools.

## Why

Most design platforms give you powerful tools, but the creative workflow is still largely manual. You create a canvas, choose elements, adjust layouts, find images, write copy, fix spacing, export the design, and then repeat the same process for every variation or campaign.

Falcon is built around the design workflow itself instead of treating AI as a separate chatbot or a generate button. It helps with:

* creating designs from ideas
* editing layouts and creative elements
* generating a design from a brief and a reference picture
* improving existing designs
* understanding why a design works or doesn't
* keeping a consistent visual identity
* remixing existing creative into new variations
* turning a single concept into a complete campaign

## What is in Falcon today

### The site

| Page | What it is for |
| --- | --- |
| Home | The product tour. Its feature cards open the tool they describe, and "Watch demo" plays a two-minute recorded tour. |
| Templates | The poster and social template library, with search, categories and favourites. |
| Library | Every format in one place: posters, presentations and more. |
| Email Templates | Ready-made emails, opened in the email designer. |
| AI Studio | Describe a design, optionally add a reference picture, and get one finished design. |
| My Projects | Your saved designs: open, duplicate, delete. |
| Account, Settings, Help | Profile, password, signed-in sessions, theme and support. |

The site has a dark theme and a light theme. The two editors always use the dark theme, and your design's own colours are never changed by the theme.

### Design editor

The editor is the foundation of the creative workflow. It gives direct control over the design, with AI tools that assist rather than take over.

The tool rail on the left opens one panel at a time:

* **Templates** – start from, or switch to, a library design
* **Elements** – shapes, lines, frames, stickers and graphics, by category
* **Text** – headings, body text, font pairings and text styles, with Google Fonts
* **Uploads** – your own pictures
* **Photos** – stock photographs
* **Portrait** – restyle a photo: film looks, coloured light, sketches and lens effects are drawn on the server; styles that change what is in the photo need a picture model (see *AI providers*)
* **QR Code** – a QR code for a link, text, email, phone, WhatsApp, Wi-Fi, contact card or event, in a library of designs grouped by use (business, events, food, social, shop, celebrations, tech, learning, travel, wellness), with scanning warnings
* **Background** – colours, gradients and pictures
* **Brand Kit** – your brand's colours, fonts and logos; apply a colour to the selection, set a page in your brand fonts in one click, and place a logo
* **Layers** – order, lock, hide and rename
* **AI Tools** – AI Coach, AI Write, Background Remover and a way into AI Studio

On the canvas you can move, resize, rotate, crop, layer, group, duplicate and align anything. Designs can have several pages, are saved as you work, and can be resized to another format. Export is to PNG, JPG, PDF and PowerPoint.

The editor also carries the design-intelligence tools: Design Coach and Design Score for feedback on hierarchy, contrast, spacing and alignment, Design DNA for keeping a consistent look, Smart Remix for new directions from an existing design, and the Campaign Generator for turning one design into a family of formats.

### AI Studio

AI Studio is built on three roles: the **reference** is the visual blueprint, the **prompt** is the creative instruction, and the **AI** carries it out.

1. **Reference** – upload up to four pictures and say what each one is for (layout, colour, typography and so on). Falcon reads them and extracts their Design DNA.
2. **Prompt** – write what the design should say and show. There is no length limit worth worrying about. "Enhance prompt" shows the full compiled prompt, which you can edit before generating.
3. **Controls** – format, reference strength, what the reference controls, visual density and advanced options.
4. **Generate** – one finished design per request. The steps shown are the ones the server is really doing.
5. **Result** – download, open in the editor, regenerate, ask for variations, use the result as the next reference, or fix one detail.

Falcon never invents facts: dates, prices, names, venues, logos and claims come only from what you wrote.

When a picture model is available, AI Studio makes finished artwork and checks it against the reference with a fidelity score. When one is not, it says so and sets the content out as a fully editable design with Falcon's own layout engine.

### Email

* A library of email templates by category
* A block-based email designer: text, headings, images, buttons, dividers, spacers, social links, hero, product and call-to-action blocks, each with its own settings, including the link a button opens
* Design by HTML, with a code editor and live preview
* Preview for desktop and mobile, export to HTML, and send a test email

### Accounts

* Sign up and log in with email and password, confirmed by a one-time code sent by email
* Forgot password and password reset
* Change password, see signed-in sessions and sign out of the others
* JWT sessions

One-time codes are never returned by the API, written to logs or shown in the browser.

## Architecture

Falcon is a frontend application and a backend service.

```
                          Falcon
                             |
            +----------------+----------------+
            |                                 |
            v                                 v
   Frontend (Next.js)                 Backend API (Express)
            |                                 |
   +--------+---------+        +--------+-----+------+-----------+
   |        |         |        |        |            |           |
   v        v         v        v        v            v           v
 Site    Design     Email    Auth    Projects    Templates      AI
 pages   editor    designer   |      and pages   and library     |
                              |         |            |           |
                              v         +-----+------+           v
                        Email (SMTP)          |          Text model, picture
                                              v          model, stock photos
                                       MySQL (Prisma)
```

The frontend is responsible for the user experience, both editors and every creative workflow. The backend handles authentication, projects, the template libraries, AI requests, image processing and email.

### Application flow

```
Sign up / Log in  (email code)
        |
        v
 Home / My Projects
        |
        +-----------------+------------------+------------------+
        |                 |                  |                  |
        v                 v                  v                  v
  Blank design      From a template      AI Studio        Email template
        |                 |                  |                  |
        +-----------------+------------------+                  v
                          |                              Email designer
                          v                                     |
                    Design editor                               v
     (elements, text, photos, portrait, QR,            Preview / HTML / send
      background, brand kit, layers, AI tools)
                          |
                          v
          Coach / Score / DNA / Remix / Campaign
                          |
                          v
              Save / Resize / Export
```

## Tech stack

**Frontend:** Next.js 15 (Pages Router), React 18, TypeScript, Tailwind CSS, lucide-react, three.js, jsPDF, PptxGenJS, qrcode-generator, in-browser background removal.

**Backend:** Node.js, Express, TypeScript, Prisma, MySQL, Zod, JSON Web Tokens, bcrypt, Nodemailer, sharp, Puppeteer (for thumbnails and email snapshots).

## AI providers

Falcon's AI is configured entirely through environment variables; no provider is hard-coded.

| Job | How it is configured |
| --- | --- |
| Text and reading pictures (copy, analysis, coaching) | Any service that speaks the OpenAI protocol: `AI_BASE_URL`, `AI_API_KEY`, `AI_TEXT_MODEL`. Gemini, Groq and OpenRouter work. |
| Pictures (Portrait's generative styles, AI Studio artwork) | Either a Gemini picture model (`PORTRAIT_IMAGE_MODEL`, `AI_ARTWORK_MODEL`) or fal.ai (`IMAGE_PROVIDER=fal`, `FAL_API_KEY`). |
| Stock photographs | `PEXELS_API_KEY` |

Without a picture provider Falcon still works: the Portrait styles that need one are shown as unavailable, and AI Studio produces an editable layout instead of artwork.

## Project structure

```
Falcon/
|
+-- frontend/
|   +-- public/                 static files, the demo video
|   +-- src/
|       +-- pages/              site pages, /editor/[projectId], /email-designer
|       +-- components/
|       |   +-- Editor/         the editor shell
|       |   +-- Canvas/         the page and its elements
|       |   +-- Sidebar/        one panel per tool
|       |   +-- Toolbar/        the tool rail
|       |   +-- TopBar/         file, resize, share, download
|       |   +-- AiStudio/       the AI Studio workspace
|       |   +-- EmailDesigner/  blocks, settings, HTML, preview, send
|       |   +-- common/         shared pieces
|       +-- services/           calls to the backend
|       +-- utils/, data/, types/, styles/
|
+-- falcon-backend/
|   +-- backend/
|       +-- server.ts, app.ts
|       +-- routes/             auth, projects, ai, templates, library,
|       |                       email-templates, stickers, admin
|       +-- controllers/, middleware/
|       +-- services/           auth, otp, email, projects, templates,
|       |                       aiDesign, aiStudio, portrait, falPicture ...
|       +-- templates/          the template and email layout engines
|       +-- prisma/             schema and migrations
|       +-- scripts/            seeding and import
|       +-- tests/
|
+-- database/
```

## Backend API

All routes are under `/api`.

| Area | Routes |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`, `/auth/me`, `/auth/sessions`, `/auth/logout`, `/auth/logout-others`, `/auth/support` |
| Projects | `/projects`, `/projects/:id`, `/projects/:id/duplicate`, `/projects/:id/thumbnail`, `/projects/:id/pages` |
| Templates | `/templates`, `/library`, `/email-templates`, `/user/email-templates`, `/admin/templates` |
| AI design | `/ai/sizes`, `/ai/designs`, `/ai/designs/variations`, `/ai/designs/resize`, `/ai/designs/use`, `/ai/photos` |
| AI Studio | `/ai/studio/status`, `/ai/studio/analyze`, `/ai/studio/compile`, `/ai/studio/artwork`, `/ai/studio/evaluate`, `/ai/studio/layout`, `/ai/studio/open` |
| Portrait | `/ai/portrait/styles`, `/ai/portrait/previews`, `/ai/portrait`, `/ai/portrait/blend` |

Users can only read and change their own projects and templates.

## Database

Falcon uses MySQL through Prisma. The main groups of tables are:

* **Accounts** – users, sessions, one-time codes, password reset tokens
* **Designs** – projects and their pages
* **Poster templates** – templates, designs, categories, tags, favourites, import jobs
* **Library** – library templates and favourites
* **Email** – email templates, their content, categories, tags, favourites, and each user's own email templates

The Brand Kit is currently kept in the browser, not in the account.

## Email

Sign-in codes, password resets and test emails from the email designer are sent over SMTP with Nodemailer. Any SMTP provider works; the credentials live only in environment variables.

## Environment configuration

Sensitive configuration is loaded from environment variables. `falcon-backend/backend/.env.example` lists every name with placeholder values.

```
# Server
PORT
NODE_ENV
DATABASE_URL
CORS_ORIGIN
PUBLIC_API_URL
JWT_SECRET
JWT_EXPIRES_IN

# Email
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
SUPPORT_EMAIL
EMAIL_ASSET_BASE_URL

# AI: text
AI_BASE_URL
AI_API_KEY
AI_TEXT_MODEL

# AI: pictures (one of the two groups)
AI_IMAGE_MODEL
PORTRAIT_IMAGE_MODEL
AI_ARTWORK_MODEL

IMAGE_PROVIDER
FAL_API_KEY
FAL_IMAGE_MODEL

# Other
PEXELS_API_KEY
CHROME_PATH
```

The frontend reads `NEXT_PUBLIC_API_URL` (the backend's address) and, optionally, `NEXT_PUBLIC_GOOGLE_FONTS_API_KEY` from `frontend/.env.local`.

`.env` files hold secrets. They stay on your machine and are ignored by Git.

## Build and run

### Requirements

* Node.js and npm
* MySQL
* Google Chrome (used by the backend to draw thumbnails)
* A filled-in `.env` file

### Backend

```
cd falcon-backend/backend
npm install
npx prisma migrate dev
npm run dev
```

The backend runs on `http://localhost:4000`.

To fill the template libraries:

```
npm run templates:seed
npm run library:seed
npm run email:seed
```

### Frontend

```
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

Run each command inside its own folder. `npm run dev` in the top folder fails, because the top folder has no `dev` script; from there use `npm run dev:backend` and `npm run dev:frontend` instead.

## Testing

```
cd falcon-backend/backend
npm run typecheck
npm run test:auth
npm run test:account
npm run test:library
npm run test:email
```

```
cd frontend
npm run typecheck
npm run lint
```

The backend tests cover sign-up, login, one-time codes, password reset, account changes, the library and email templates. The editors and AI workflows are checked in the browser; automated end-to-end tests will grow with the platform.

## Security

Sensitive values such as API keys, JWT secrets, database credentials and SMTP passwords are stored in environment variables and never committed.

For production:

* use production-specific secrets
* enable HTTPS
* set `CORS_ORIGIN` to the production site
* use a database user with only the rights it needs
* rotate any credential that has been shared, pasted or shown in a screenshot
* never expose backend secrets to the frontend

## Roadmap

**Done**

* Project structure, frontend and backend foundations
* Authentication with email codes, password reset and sessions
* Design editor: text, images, shapes, frames, stickers, layers, pages, resize, export
* Template library, format library and email templates
* Email designer with HTML editing, preview and sending
* AI Studio with reference pictures, prompt compilation and result actions
* Portrait, QR Code and Brand Kit tools
* Light theme
* Demo video

**In progress**

* Picture generation for Portrait and AI Studio, which needs a paid picture provider
* Deeper Design Coach, Design Score, Design DNA, Smart Remix and Campaign workflows

**Planned**

* Brand Kit saved to the account
* Design history
* Collaboration
* Light theme for the editors
* Automated end-to-end tests

## Project status

Falcon is under active development. Features, APIs, internal architecture and UI patterns may change.

## Vision

Falcon is built around one idea:

**AI should not replace the designer. It should make the designer better.**

The goal is a platform where you can start with an idea, turn it into a design, understand what can be improved, generate variations, keep a consistent look, and produce an entire campaign, without switching between tools.

Design With Purpose. Create Without Limits.

## License

This project is under active development. A license and contribution guidelines will be added as it moves toward a public release.
