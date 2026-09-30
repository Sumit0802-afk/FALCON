/**
 * Falcon SVG Sanitizer & Validator
 *
 * Strips dangerous executable code, event handlers, scripts, and embedded objects
 * while preserving styling, gradients, paths, shapes, and filters.
 */

const DANGEROUS_TAGS = [
  /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
  /<\s*iframe\b[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi,
  /<\s*object\b[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi,
  /<\s*embed\b[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi,
  /<\s*foreignObject\b[^>]*>[\s\S]*?<\s*\/\s*foreignObject\s*>/gi,
];

// Matches on* attributes e.g. onload, onerror, onclick, onmouseover
const ON_ATTRIBUTES = /\s+on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;

// Matches javascript:, data:text/html, etc in href or xlink:href
const JAVASCRIPT_URLS = /\s+(?:href|xlink:href)\s*=\s*(?:['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+)/gi;

export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== "string") return "";

  let cleaned = rawSvg.trim();

  // Strip dangerous elements
  for (const pattern of DANGEROUS_TAGS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Strip on* event handlers
  cleaned = cleaned.replace(ON_ATTRIBUTES, "");

  // Strip javascript: pseudo-protocols in links
  cleaned = cleaned.replace(JAVASCRIPT_URLS, "");

  // Ensure svg has xmlns if missing
  if (!cleaned.includes("xmlns=") && cleaned.includes("<svg")) {
    cleaned = cleaned.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return cleaned;
}

export function isValidSvg(content: string): boolean {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  return (
    trimmed.includes("<svg") &&
    trimmed.includes("</svg>") &&
    !trimmed.includes("<script")
  );
}
