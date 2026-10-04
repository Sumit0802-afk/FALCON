# Falcon — Uploads

Static storage for user-uploaded images, written to by
`falcon-backend`'s upload endpoint and served back over HTTP as plain
static files (no separate CDN needed for local dev).

```
images/       Final uploaded images (used as ImageElement.src on the canvas)
thumbnails/   Auto-generated project thumbnails (for the dashboard gallery)
tmp/          Multer's transient staging dir while a file is being written —
              safe to clear anytime the server isn't mid-upload
```

## How files get here

1. Frontend sends `POST /api/uploads/image` (multipart form, field name
   `file`) with the user's JWT.
2. `falcon-backend/middleware/upload.middleware.ts` (Multer) validates the
   file type/size and streams it into `images/` with a generated filename.
3. The endpoint responds with `{ url: "/uploads/images/<filename>" }`.
4. `falcon-backend/app.ts` serves this whole folder statically at
   `/uploads`, so that URL is directly usable as an `<img src>` — the
   frontend's `ImageElement.src` gets set to exactly that value.

## Local dev vs. production

This is fine for local dev and small deployments. For production, point
`UPLOAD_DIR` (see `falcon-backend/.env.example`) at a persistent volume, or
swap `upload.middleware.ts`'s disk storage for an S3-compatible
`multer-s3` storage engine — the controller and route don't need to change,
only where the file bytes end up.
