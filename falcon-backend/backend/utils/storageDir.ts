import os from "os";
import path from "path";

/**
 * Where the backend keeps the files it makes: AI pictures, pictures drawn for
 * sent emails and project thumbnails.
 *
 * On a server with a disk this is the storage folder beside the code. A Vercel
 * function may only write to the system's temporary folder, and what it writes
 * there lasts only as long as that instance does, so files made on Vercel are
 * short-lived. STORAGE_DIR overrides both.
 */
export const STORAGE_ROOT =
  (process.env.STORAGE_DIR || "").trim() ||
  (process.env.VERCEL ? path.join(os.tmpdir(), "falcon-storage") : path.join(__dirname, "..", "storage"));
