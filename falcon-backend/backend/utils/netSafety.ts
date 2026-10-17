/**
 * Keeps the server from being used to reach places only it can reach: this
 * machine, the private network it sits in, or a cloud host's metadata
 * service. Used wherever the server fetches an address it did not choose,
 * such as a picture found by a search or one written into an email.
 */

import dns from "dns/promises";
import net from "net";

/** Whether an IP address is on the public internet */
export function isPublicIp(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, "").toLowerCase();
  if (net.isIPv4(ip)) {
    const [a, b, c] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 100 && b >= 64 && b <= 127) return false; // shared address space
    if (a === 169 && b === 254) return false; // link-local, cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // protocol assignments, documentation
    if (a === 192 && b === 88 && c === 99) return false;
    if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
    if (a === 198 && b === 51 && c === 100) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    if (a >= 224) return false; // multicast and reserved
    return true;
  }
  if (net.isIPv6(ip)) {
    if (ip === "::" || ip === "::1") return false;
    // An IPv4 address written as IPv6 is judged as the IPv4 address
    const mapped = ip.match(/^(?:::ffff:|::|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicIp(mapped[1]);
    if (/^::ffff:/.test(ip) || /^64:ff9b::/.test(ip)) return false;
    if (/^f[cd]/.test(ip)) return false; // unique local
    if (/^fe[89ab]/.test(ip)) return false; // link-local
    if (/^ff/.test(ip)) return false; // multicast
    if (/^2001:0?db8:/.test(ip)) return false; // documentation
    return true;
  }
  return false;
}

/**
 * Whether an address looks public from its text alone: http or https, and not
 * a private name or IP. A public-looking name can still point somewhere
 * private, which `isPublicDestination` also checks.
 */
export function isPublicUrl(raw: string): boolean {
  if (raw.startsWith("data:") || raw === "about:blank") return true;
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || /\.(localhost|local|internal|lan|home|corp)$/.test(host)) return false;
  if (net.isIP(host)) return isPublicIp(host);
  return true;
}

const verdicts = new Map<string, { ok: boolean; at: number }>();

/** Whether every address the URL's name resolves to is public. Answers are kept for a minute */
export async function isPublicDestination(raw: string): Promise<boolean> {
  if (raw.startsWith("data:") || raw === "about:blank") return true;
  if (!isPublicUrl(raw)) return false;
  const host = new URL(raw).hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) return true;
  const known = verdicts.get(host);
  if (known && Date.now() - known.at < 60_000) return known.ok;
  let ok = false;
  try {
    const found = await dns.lookup(host, { all: true, verbatim: true });
    ok = found.length > 0 && found.every((entry) => isPublicIp(entry.address));
  } catch {
    ok = false;
  }
  if (verdicts.size > 2000) verdicts.clear();
  verdicts.set(host, { ok, at: Date.now() });
  return ok;
}

/**
 * fetch() for an address the server did not choose. Each redirect is followed
 * by hand and checked again, so a public address cannot hand the request on
 * to a private one.
 */
export async function safeFetch(raw: string, init: RequestInit = {}, maxRedirects = 3): Promise<Response> {
  let url = raw;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!(await isPublicDestination(url))) throw new Error("That address is not on the public internet");
    const res = await fetch(url, { ...init, redirect: "manual" });
    const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!next) return res;
    url = new URL(next, url).toString();
  }
  throw new Error("Too many redirects");
}
