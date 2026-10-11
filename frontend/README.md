# Falcon — Design Editor (Canva-style)

A working frontend scaffold for a browser-based design tool: drag/resize
shapes and text on a canvas, manage layers, edit properties, undo/redo,
and export to PNG. Built with **React + TypeScript + Next.js (Pages Router)**
and Tailwind CSS. Verified with `tsc --noEmit` and `next build` — no errors.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it starts on the dashboard (`/`), where "+ New
design" creates a project (saved to localStorage) and opens the editor at
`/editor/[projectId]`.

## Folder structure (`src/`)

```
types/       Element, project, and tool type definitions (shared contracts)
utils/       Pure helpers — geometry/snapping, color, id generation, PNG export
services/    Data layer — localStorage-backed project CRUD, export/download
hooks/       Editor state — useCanvasEditor (elements+selection), useHistory
             (undo/redo), useDragResize, useZoomPan, useKeyboardShortcuts
components/  UI — Canvas (render/select/drag), Toolbar, TopBar, Sidebar
             (Layers + Properties panels), common (Button, IconButton, ColorSwatch)
pages/       index.tsx (project gallery), editor/[projectId].tsx (editor route)
styles/      Tailwind entrypoint
```

## What's implemented

- Add rectangle / ellipse / line / text / image elements to the canvas
- Select, drag, resize (8-handle), rotate-aware rendering, multi-select
- Layers panel: reorder (bring forward / send backward), lock, hide
- Properties panel: position/size, fill, stroke, text color/size/alignment
- Undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z), duplicate (Cmd/Ctrl+D), delete
- Zoom (Cmd/Ctrl + scroll, +/- buttons, reset)
- Export current page to PNG or JSON
- Project dashboard: create, duplicate, delete, open

## What's stubbed / next steps

- `services/storageService.ts` uses `localStorage` — swap for a real API
  (the shape of `projectService` is designed so only its internals change)
- Multi-page documents: `DesignProject.pages` already supports it; the UI
  only surfaces `pages[0]` today
- Image upload isn't wired to a file picker yet (`ImageElement.src` is empty
  until you set it)
- No auth/collaboration — `User` type and `ownerId` fields are placeholders
