/**
 * Gets a picture ready to send to the server, which keeps uploads in the
 * database and so takes pictures up to 3 MB.
 *
 * A picture already small enough goes as it is. A larger photo is redrawn
 * smaller and saved as WebP (which keeps transparency), a step at a time, until
 * it fits. SVGs and GIFs cannot be redrawn without losing what they are, so a
 * large one is refused.
 */

/** A little under the server's limit, since the exact size is only known once encoded */
const LIMIT = 2.7 * 1024 * 1024;
/** What a photo is brought down to before sending */
const SMALL = 1.5 * 1024 * 1024;
const LONGEST_SIDE = 2400;

export interface FittedImage {
  dataUrl: string;
  type: string;
  name: string;
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That file is not a picture the browser can open."));
    image.src = url;
  });
}

/** Bytes a base64 data URL stands for */
function bytesOf(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.floor((base64.length * 3) / 4);
}

/** Kinds the server keeps as they are */
const SENDABLE = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"];

export async function fitImageForUpload(file: File): Promise<FittedImage> {
  const type = file.type.toLowerCase();
  const original = await readAsDataUrl(file);
  const sendable = SENDABLE.includes(type);
  // Phone photos are kept below the limit too, so the request stays short on a slow connection
  if (sendable && file.size <= SMALL) return { dataUrl: original, type, name: file.name };

  if (type === "image/svg+xml" || type === "image/gif") {
    if (file.size <= LIMIT) return { dataUrl: original, type, name: file.name };
    throw new Error("That file is too large. SVG and GIF files up to 2.7 MB can be uploaded.");
  }

  const image = await loadImage(original).catch(() => {
    throw new Error(sendable ? "That file is not a picture the browser can open." : "This phone's browser cannot open that photo (HEIC). Pick a JPG or PNG, or set the camera to save JPG.");
  });
  // A JPEG has nothing see-through to keep, and a phone without WebP would otherwise make a huge PNG
  const outType = type === "image/png" || type === "image/webp" ? "image/webp" : "image/jpeg";
  let side = Math.min(LONGEST_SIDE, Math.max(image.naturalWidth, image.naturalHeight));
  for (let attempt = 0; attempt < 8; attempt++) {
    const scale = side / Math.max(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // A browser without WebP hands back a PNG, which the size check below still judges fairly
    const dataUrl = canvas.toDataURL(outType, outType === "image/jpeg" ? 0.86 : 0.9);
    if (bytesOf(dataUrl) <= SMALL) {
      const madeType = dataUrl.slice(5, dataUrl.indexOf(";"));
      const extension = madeType === "image/webp" ? ".webp" : madeType === "image/jpeg" ? ".jpg" : ".png";
      return { dataUrl, type: madeType, name: file.name.replace(/\.[a-z0-9]+$/i, "") + extension };
    }
    side = Math.round(side * 0.8);
  }
  throw new Error("That picture could not be made small enough to upload. Try a smaller one.");
}
