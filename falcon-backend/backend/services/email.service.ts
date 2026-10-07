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
import { EmailAttachment, snapshotEmail } from "./emailSnapshot";

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
  /** Pictures the HTML refers to by content id */
  attachments?: EmailAttachment[];
}

/**
 * The body of a designed email as it will be sent. A design sent with its effects
 * is drawn by a browser so it arrives exactly as made; if that cannot be done,
 * or it was not asked for, the design goes as HTML with its styles inlined.
 */
async function designBody(html: string, subject: string, asPicture: boolean | undefined, fallbackText: string) {
  if (asPicture && process.env.NODE_ENV !== "test") {
    try {
      const shot = await snapshotEmail(html, subject);
      return { html: shot.html, text: shot.text, attachments: shot.attachments, picture: true };
    } catch (err: any) {
      console.error(`[email.service] Could not draw the design effects (${err?.name || "Error"}); sending it without them`);
    }
  }
  // Mail clients drop stylesheets, so the styles travel on the elements themselves
  return { html: inlineEmailStyles(html), text: fallbackText, attachments: undefined, picture: false };
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
    attachments: email.attachments?.map((a) => ({ ...a, contentDisposition: "inline" as const })),
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

function otpHtml(name: string, otp: string, expiresInMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Falcon Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #05070a; color: #f4f1eb; margin: 0; padding: 32px 16px; }
    .container { max-width: 520px; margin: 0 auto; background: #0a0e14; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 40px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .logo-badge { display: inline-block; background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.3); border-radius: 6px; padding: 6px 14px; font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: #22d3ee; margin-bottom: 24px; text-transform: uppercase; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px; letter-spacing: -0.02em; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px; }
    .otp-box { background: #020408; border: 1px solid rgba(34,211,238,0.35); border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-code { font-family: 'SF Mono', Consolas, Menlo, Monaco, monospace; font-size: 38px; font-weight: 800; letter-spacing: 0.35em; color: #22d3ee; padding-left: 0.35em; display: inline-block; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin-top: 8px; font-weight: 600; }
    .meta-box { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin-top: 28px; }
    .meta-row { font-size: 12px; color: #64748b; line-height: 1.6; margin: 4px 0; }
    .meta-warning { color: #f59e0b; }
    .footer { text-align: center; font-size: 11px; color: #475569; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <span class="logo-badge">Falcon // Security</span>
    </div>
    <h1>Your Falcon verification code</h1>
    <p>Hello ${escapeHtml(name)},</p>
    <p>Use the code below to sign in to Falcon.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-label">Verification Code</div>
    </div>
    <div class="meta-box">
      <div class="meta-row">• This code expires in ${expiresInMinutes} minutes and can be used once.</div>
      <div class="meta-row">• If you did not request this code, you can safely ignore this email.</div>
      <div class="meta-row meta-warning">• Never share this code with anyone. Falcon will never ask for it outside of the sign-in screen.</div>
    </div>
  </div>
  <div class="footer">
    Falcon • This is an automated security message.
  </div>
</body>
</html>`;
}

function passwordResetHtml(name: string, resetUrl: string, expiresInMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset your Falcon password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #05070a; color: #f4f1eb; margin: 0; padding: 32px 16px; }
    .container { max-width: 500px; margin: 0 auto; background: #0a0e14; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px 32px; }
    .logo { font-weight: 800; letter-spacing: 0.25em; color: #22d3ee; font-size: 13px; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    p { font-size: 14px; line-height: 1.6; color: #8b8f98; margin: 0 0 24px; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { background: #2f81ff; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">FALCON // INTELLIGENCE</div>
    <h1>Password Reset Request</h1>
    <p>Hello ${escapeHtml(name)},</p>
    <p>We received a request to reset your password. Click the button below to choose a new password. This link is single-use and expires in ${expiresInMinutes} minutes.</p>
    <div class="btn-wrap">
      <a href="${escapeHtml(resetUrl)}" class="btn">Reset Falcon Password</a>
    </div>
    <p style="font-size:12px;color:#64748b;">If you did not request a password reset, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const emailService = {
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
      subject: "Your Falcon verification code",
      text: `Your Falcon verification code is ${otp}\n\nThis code expires in ${expiresInMinutes} minutes.\n\nIf you did not request this code, you can safely ignore this email.`,
      html: otpHtml(name, otp, expiresInMinutes),
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
      text: `Hello ${name},\n\nClick the link below to reset your Falcon password:\n${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.\n\n— Team Falcon`,
      html: passwordResetHtml(name, resetUrl, expiresInMinutes),
    });
  },

  /** Send a rendered email design to its author as a test */
  async sendDesignTest(opts: { to: string; subject: string; html: string; asPicture?: boolean }): Promise<{ picture: boolean }> {
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
      attachments: body.attachments,
    });
    return { picture: body.picture };
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
  }): Promise<{ picture: boolean }> {
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
      attachments: body.attachments,
    });
    return { picture: body.picture };
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
