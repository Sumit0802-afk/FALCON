/**
 * email.service.ts
 *
 * Email dispatcher for the Falcon backend. Mail is sent straight from this
 * server over SMTP (Nodemailer) using the SMTP_* environment variables.
 *
 * Security:
 * - OTP values and reset links are never logged.
 * - SMTP credentials are never logged or exposed.
 * - Only masked email addresses (e.g. b***3@gmail.com) appear in logs.
 */

import nodemailer, { Transporter } from "nodemailer";
import { inlineEmailStyles } from "./emailInliner";
import { EffectsUnavailable, snapshotEmail } from "./emailSnapshot";
import { checkEmailImages } from "./emailImages";

export interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
  expiresInMinutes?: number;
}

export interface SendPasswordResetOptions {
  to: string;
  name?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

interface OutgoingEmail {
  /** One address, or several separated by commas */
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
}

/** What became of a design's special effects: drawn as pictures, not asked for, or why not */
export type EffectsOutcome = "drawn" | "off" | "no_host" | "no_browser" | "failed";

export interface DesignSendResult {
  effects: EffectsOutcome;
  /** Pictures in the design whose address does not work outside this computer */
  unreachableImages: number;
}

/**
 * The body of a designed email as it will be sent. A design sent with its effects
 * is drawn by a browser so it arrives exactly as made; if that cannot be done,
 * or it was not asked for, the design goes as HTML with its styles inlined.
 */
/**
 * A design's HTML made ready for mail apps: its stylesheet copied onto the
 * elements, and every picture checked to be at an address a mail app can reach.
 * The designer's preview asks for exactly this, so what is previewed as the
 * "compatibility version" is what gets sent.
 */
function compatibleHtml(html: string): { html: string; unreachable: number } {
  // Mail clients drop stylesheets, so the styles travel on the elements themselves
  const inlined = inlineEmailStyles(html);
  // Every picture must be at a public address; nothing is ever attached to the message
  return process.env.NODE_ENV === "test" ? { html: inlined, unreachable: 0 } : checkEmailImages(inlined);
}

async function designBody(html: string, subject: string, asPicture: boolean | undefined, fallbackText: string) {
  let effects: EffectsOutcome = "off";
  let body = { html: "", text: fallbackText };
  if (asPicture && process.env.NODE_ENV !== "test") {
    try {
      body = await snapshotEmail(html, subject);
      effects = "drawn";
    } catch (err: any) {
      effects = err instanceof EffectsUnavailable ? err.reason : "failed";
      if (effects === "failed") console.error(`[email.service] Could not draw the design effects (${err?.name || "Error"}); sending it without them`);
    }
  }
  if (effects !== "drawn") {
    const ready = compatibleHtml(html);
    return { html: ready.html, text: fallbackText, effects, unreachableImages: ready.unreachable };
  }
  const checked = checkEmailImages(body.html);
  return { html: checked.html, text: body.text, effects, unreachableImages: checked.unreachable };
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const maskedUser =
    user.length <= 2 ? user[0] + "*" : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── SMTP Configuration ──────────────────────────────────────────────────────

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function readSmtpConfig(): { config?: SmtpConfig; missing: string[] } {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)?.trim();

  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASSWORD");
  if (!host || !user || !pass) return { missing };

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  return {
    missing,
    config: {
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      user,
      pass,
      from: process.env.SMTP_FROM?.trim() || user,
    },
  };
}

// ─── Sending over HTTPS ──────────────────────────────────────────────────────

// Some hosts close the SMTP ports. With BREVO_API_KEY set, mail goes to Brevo over
// HTTPS instead, from the address in EMAIL_FROM (or SMTP_FROM), which has to be a
// sender verified in that Brevo account.

function brevoKey(): string {
  return (process.env.BREVO_API_KEY || "").trim();
}

function httpsFrom(): string {
  return (process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
}

/** '"Falcon" <a@b.c>' or 'a@b.c' as its two parts */
function nameAndAddress(value: string, fallbackName: string): { name: string; email: string } {
  const found = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(value);
  return found ? { name: found[1].trim() || fallbackName, email: found[2].trim() } : { name: fallbackName, email: value.trim() };
}

const addressList = (value?: string) => (value || "").split(",").map((v) => v.trim()).filter(Boolean).map((email) => ({ email }));

/** Sends one email through Brevo; returns its id. Throws an error carrying `status`, or `code` when the service was not reached */
async function sendOverHttps(email: OutgoingEmail, key: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  let res: Response;
  try {
    res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", Accept: "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        sender: nameAndAddress(httpsFrom(), email.fromName || "Falcon"),
        to: addressList(email.to),
        ...(email.cc ? { cc: addressList(email.cc) } : {}),
        ...(email.bcc ? { bcc: addressList(email.bcc) } : {}),
        ...(email.replyTo ? { replyTo: { email: email.replyTo } } : {}),
        subject: email.subject,
        htmlContent: email.html,
        textContent: email.text,
      }),
    });
  } catch {
    throw Object.assign(new Error("email service not reached"), { code: "ECONNECTION" });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw Object.assign(new Error("email service refused"), { status: res.status });
  const body: any = await res.json().catch(() => ({}));
  return String(body?.messageId || "accepted");
}

/** Sorts the email service's refusal into a reason */
function httpsFailureReason(err: any): EmailFailureReason {
  if (err?.code === "ECONNECTION") return "connection";
  const status = Number(err?.status) || 0;
  if (status === 401 || status === 403) return "sign_in";
  if (status === 413) return "too_large";
  if (status === 429 || status === 402) return "limit";
  if (status === 400) return "recipient";
  return "unknown";
}

let _smtpTransporter: Transporter | null = null;

function getSmtpTransporter(config: SmtpConfig): Transporter {
  if (_smtpTransporter) return _smtpTransporter;

  _smtpTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    // Long enough for a large design to upload on a slow line
    socketTimeout: 60000,
  });

  return _smtpTransporter;
}

// ─── Automated Test Store (ONLY active when NODE_ENV === 'test') ─────────────
const _testInbox = new Map<string, { otp?: string; resetUrl?: string; designSubject?: string; designHtml?: string }>();
let _testLastSupportRequest: { to: string; replyTo: string; subject: string; html: string } | undefined;
let _testFailNextSend = false;

// ─── Core Email Dispatcher ───────────────────────────────────────────────────

/** Why a send failed, in terms the person sending can act on */
export type EmailFailureReason = "not_configured" | "sign_in" | "recipient" | "too_large" | "limit" | "connection" | "unknown";

export class EmailDeliveryError extends Error {
  constructor(public reason: EmailFailureReason) {
    super("Email delivery failed");
  }
}

/** Sorts a mail server's refusal into a reason, without keeping any of its text */
function failureReason(err: any): EmailFailureReason {
  const code = String(err?.code || "");
  const status = Number(err?.responseCode) || 0;
  const reply = String(err?.response || "");
  if (code === "EAUTH" || status === 534 || status === 535) return "sign_in";
  if (status === 552 || /5.[23].[34]/.test(reply) || code === "EMESSAGE") return "too_large";
  if (/5.4.5|4.7.0|5.7.1[^0-9]*(?:rate|limit)|quota|too many/i.test(reply) || [421, 450, 451, 452, 454].includes(status)) return "limit";
  if (code === "EENVELOPE" || [501, 550, 551, 553].includes(status)) return "recipient";
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "EDNS", "ECONNRESET", "ECONNREFUSED", "ETLS", "EPIPE"].includes(code)) return "connection";
  return "unknown";
}

/** How many copies of a design are sent at the same time */
const EACH_AT_ONCE = 4;

/** Sends one email. Throws on any failure; callers decide what the user sees. */
async function dispatchEmail(email: OutgoingEmail): Promise<void> {
  // The test runner reads codes from the in-memory inbox instead of a mailbox
  if (process.env.NODE_ENV === "test") {
    if (_testFailNextSend) {
      _testFailNextSend = false;
      throw new Error("Simulated email delivery failure");
    }
    return;
  }

  const key = brevoKey();
  if (key) {
    if (!httpsFrom()) {
      console.error(`[email.service] Cannot send email to ${maskEmail(email.to)}: EMAIL_FROM is not set`);
      throw new EmailDeliveryError("not_configured");
    }
    try {
      let id: string;
      try {
        id = await sendOverHttps(email, key);
      } catch (first: any) {
        // A dropped connection is worth one more try
        if (httpsFailureReason(first) !== "connection") throw first;
        id = await sendOverHttps(email, key);
      }
      console.log(`[email.service] Email delivered to ${maskEmail(email.to.split(",")[0])}${email.to.includes(",") || email.cc || email.bcc ? " and others" : ""} (id: ${id})`);
      return;
    } catch (err: any) {
      // Only the status is logged, never the message or the service's reply
      console.error(`[email.service] HTTPS delivery to ${maskEmail(email.to)} failed (status: ${err?.status || err?.code || "UNKNOWN"})`);
      throw new EmailDeliveryError(httpsFailureReason(err));
    }
  }

  const { config, missing } = readSmtpConfig();
  if (!config) {
    console.error(
      `[email.service] Cannot send email to ${maskEmail(email.to)}: missing ${missing.join(", ")} in backend/.env`
    );
    throw new EmailDeliveryError("not_configured");
  }

  const fromName = email.fromName || "Falcon";
  const formattedFrom = config.from.includes("<") ? config.from : `"${fromName}" <${config.from}>`;

  const message = {
    from: formattedFrom,
    to: email.to,
    cc: email.cc || undefined,
    bcc: email.bcc || undefined,
    replyTo: email.replyTo || undefined,
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  try {
    let info;
    try {
      info = await getSmtpTransporter(config).sendMail(message);
    } catch (first: any) {
      // A dropped or slow connection is worth one more try on a fresh one
      if (failureReason(first) !== "connection") throw first;
      _smtpTransporter = null;
      info = await getSmtpTransporter(config).sendMail(message);
    }
    console.log(`[email.service] Email delivered to ${maskEmail(email.to.split(",")[0])}${email.to.includes(",") || email.cc || email.bcc ? " and others" : ""} (id: ${info.messageId})`);
  } catch (err: any) {
    // Log only the error class, never the message body or server transcript
    console.error(
      `[email.service] SMTP delivery to ${maskEmail(email.to)} failed (code: ${err?.code || "UNKNOWN"}, response: ${err?.responseCode || "n/a"})`
    );
    throw new EmailDeliveryError(failureReason(err));
  }
}

// ─── HTML Templates ──────────────────────────────────────────────────────────

// Falcon's own emails are laid out with tables and inline styles only. Mail apps
// differ in what they keep of a stylesheet, and a sign-in code has to look right in all of them.

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'SF Mono',Consolas,Menlo,Monaco,'Courier New',monospace";

/** "SUMIT BHAMU 24BCD7025" is greeted as "Sumit": the first word of the name, in ordinary capitals */
function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] || "";
  if (first.length < 2 || !/^\p{L}+$/u.test(first)) return name.trim() || "there";
  const shouting = first === first.toUpperCase() || first === first.toLowerCase();
  return shouting ? first[0].toUpperCase() + first.slice(1).toLowerCase() : first;
}

/**
 * The frame every account email shares: the Falcon band on top, the message in
 * a dark card, a quiet line underneath.
 *
 * `preheader` is the line a mail app shows beside the subject. It is followed by
 * blank filler so the app does not carry on into the body, which for a sign-in
 * email would put the code in the notification.
 */
function accountEmail(opts: { title: string; label: string; preheader: string; body: string; footer: string }): string {
  const filler = "&#847;&zwnj;&nbsp;".repeat(90);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0d14;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#0b0d14;">${escapeHtml(opts.preheader)}${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0d14" style="background-color:#0b0d14;">
<tr><td align="center" style="padding:32px 12px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#131520" style="max-width:500px;border-collapse:separate;background-color:#131520;border:1px solid #262a40;border-radius:20px;overflow:hidden;">
    <tr><td bgcolor="#17143f" style="background-color:#17143f;background-image:linear-gradient(135deg,#2a1f78 0%,#141230 55%,#0c0d18 100%);padding:24px 32px;border-radius:19px 19px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${FONT};font-size:17px;font-weight:800;letter-spacing:0.3em;color:#ffffff;">FALCON</td>
        <td align="right" style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#b9b0ff;">${escapeHtml(opts.label)}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:32px 32px 30px;">
${opts.body}
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;">
    <tr><td align="center" style="padding:20px 24px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#6b7186;">${opts.footer}</td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function otpHtml(name: string, otp: string, expiresInMinutes: number): string {
  const body = `      <h1 style="margin:0 0 10px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">Your sign-in code</h1>
      <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:1.6;color:#a4a9bd;">Hi ${escapeHtml(firstName(name))}, enter this code on the Falcon sign-in screen to finish signing in.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>
        <td align="center" bgcolor="#0c0d16" style="background-color:#0c0d16;border:1px solid #3a3580;border-radius:14px;padding:28px 12px 22px;">
          <div style="font-family:${MONO};font-size:40px;line-height:1;font-weight:700;letter-spacing:0.3em;padding-left:0.3em;color:#ffffff;">${otp}</div>
          <div style="margin-top:16px;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:0.02em;color:#a99cff;">Expires in ${expiresInMinutes} minutes &nbsp;&middot;&nbsp; works once</div>
        </td>
      </tr></table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin-top:22px;"><tr>
        <td bgcolor="#1e1a12" style="background-color:#1e1a12;border-left:3px solid #f5b544;border-radius:8px;padding:12px 14px;font-family:${FONT};font-size:13px;line-height:1.55;color:#e6d6ae;"><strong style="color:#ffd88a;">Never share this code.</strong> Falcon will never ask for it anywhere except the sign-in screen.</td>
      </tr></table>
      <p style="margin:22px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:#7c8196;">Didn&rsquo;t try to sign in? Then someone else entered your password. They cannot get in without this code, but you should change your password soon.</p>`;
  return accountEmail({
    title: "Your Falcon sign-in code",
    label: "Sign-in code",
    preheader: `Your sign-in code is inside. It expires in ${expiresInMinutes} minutes.`,
    body,
    footer: "This is an automated message from Falcon. Replies are not read.",
  });
}

function passwordResetHtml(name: string, resetUrl: string, expiresInMinutes: number): string {
  const link = escapeHtml(resetUrl);
  const body = `      <h1 style="margin:0 0 10px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">Reset your password</h1>
      <p style="margin:0 0 26px;font-family:${FONT};font-size:15px;line-height:1.6;color:#a4a9bd;">Hi ${escapeHtml(firstName(name))}, we received a request to reset your Falcon password. Choose a new one with the button below.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;margin:0 auto;"><tr>
        <td align="center" bgcolor="#6d5bff" style="background-color:#6d5bff;border-radius:10px;">
          <a href="${link}" class="btn" style="display:inline-block;padding:14px 34px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Choose a new password</a>
        </td>
      </tr></table>
      <p style="margin:18px 0 0;font-family:${FONT};font-size:12px;font-weight:600;text-align:center;color:#a99cff;">The link expires in ${expiresInMinutes} minutes &nbsp;&middot;&nbsp; works once</p>
      <p style="margin:26px 0 6px;font-family:${FONT};font-size:12px;line-height:1.6;color:#7c8196;">If the button does not work, paste this address into your browser:</p>
      <p style="margin:0;font-family:${MONO};font-size:12px;line-height:1.5;word-break:break-all;"><a href="${link}" style="color:#a99cff;text-decoration:underline;">${link}</a></p>
      <p style="margin:22px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:#7c8196;">Didn&rsquo;t ask for this? You can ignore this email. Your password stays as it is.</p>`;
  return accountEmail({
    title: "Reset your Falcon password",
    label: "Password reset",
    preheader: `Choose a new Falcon password. The link expires in ${expiresInMinutes} minutes.`,
    body,
    footer: "This is an automated message from Falcon. Replies are not read.",
  });
}

function accountExistsHtml(name: string, signInUrl: string): string {
  const link = escapeHtml(signInUrl);
  const body = `      <h1 style="margin:0 0 10px;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">You already have an account</h1>
      <p style="margin:0 0 26px;font-family:${FONT};font-size:15px;line-height:1.6;color:#a4a9bd;">Hi ${escapeHtml(firstName(name))}, someone just tried to sign up for Falcon with this email address. It already has an account, so nothing was changed. To get in, sign in; if you have forgotten your password, choose Forgot your password on the sign-in page.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;margin:0 auto;"><tr>
        <td align="center" bgcolor="#6d5bff" style="background-color:#6d5bff;border-radius:10px;">
          <a href="${link}" class="btn" style="display:inline-block;padding:14px 34px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Sign in to Falcon</a>
        </td>
      </tr></table>
      <p style="margin:22px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:#7c8196;">Wasn&rsquo;t you? You can ignore this email. Your account and password stay as they are.</p>`;
  return accountEmail({
    title: "You already have a Falcon account",
    label: "Sign-up",
    preheader: "Someone tried to sign up with this email. It already has an account.",
    body,
    footer: "This is an automated message from Falcon. Replies are not read.",
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const emailService = {
  /** The HTML a design would be sent as, for the designer to show beside the original. Sends nothing */
  compatibilityVersion(html: string): { html: string; unreachableImages: number; bytes: number } {
    const ready = compatibleHtml(html);
    return { html: ready.html, unreachableImages: ready.unreachable, bytes: Buffer.byteLength(ready.html) };
  },

  /** Send a 6-digit OTP email to the user's registered address */
  async sendOtpEmail(opts: SendOtpOptions): Promise<void> {
    const { to, name = "there", otp, expiresInMinutes = 5 } = opts;

    if (process.env.NODE_ENV === "test") {
      _testInbox.set(to.toLowerCase(), { otp });
    }

    await dispatchEmail({
      to,
      fromName: "Falcon",
      // The code stays out of the subject so it never shows in notification previews or mail logs
      subject: "Your Falcon sign-in code",
      text: `Your Falcon sign-in code is ${otp}\n\nIt expires in ${expiresInMinutes} minutes and works once. Never share it: Falcon will never ask for it anywhere except the sign-in screen.\n\nDidn't try to sign in? Then someone else entered your password. They cannot get in without this code, but you should change your password soon.`,
      html: otpHtml(name, otp, expiresInMinutes),
    });
  },

  /** Tells the owner of an address that already has an account that someone tried to sign up with it */
  async sendAccountExistsEmail(opts: { to: string; name: string; signInUrl: string }): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      _testInbox.set(opts.to.toLowerCase(), { designSubject: "account-exists" });
      return;
    }
    await dispatchEmail({
      to: opts.to,
      fromName: "Falcon Security",
      subject: "You already have a Falcon account",
      text: `Hi ${firstName(opts.name)},\n\nSomeone just tried to sign up for Falcon with this email address. It already has an account, so nothing was changed. Sign in here: ${opts.signInUrl}\n\nForgotten your password? Choose "Forgot your password?" on the sign-in page.\n\nWasn't you? You can ignore this email.`,
      html: accountExistsHtml(opts.name, opts.signInUrl),
    });
  },

  /** Send a password reset link email */
  async sendPasswordResetEmail(opts: SendPasswordResetOptions): Promise<void> {
    const { to, name = "there", resetUrl, expiresInMinutes = 15 } = opts;

    if (process.env.NODE_ENV === "test") {
      _testInbox.set(to.toLowerCase(), { resetUrl });
    }

    await dispatchEmail({
      to,
      fromName: "Falcon Security",
      subject: `Reset your Falcon password`,
      text: `Hi ${firstName(name)},\n\nOpen this link to choose a new Falcon password:\n${resetUrl}\n\nThe link expires in ${expiresInMinutes} minutes and works once.\n\nDidn't ask for this? You can ignore this email. Your password stays as it is.`,
      html: passwordResetHtml(name, resetUrl, expiresInMinutes),
    });
  },

  /** Send a rendered email design to its author as a test */
  async sendDesignTest(opts: { to: string; subject: string; html: string; asPicture?: boolean }): Promise<DesignSendResult> {
    const body = await designBody(opts.html, opts.subject, opts.asPicture, "This is a test of your Falcon email design. Open it in an HTML-capable mail client to see the layout.");
    opts = { ...opts, html: body.html };
    if (process.env.NODE_ENV === "test") {
      _testInbox.set(opts.to.toLowerCase(), { designSubject: opts.subject, designHtml: opts.html });
    }

    await dispatchEmail({
      to: opts.to,
      fromName: "Falcon",
      subject: opts.subject,
      text: body.text,
      html: opts.html,
    });
    return { effects: body.effects, unreachableImages: body.unreachableImages };
  },

  /**
   * Sends a finished design to each recipient as a copy of their own. Nobody
   * sees anyone else's address, and an address the mail server refuses does
   * not stop the others. The design is prepared once and every copy shares it.
   */
  async sendDesignToEach(opts: {
    recipients: string[];
    subject: string;
    html: string;
    fromName?: string;
    asPicture?: boolean;
  }): Promise<DesignSendResult & { sent: string[]; failed: { address: string; reason: EmailFailureReason }[] }> {
    const body = await designBody(opts.html, opts.subject, opts.asPicture, "This email was designed in Falcon. Open it in an HTML-capable mail client to see it.");
    const sent: string[] = [];
    const failed: { address: string; reason: EmailFailureReason }[] = [];
    const queue = [...opts.recipients];
    // A few at a time: quick enough for a long list, gentle enough that the mail server does not refuse
    const worker = async () => {
      for (let address = queue.shift(); address; address = queue.shift()) {
        try {
          await dispatchEmail({ to: address, fromName: opts.fromName || "Falcon", subject: opts.subject, text: body.text, html: body.html });
          if (process.env.NODE_ENV === "test") _testInbox.set(address.toLowerCase(), { designSubject: opts.subject, designHtml: body.html });
          sent.push(address);
        } catch (err) {
          failed.push({ address, reason: err instanceof EmailDeliveryError ? err.reason : "unknown" });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(EACH_AT_ONCE, queue.length) }, worker));
    return { effects: body.effects, unreachableImages: body.unreachableImages, sent, failed };
  },

  /** Send a finished email design to the recipients its author chose */
  async sendDesignEmail(opts: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    html: string;
    fromName?: string;
    replyTo?: string;
    asPicture?: boolean;
  }): Promise<DesignSendResult> {
    const body = await designBody(opts.html, opts.subject, opts.asPicture, "This email was designed in Falcon. Open it in an HTML-capable mail client to see it.");
    opts = { ...opts, html: body.html };
    if (process.env.NODE_ENV === "test") {
      for (const address of opts.to) {
        _testInbox.set(address.toLowerCase(), { designSubject: opts.subject, designHtml: opts.html });
      }
    }

    await dispatchEmail({
      to: opts.to.join(", "),
      cc: opts.cc?.join(", "),
      bcc: opts.bcc?.join(", "),
      replyTo: opts.replyTo,
      fromName: opts.fromName || "Falcon",
      subject: opts.subject,
      text: body.text,
      html: opts.html,
    });
    return { effects: body.effects, unreachableImages: body.unreachableImages };
  },

  /**
   * Forwards a help request to the support mailbox (SUPPORT_EMAIL, or the
   * sending mailbox when that is not set). Replies go to the user who asked.
   */
  async sendSupportRequest(opts: {
    fromName: string;
    fromEmail: string;
    topic: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const { config } = readSmtpConfig();
    const fallback = config ? (config.from.match(/<([^>]+)>/)?.[1] || config.from) : "";
    const to = process.env.SUPPORT_EMAIL?.trim() || fallback || "support@localhost";
    // Subjects are a single header line; strip anything that could start another
    const subject = `[Falcon support · ${opts.topic}] ${opts.subject}`.replace(/[\r\n]+/g, " ").slice(0, 200);
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;line-height:1.6">
<p><strong>From:</strong> ${escapeHtml(opts.fromName)} &lt;${escapeHtml(opts.fromEmail)}&gt;<br>
<strong>Topic:</strong> ${escapeHtml(opts.topic)}</p>
<p style="white-space:pre-wrap">${escapeHtml(opts.message)}</p>
</div>`;

    if (process.env.NODE_ENV === "test") {
      _testLastSupportRequest = { to, replyTo: opts.fromEmail, subject, html };
    }

    await dispatchEmail({
      to,
      replyTo: opts.fromEmail,
      fromName: "Falcon Support",
      subject,
      text: `From: ${opts.fromName} <${opts.fromEmail}>\nTopic: ${opts.topic}\n\n${opts.message}`,
      html,
    });
  },

  /** Used only by automated integration test runner */
  getDevLastSupportRequest() {
    return _testLastSupportRequest;
  },

  /** Check current email configuration status (safe to log: contains no credentials) */
  getConfigStatus(): { configured: boolean; details: string } {
    if (brevoKey()) {
      return httpsFrom()
        ? { configured: true, details: "Email ready (Brevo over HTTPS)" }
        : { configured: false, details: "BREVO_API_KEY is set but EMAIL_FROM is not, so sign-in codes cannot be sent" };
    }
    const { config, missing } = readSmtpConfig();
    return {
      configured: !!config,
      details: config
        ? `SMTP ready (${config.host}:${config.port})`
        : `SMTP not configured, sign-in codes cannot be sent. Missing: ${missing.join(", ")}`,
    };
  },

  /** Used only by automated integration test runner (tests/auth.test.ts) */
  getDevLatestOtp(email: string): string | undefined {
    return _testInbox.get(email.toLowerCase())?.otp;
  },

  /** Used only by automated integration test runner */
  getDevLatestResetUrl(email: string): string | undefined {
    return _testInbox.get(email.toLowerCase())?.resetUrl;
  },

  /** Used only by automated integration test runner */
  getDevLatestDesignTest(email: string): { subject?: string; html?: string } {
    const entry = _testInbox.get(email.toLowerCase());
    return { subject: entry?.designSubject, html: entry?.designHtml };
  },

  /** Used only by automated integration test runner: makes the next send throw */
  failNextSendForTest(): void {
    _testFailNextSend = true;
  },

  clearDevInbox(): void {
    _testInbox.clear();
  },
};
