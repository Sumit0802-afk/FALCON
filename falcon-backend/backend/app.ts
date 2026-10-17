import { EMAIL_ASSET_DIR } from "./services/emailSnapshot";
import { AI_ASSET_DIR } from "./services/aiDesign.service";
import { PROJECT_THUMB_DIR } from "./services/projectThumb";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes";
import { AppError } from "./utils/AppError";
import { isAllowedOrigin, originOf } from "./utils/origins";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";

export function createApp(): Application {
  const app = express();

  // Trust proxy for rate limiting behind reverse proxies (Nginx, Vercel, Fly.io, Cloudflare)
  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Managed by Next.js / frontend
    })
  );

  app.use(
    cors({
      // Falcon's own sites (CORS_ORIGIN; and localhost outside production) may call the API with a
      // session. Requests with no Origin come from tools and servers, not from a web page. Any other
      // site gets no CORS headers, so its page cannot read the answer
      origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Pictures made for sent emails, fetched later by the mail apps that show them
  app.use("/email-assets", express.static(EMAIL_ASSET_DIR, { maxAge: "365d", immutable: true, index: false, dotfiles: "deny" }));
  // Pictures made by AI Studio. Any page may load them, so the editor can draw and export them
  app.use("/ai-assets", express.static(AI_ASSET_DIR, { maxAge: "365d", immutable: true, index: false, dotfiles: "deny", setHeaders: (res) => res.setHeader("Access-Control-Allow-Origin", "*") }));

  // Preview pictures of projects, drawn by the editor for the "My Projects" page
  app.use("/project-thumbs", express.static(PROJECT_THUMB_DIR, { maxAge: "365d", immutable: true, index: false, dotfiles: "deny" }));

  app.use(cookieParser());

  // A request that changes something must come from one of Falcon's own pages. Browsers always say
  // which page sent a cross-site request, so a form or script on another website that tries to act
  // with a visitor's session is turned away here, before any work is done
  app.use("/api", (req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
    const from = origin || originOf(req.headers.referer);
    if (origin === "null" || (from && !isAllowedOrigin(from))) {
      return next(new AppError("This request did not come from Falcon.", 403, "FOREIGN_ORIGIN"));
    }
    next();
  });

  // Bodies are JSON only; a form-encoded body (what a plain HTML form sends) is not read at all.
  // Sign-in requests are small; nothing else needs more than the 4.5 MB a hosted function accepts
  app.use("/api/auth", express.json({ limit: "50kb" }));
  app.use(express.json({ limit: "5mb" }));

  app.use(
    morgan(
      process.env.NODE_ENV === "production"
        ? "combined"
        : "dev"
    )
  );

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}