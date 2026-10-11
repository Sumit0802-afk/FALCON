/**
 * Copies the shared email schema/renderer from the frontend into the backend.
 *
 * The frontend copy (frontend/src/lib/emailCore) is the source of truth. Run
 * `npm run email:sync` after changing it; `npm run test:email` fails if the two
 * copies drift apart.
 */
import fs from "fs";
import path from "path";

export const CORE_SOURCE = path.resolve(__dirname, "../../../frontend/src/lib/emailCore");
export const CORE_TARGET = path.resolve(__dirname, "../templates/email/core");

const BANNER =
  "// GENERATED FILE - do not edit. Source: frontend/src/lib/emailCore. Run `npm run email:sync` to update.\n";

export function coreFiles(): string[] {
  return fs.readdirSync(CORE_SOURCE).filter((f) => f.endsWith(".ts")).sort();
}

export function expectedContent(file: string): string {
  return BANNER + fs.readFileSync(path.join(CORE_SOURCE, file), "utf8").replace(/\r\n/g, "\n");
}

export function syncEmailCore(): string[] {
  fs.mkdirSync(CORE_TARGET, { recursive: true });
  const written: string[] = [];
  for (const file of coreFiles()) {
    fs.writeFileSync(path.join(CORE_TARGET, file), expectedContent(file));
    written.push(file);
  }
  return written;
}

if (require.main === module) {
  const files = syncEmailCore();
  // eslint-disable-next-line no-console
  console.log(`[email:sync] copied ${files.length} files to templates/email/core: ${files.join(", ")}`);
}
