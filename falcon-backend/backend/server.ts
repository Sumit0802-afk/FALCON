import dotenv from "dotenv";
import path from "path";

// Ensure .env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./database/prismaClient";
import { emailService } from "./services/email.service";

const PORT = Number(process.env.PORT ?? 4000);

async function main() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Falcon API listening on http://localhost:${PORT}`);
    const emailStatus = emailService.getConfigStatus();
    // eslint-disable-next-line no-console
    console.log(`[server] Email status: ${emailStatus.details}`);
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[server] failed to start:", err);
  process.exit(1);
});
