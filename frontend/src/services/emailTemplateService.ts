import { apiFetch, getApiBaseUrl } from "./api";
import type { EmailDocument } from "@/types/email";

// ─── Library templates ────────────────────────────────────────────────────────

export interface EmailTemplateCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: { slug: string; name: string };
  subcategory: { slug: string; name: string };
  tags: string[];
  width: number;
  height: number;
  orientation: string;
  author: string;
  isFeatured: boolean;
  isPremium: boolean;
  usageCount: number;
  favoriteCount: number;
  isFavorite: boolean;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateDetail extends EmailTemplateCard {
  templateData: EmailDocument;
  html: string;
}

export interface EmailTemplateCategory {
  slug: string;
  name: string;
  description: string | null;
  count: number;
  children: { slug: string; name: string; count: number }[];
}

export type EmailTemplateSort = "recommended" | "popular" | "newest" | "trending" | "featured";

export interface EmailTemplateQuery {
  q?: string;
  category?: string;
  subcategory?: string;
  tag?: string;
  sort?: EmailTemplateSort;
  featured?: boolean;
  premium?: boolean;
  favorites?: boolean;
  limit?: number;
  cursor?: string | null;
}

export interface EmailTemplatePage {
  items: EmailTemplateCard[];
  nextCursor: string | null;
  total: number;
  /** Set when the requested sort had nothing to show and another was used instead */
  fallback?: string;
}

function queryString(query: EmailTemplateQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.subcategory) params.set("subcategory", query.subcategory);
  if (query.tag) params.set("tag", query.tag);
  if (query.sort) params.set("sort", query.sort);
  if (query.featured) params.set("featured", "true");
  if (query.premium !== undefined) params.set("premium", String(query.premium));
  if (query.favorites) params.set("favorites", "true");
  if (query.limit) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Turns an API-relative asset path (e.g. a thumbnail) into a URL the browser can load. */
export function apiAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${getApiBaseUrl().replace(/\/api\/?$/, "")}${path}`;
}

export function listEmailTemplates(query: EmailTemplateQuery = {}, signal?: AbortSignal): Promise<EmailTemplatePage> {
  return apiFetch<EmailTemplatePage>(`/email-templates${query.q ? "/search" : ""}${queryString(query)}`, { signal });
}

export function listEmailTemplateCategories(): Promise<{ categories: EmailTemplateCategory[]; tags: { slug: string; name: string; count: number }[] }> {
  return apiFetch("/email-templates/categories");
}

export async function getEmailTemplate(id: string): Promise<EmailTemplateDetail> {
  return (await apiFetch<{ template: EmailTemplateDetail }>(`/email-templates/${encodeURIComponent(id)}`)).template;
}

export async function listRecentEmailTemplates(): Promise<EmailTemplateCard[]> {
  return (await apiFetch<{ items: EmailTemplateCard[] }>("/email-templates/recent")).items;
}

/** Clones a library template into a design owned by the signed-in user. */
export function cloneEmailTemplate(id: string): Promise<{ designId: string; name: string; sourceTemplateId: string; templateData: EmailDocument }> {
  return apiFetch(`/email-templates/${encodeURIComponent(id)}/use`, { method: "POST" });
}

export function setEmailTemplateFavorite(id: string, favorite: boolean): Promise<{ id: string; isFavorite: boolean; favoriteCount: number }> {
  return apiFetch(`/email-templates/${encodeURIComponent(id)}/favorite`, { method: favorite ? "POST" : "DELETE" });
}

// ─── The user's own designs ("My Templates") ──────────────────────────────────

export interface UserEmailTemplateSummary {
  id: string;
  name: string;
  sourceTemplateId: string | null;
  width: number;
  height: number;
  thumbnailSvg: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserEmailTemplate extends Omit<UserEmailTemplateSummary, "thumbnailSvg"> {
  templateData: EmailDocument;
  html: string | null;
}

export function listUserEmailTemplates(options: { cursor?: string | null; limit?: number; q?: string } = {}): Promise<{ items: UserEmailTemplateSummary[]; nextCursor: string | null; total: number }> {
  const params = new URLSearchParams();
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.q) params.set("q", options.q);
  const text = params.toString();
  return apiFetch(`/user/email-templates${text ? `?${text}` : ""}`);
}

export async function getUserEmailTemplate(id: string): Promise<UserEmailTemplate> {
  return (await apiFetch<{ template: UserEmailTemplate }>(`/user/email-templates/${encodeURIComponent(id)}`)).template;
}

export async function createUserEmailTemplate(input: { name?: string; templateData?: EmailDocument }): Promise<UserEmailTemplateSummary & { templateData: EmailDocument }> {
  return (await apiFetch<{ template: UserEmailTemplateSummary & { templateData: EmailDocument } }>("/user/email-templates", {
    method: "POST",
    body: JSON.stringify(input),
  })).template;
}

export async function updateUserEmailTemplate(id: string, input: { name?: string; templateData?: EmailDocument }): Promise<UserEmailTemplateSummary> {
  return (await apiFetch<{ template: UserEmailTemplateSummary }>(`/user/email-templates/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })).template;
}

export function deleteUserEmailTemplate(id: string): Promise<{ id: string; deleted: boolean }> {
  return apiFetch(`/user/email-templates/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function duplicateUserEmailTemplate(id: string): Promise<UserEmailTemplateSummary> {
  return (await apiFetch<{ template: UserEmailTemplateSummary }>(`/user/email-templates/${encodeURIComponent(id)}/duplicate`, { method: "POST" })).template;
}

export interface SendEmailInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
  /** Send the design as a picture of itself, so it arrives exactly as made */
  exact?: boolean;
}

/** Sends a finished design to the given recipients through Falcon's mail server. */
export function sendDesignEmail(input: SendEmailInput): Promise<{ success: boolean; recipients: number; message: string }> {
  return apiFetch("/user/email-templates/send", { method: "POST", body: JSON.stringify(input) });
}

/** Splits "a@x.com, b@y.com; c@z.com" into clean addresses. */
export function parseRecipients(value: string): string[] {
  return [...new Set(value.split(/[,;\s]+/).map((v) => v.trim().toLowerCase()).filter(Boolean))];
}

/** Emails the design to the signed-in user's own address. */
export function sendEmailDesignTest(templateData: EmailDocument, subject?: string): Promise<{ success: boolean; sentTo: string }> {
  return apiFetch("/user/email-templates/send-test", { method: "POST", body: JSON.stringify({ templateData, subject }) });
}

/** Inline data URL for a saved design's SVG preview. */
export function svgDataUrl(svg: string | null): string | null {
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
}
