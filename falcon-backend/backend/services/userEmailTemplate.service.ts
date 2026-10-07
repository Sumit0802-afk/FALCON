import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  EMAIL_SCHEMA_VERSION, EmailDocument, EmailSchemaError, cloneDocument, compactDocument, createBlock,
  createDocument, createSection, normalizeDocument,
} from "../templates/email/core/schema";
import { renderEmailHtml } from "../templates/email/core/renderHtml";
import { estimateEmailHeight, renderThumbnailSvg } from "../templates/email/core/renderThumbnail";
import { emailService } from "./email.service";

const MAX_PER_USER = 500;
const MAX_DOCUMENT_BYTES = 1_500_000;
const PREVIEW_RATIO = 1.45;
const MAX_RECIPIENTS = 25;

const LIST_SELECT = {
  id: true, name: true, sourceTemplateId: true, width: true, height: true, thumbnailSvg: true, createdAt: true,
  updatedAt: true,
} as const;

function parseUserDocument(raw: unknown): EmailDocument {
  if (raw === undefined || raw === null) throw AppError.badRequest("templateData is required");
  if (JSON.stringify(raw).length > MAX_DOCUMENT_BYTES) throw AppError.badRequest("This email is too large to save");
  try {
    return normalizeDocument(raw);
  } catch (err) {
    if (err instanceof EmailSchemaError) throw AppError.badRequest(err.message);
    throw err;
  }
}

/** Everything derived from the document is recomputed on the server on each save. */
function derive(document: EmailDocument, name: string) {
  return {
    templateData: JSON.stringify(compactDocument(document)),
    html: renderEmailHtml(document, { title: name }),
    thumbnailSvg: renderThumbnailSvg(document, { maxRatio: PREVIEW_RATIO }),
    schemaVersion: EMAIL_SCHEMA_VERSION,
    width: document.document.settings.emailWidth,
    height: estimateEmailHeight(document),
  };
}

function blankDocument(): EmailDocument {
  return createDocument([
    createSection([100], [[createBlock("heading"), createBlock("text"), createBlock("button")]], { paddingTop: 16, paddingBottom: 16 }),
  ]);
}

function cleanName(name: unknown, fallback: string): string {
  const value = typeof name === "string" ? name.trim().slice(0, 120) : "";
  return value || fallback;
}

/** Scopes every lookup to the owner, so one user can never read or change another's design. */
async function findOwned(userId: string, id: string) {
  const row = await prisma.userEmailTemplate.findFirst({ where: { id, userId } });
  if (!row) throw AppError.notFound("Template not found");
  return row;
}

export const userEmailTemplateService = {
  async list(userId: string, options: { limit?: number; cursor?: string; q?: string } = {}) {
    const limit = Math.min(60, Math.max(1, Math.floor(options.limit || 24)));
    const q = (options.q || "").trim().slice(0, 120);
    const rows = await prisma.userEmailTemplate.findMany({
      where: { userId, ...(q ? { name: { contains: q } } : {}) },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      select: LIST_SELECT,
    });
    const page = rows.slice(0, limit);
    const total = await prisma.userEmailTemplate.count({ where: { userId } });
    return {
      items: page.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() })),
      nextCursor: rows.length > limit ? page[page.length - 1].id : null,
      total,
    };
  },

  async get(userId: string, id: string) {
    const row = await findOwned(userId, id);
    return {
      id: row.id,
      name: row.name,
      sourceTemplateId: row.sourceTemplateId,
      templateData: normalizeDocument(row.templateData),
      html: row.html,
      width: row.width,
      height: row.height,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  async create(userId: string, input: { name?: string; templateData?: unknown }) {
    const count = await prisma.userEmailTemplate.count({ where: { userId } });
    if (count >= MAX_PER_USER) {
      throw AppError.badRequest(`You can keep up to ${MAX_PER_USER} templates. Delete one to save another.`);
    }
    const document = input.templateData === undefined ? blankDocument() : parseUserDocument(input.templateData);
    const name = cleanName(input.name, "Untitled Email");
    const row = await prisma.userEmailTemplate.create({ data: { userId, name, ...derive(document, name) }, select: LIST_SELECT });
    return { ...row, templateData: document };
  },

  async update(userId: string, id: string, input: { name?: string; templateData?: unknown }) {
    const existing = await findOwned(userId, id);
    const name = input.name === undefined ? existing.name : cleanName(input.name, existing.name);
    const data =
      input.templateData === undefined
        ? { name }
        : { name, ...derive(parseUserDocument(input.templateData), name) };
    const row = await prisma.userEmailTemplate.update({ where: { id: existing.id }, data, select: LIST_SELECT });
    return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
  },

  async remove(userId: string, id: string) {
    const existing = await findOwned(userId, id);
    await prisma.userEmailTemplate.delete({ where: { id: existing.id } });
    return { id: existing.id, deleted: true };
  },

  async duplicate(userId: string, id: string) {
    const existing = await findOwned(userId, id);
    const document = cloneDocument(normalizeDocument(existing.templateData));
    return this.create(userId, { name: `${existing.name} (copy)`.slice(0, 120), templateData: document });
  },

  /**
   * Sends a finished design to the recipients the signed-in user entered.
   * Mail goes out from Falcon's configured sender; the user's own address is
   * used as Reply-To so replies reach them.
   */
  async sendEmail(
    userId: string,
    input: { to: string[]; cc?: string[]; bcc?: string[]; subject: string; html: string; fromName?: string; replyTo?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (!user) throw AppError.unauthorized("Authentication required");

    const recipients = input.to.length + (input.cc?.length || 0) + (input.bcc?.length || 0);
    if (recipients > MAX_RECIPIENTS) {
      throw AppError.badRequest(`You can send to at most ${MAX_RECIPIENTS} recipients at a time.`);
    }
    try {
      await emailService.sendDesignEmail({
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        html: input.html,
        fromName: cleanName(input.fromName, user.name),
        replyTo: input.replyTo || user.email,
      });
    } catch {
      throw new AppError("We couldn't send the email. Please try again in a moment.", 502, "EMAIL_DELIVERY_FAILED");
    }
    return { success: true, recipients, message: `Email sent to ${recipients} recipient${recipients === 1 ? "" : "s"}.` };
  },

  /**
   * Sends the design to the signed-in user's own address only, so the endpoint
   * cannot be used to mail arbitrary people from Falcon's sender.
   */
  async sendTest(userId: string, input: { templateData: unknown; subject?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) throw AppError.unauthorized("Authentication required");
    const document = parseUserDocument(input.templateData);
    const subject = cleanName(input.subject, document.document.settings.subject || "Falcon email").slice(0, 200);
    try {
      await emailService.sendDesignTest({ to: user.email, subject: `[Test] ${subject}`, html: renderEmailHtml(document) });
    } catch {
      throw new AppError("We couldn't send the test email. Please try again in a moment.", 502, "EMAIL_DELIVERY_FAILED");
    }
    return { success: true, sentTo: user.email };
  },
};
