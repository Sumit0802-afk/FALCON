/**
 * projectThumb.ts
 *
 * The small preview picture shown for a project in "My Projects". The editor
 * draws the first page and sends it here; it is re-encoded (which also proves
 * it really is a picture), kept on this server and served from /project-thumbs.
 *
 * File names are random, so a preview can only be seen by someone who was
 * given its address by the project list.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { AppError } from "../utils/AppError";

export const PROJECT_THUMB_DIR = path.join(__dirname, "..", "storage", "project-thumbs");

const PREFIX = "/project-thumbs/";
const MAX_SIDE = 560;

/** The file behind a stored preview address, or null when the address is not one of ours */
function fileOf(url: string | null | undefined): string | null {
  if (!url || !url.startsWith(PREFIX)) return null;
  const name = url.slice(PREFIX.length);
  return /^[a-f0-9]{32}\.jpg$/.test(name) ? path.join(PROJECT_THUMB_DIR, name) : null;
}

/** Saves a preview from a PNG or JPEG data URL and returns the address to store */
export async function saveProjectThumb(dataUrl: string): Promise<string> {
  const match = /^data:image\/(?:png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw AppError.badRequest("The preview must be a PNG or JPEG picture");
  let picture: Buffer;
  try {
    picture = await sharp(Buffer.from(match[1], "base64"), { limitInputPixels: 40_000_000 })
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
  } catch {
    throw AppError.badRequest("The preview could not be read as a picture");
  }
  await fs.promises.mkdir(PROJECT_THUMB_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString("hex")}.jpg`;
  await fs.promises.writeFile(path.join(PROJECT_THUMB_DIR, name), picture);
  return PREFIX + name;
}

/** A second copy of a preview, for a duplicated project, so deleting one never breaks the other */
export async function copyProjectThumb(url: string | null | undefined): Promise<string | null> {
  const file = fileOf(url);
  if (!file) return null;
  try {
    const name = `${crypto.randomBytes(16).toString("hex")}.jpg`;
    await fs.promises.copyFile(file, path.join(PROJECT_THUMB_DIR, name));
    return PREFIX + name;
  } catch {
    return null;
  }
}

export async function removeProjectThumb(url: string | null | undefined): Promise<void> {
  const file = fileOf(url);
  if (file) await fs.promises.unlink(file).catch(() => undefined);
}
