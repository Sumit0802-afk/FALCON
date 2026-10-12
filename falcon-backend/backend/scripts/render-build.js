// Runs after `npm install`. On Render it compiles the server to plain JavaScript, so the
// running service does not have to carry the TypeScript compiler in memory: the free
// instance has 512 MB, and running the sources directly took most of it.
// Anywhere else it does nothing; development runs the sources with ts-node-dev.
if (!process.env.RENDER) process.exit(0);

const { execSync } = require("child_process");
execSync("npx prisma generate", { stdio: "inherit" });
execSync("npx tsc -p .", { stdio: "inherit" });
console.log("[render-build] server compiled to dist/");
