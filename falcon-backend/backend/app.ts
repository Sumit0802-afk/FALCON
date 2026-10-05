import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes";
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

  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Allow localhost and 127.0.0.1 on any port in development
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (isLocalhost || configuredOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS origin policy"), false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

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