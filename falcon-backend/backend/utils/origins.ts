/**
 * Which websites may use this API with a person's session, and which address
 * Falcon's own links (such as a password reset link) point to.
 *
 * The list is CORS_ORIGIN, comma-separated. Outside production, any
 * http://localhost or http://127.0.0.1 port is allowed too, for development.
 */

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function configuredOrigins(): string[] {
  return (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** Whether a page at this origin may call the API with a session */
export function isAllowedOrigin(origin: string): boolean {
  if (configuredOrigins().includes(origin)) return true;
  return process.env.NODE_ENV !== "production" && LOCAL.test(origin);
}

/** The origin of a URL, or null when it is not a valid http(s) URL */
export function originOf(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

/**
 * The address Falcon's links should open: the site the request came from when
 * that site is one of Falcon's own, otherwise the first configured one. A
 * request's Origin or Referer can be made up by anyone, so it is used only
 * when it is on the list.
 */
export function appOrigin(candidate?: string | null): string {
  if (candidate && isAllowedOrigin(candidate)) return candidate;
  return configuredOrigins()[0] || "http://localhost:3000";
}
