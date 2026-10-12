// Runs after `npm install`.
// On Vercel it generates the database client, which the function needs and which is
// not kept in the repository.
// On Render it also compiles the server to plain JavaScript, so the running service does
// not have to carry the TypeScript compiler in memory: the free instance has 512 MB, and
// running the sources directly took most of it.
// Anywhere else it does nothing; development runs the sources with ts-node-dev.
const fs = require("fs");
const { execSync } = require("child_process");

if (process.env.VERCEL) {
  execSync("npx prisma generate", { stdio: "inherit" });
  process.exit(0);
}
if (!process.env.RENDER) process.exit(0);

execSync("npx prisma generate", { stdio: "inherit" });

// With NODE_ENV=production npm leaves out the type packages, and the compiler then reports
// types it cannot find. Those reports do not stop it writing the JavaScript, which is all
// that is needed here: the sources are type-checked in development, not on the host.
try {
  execSync("npx tsc -p . --noEmitOnError false", { stdio: "pipe" });
} catch (err) {
  const said = String((err && err.stdout) || "");
  const lines = said.split("\n").filter((line) => line.includes("error TS"));
  console.log(`[render-build] the compiler reported ${lines.length} type message(s); the first: ${lines[0] || "none"}`);
}

if (!fs.existsSync("dist/server.js")) {
  console.error("[render-build] dist/server.js was not written, so the server cannot start");
  process.exit(1);
}
console.log("[render-build] server compiled to dist/");
