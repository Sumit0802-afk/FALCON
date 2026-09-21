"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const prismaClient_1 = require("./database/prismaClient");
const PORT = Number(process.env.PORT ?? 4000);
async function main() {
    await (0, prismaClient_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    const server = app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`[server] Falcon API listening on http://localhost:${PORT}`);
    });
    const shutdown = async (signal) => {
        // eslint-disable-next-line no-console
        console.log(`[server] ${signal} received, shutting down...`);
        server.close(async () => {
            await (0, prismaClient_1.disconnectDatabase)();
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
