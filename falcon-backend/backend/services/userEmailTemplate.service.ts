import { prisma } from "../database/prismaClient";
import { AppError } from "../utils/AppError";
import {
  EMAIL_SCHEMA_VERSION, EmailDocument, EmailSchemaError, cloneDocument, compactDocument, createBlock,
  createDocument, createSection, normalizeDocument,
} from "../templates/email/core/schema";
import { renderEmailHtml } from "../templates/email/core/renderHtml";
import { exactHtmlOf } from "../templates/email/core/schema";
import { estimateEmailHeight, renderThumbnailSvg } from "../templates/email/core/renderThumbnail";
import { emailService, EmailDeliveryError, EmailFailureReason } from "./email.service";

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

const DELIVERY_MESSAGES: Record<EmailFailureReason, string> = {
  not_configured: "Sending is not set up on this server yet. Add the SMTP settings to the backend's .env file and restart it.",
  sign_in: "The mail server refused Falcon's sign-in. Check the SMTP username and app password in the backend's .env file.",
  recipient: "The mail server rejected a recipient address. Check the addresses and try again.",
  too_large: "This email is too large to send. Use smaller images, or link to them instead of embedding them.",
  limit: "The mail server is limiting how much can be sent right now. Wait a while and try again.",
  connection: "Falcon couldn't reach the mail server. Check the internet connection and try again.",
  unknown: "The mail server did not accept the email. Please try again in a moment.",
};

/** The error shown to the person sending, saying what went wrong where that is known */
function deliveryError(err: unknown, what: string): AppError {
  const reason: EmailFailureReason = err instanceof EmailDeliveryError ? err.reason : "unknown";
  const message = reason === "unknown" ? `We couldn't send the ${what}. Please try again in a moment.` : DELIVERY_MESSAGES[reason];
  return new AppError(message, 502, "EMAIL_DELIVERY_FAILED");
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
    input: { to: string[]; cc?: string[]; bcc?: string[]; subject: string; html: string; fromName?: string; replyTo?: string; exact?: boolean }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (!user) throw AppError.unauthorized("Authentication required");

    const recipients = input.to.length + (input.cc?.length || 0) + (input.bcc?.length || 0);
    if (recipients > MAX_RECIPIENTS) {
      throw AppError.badRequest(`You can send to at most ${MAX_RECIPIENTS} recipients at a time.`);
    }
    let picture = false;
    try {
      ({ picture } = await emailService.sendDesignEmail({
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        html: input.html,
        fromName: cleanName(input.fromName, user.name),
        replyTo: input.replyTo || user.email,
        asPicture: input.exact,
      }));
    } catch (err) {
      throw deliveryError(err, "email");
    }
    // Said plainly when an exact copy was asked for but could not be made
    const note = input.exact && !picture ? " It went as ordinary HTML, because this server has no browser to draw an exact copy with, so some effects may look simpler." : "";
    return { success: true, recipients, exact: picture, message: `Email sent to ${recipients} recipient${recipients === 1 ? "" : "s"}.${note}` };
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
      await emailService.sendDesignTest({ to: user.email, subject: `[Test] ${subject}`, html: renderEmailHtml(document), asPicture: exactHtmlOf(document) !== null });
    } catch (err) {
      throw deliveryError(err, "test email");
    }
    return { success: true, sentTo: user.email };
  },
};
