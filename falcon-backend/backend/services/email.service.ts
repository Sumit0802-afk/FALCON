/**
 * email.service.ts
 *
 * Production-ready Email Dispatcher for Falcon Backend
 * Primary Provider: Resend API (HTTP POST to https://api.resend.com/emails)
 * Fallback Provider: SMTP (Nodemailer)
 *
 * Security:
 * - OTP values are never logged in plaintext.
 * - API keys and credentials are never logged or exposed.
 * - Only masked email addresses (e.g. b***3@gmail.com) appear in logs.
 */

import nodemailer, { Transporter } from "nodemailer";

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
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const maskedUser =
    user.length <= 2 ? user[0] + "*" : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

// ─── Active Provider Detection ───────────────────────────────────────────────

type ProviderType = "resend" | "smtp" | "sendgrid" | "none";

function getActiveProvider(): { type: ProviderType; reason?: string } {
  const explicit = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();

  // Primary: Resend API
  if (explicit === "resend" || (!explicit && process.env.RESEND_API_KEY)) {
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_API_KEY.trim()) {
      return {
        type: "none",
        reason: "EMAIL_PROVIDER is set to 'resend', but RESEND_API_KEY is not defined in backend/.env",
      };
    }
    return { type: "resend" };
  }

  // Fallback: SendGrid API
  if (explicit === "sendgrid" || (!explicit && process.env.SENDGRID_API_KEY)) {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.trim()) {
      return {
        type: "none",
        reason: "EMAIL_PROVIDER is set to 'sendgrid', but SENDGRID_API_KEY is not defined in backend/.env",
      };
    }
    return { type: "sendgrid" };
  }

  // Fallback: SMTP
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    return { type: "smtp" };
  }

  return {
    type: "none",
    reason:
      "No email provider credentials found. Please configure EMAIL_PROVIDER=resend and RESEND_API_KEY in backend/.env.",
  };
}

// ─── Nodemailer SMTP Transporter (Fallback) ──────────────────────────────────

let _smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (_smtpTransporter) return _smtpTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) in backend/.env");
  }

  _smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return _smtpTransporter;
}

// ─── Core Email Dispatcher ───────────────────────────────────────────────────

async function dispatchEmail(email: OutgoingEmail): Promise<boolean> {
  const { type, reason } = getActiveProvider();

  if (type === "none") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[email.service] Notice: ${reason}`);
      console.warn(`[email.service] To receive real emails in your inbox, add RESEND_API_KEY to backend/.env`);
      return true;
    }
    console.error(`[email.service] Error: Cannot send email to ${maskEmail(email.to)}: ${reason}`);
    throw new Error(`Email delivery failed: ${reason}`);
  }

  // 1. Resend API (Primary)
  if (type === "resend") {
    const apiKey = process.env.RESEND_API_KEY?.trim()!;
    const from =
      process.env.RESEND_FROM?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      "Falcon Intelligence <onboarding@resend.dev>";

    console.log(`[email.service] Sending email to ${maskEmail(email.to)} via Resend API...`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errMsg = (data as any)?.message || `HTTP ${response.status} from Resend`;
      console.error(`[email.service] Resend API delivery error: ${errMsg}`);
      throw new Error(`Resend email delivery failed: ${errMsg}`);
    }

    console.log(
      `[email.service] Email successfully delivered via Resend to ${maskEmail(email.to)} (id: ${(data as any)?.id})`
    );
    return true;
  }

  // 2. SMTP (Fallback)
  if (type === "smtp") {
    const defaultSender =
      process.env.SMTP_FROM || process.env.SMTP_USER || "security@falcon.design";
    const fromName = email.fromName || "Falcon Intelligence";
    const formattedFrom = defaultSender.includes("<")
      ? defaultSender
      : `"${fromName}" <${defaultSender}>`;

    console.log(`[email.service] Sending email to ${maskEmail(email.to)} via SMTP...`);
    const transporter = getSmtpTransporter();

    try {
      const info = await transporter.sendMail({
        from: formattedFrom,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      console.log(
        `[email.service] Email successfully delivered via SMTP to ${maskEmail(email.to)} (id: ${info.messageId})`
      );
      return true;
    } catch (err: any) {
      console.error(`[email.service] SMTP delivery error: ${err.message}`);
      throw new Error(`SMTP email delivery failed: ${err.message}`);
    }
  }

  // 3. SendGrid API (Fallback)
  if (type === "sendgrid") {
    const apiKey = process.env.SENDGRID_API_KEY?.trim()!;
    const fromEmail = process.env.SENDGRID_FROM?.trim() || "notifications@falcon.design";

    console.log(`[email.service] Sending email to ${maskEmail(email.to)} via SendGrid API...`);

    const sgBody = {
      personalizations: [{ to: [{ email: email.to }] }],
      from: { email: fromEmail.replace(/.*<([^>]+)>.*/, "$1"), name: email.fromName || "Falcon Intelligence" },
      subject: email.subject,
      content: [
        { type: "text/plain", value: email.text },
        { type: "text/html", value: email.html },
      ],
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sgBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[email.service] SendGrid API delivery error: ${errorText}`);
      throw new Error(`SendGrid delivery failed: ${errorText}`);
    }

    console.log(`[email.service] Email successfully delivered via SendGrid to ${maskEmail(email.to)}`);
    return true;
  }

  return false;
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
      <span class="logo-badge">Falcon Intelligence // Security</span>
    </div>
    <h1>Verify your identity</h1>
    <p>Hello ${name},</p>
    <p>A sign-in attempt to your Falcon account requires verification. Use the single-use 6-digit code below to complete authentication.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-label">Verification Code</div>
    </div>
    <div class="meta-box">
      <div class="meta-row">• <strong>Expires in:</strong> ${expiresInMinutes} minutes</div>
      <div class="meta-row">• <strong>Valid for:</strong> 1 sign-in attempt</div>
      <div class="meta-row meta-warning">• <strong>Security alert:</strong> Never share this code with anyone. Falcon will never ask for this code outside of the sign-in screen.</div>
    </div>
  </div>
  <div class="footer">
    Falcon Computational Design Engine • This is an automated security transmission.
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
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Click the button below to choose a new password. This link is single-use and expires in ${expiresInMinutes} minutes.</p>
    <div class="btn-wrap">
      <a href="${resetUrl}" class="btn">Reset Falcon Password</a>
    </div>
    <p style="font-size:12px;color:#64748b;">If you did not request a password reset, you can safely ignore this email.</p>
  </div>
</body>
</html>`;
}

// ─── Automated Test Store (ONLY active when NODE_ENV === 'test') ─────────────
const _testInbox = new Map<string, { otp?: string; resetUrl?: string }>();

// ─── Public API ───────────────────────────────────────────────────────────────

export const emailService = {
  /** Send a 6-digit OTP email to user's real email address */
  async sendOtpEmail(opts: SendOtpOptions): Promise<boolean> {
    const { to, name = "Falcon Creator", otp, expiresInMinutes = 5 } = opts;

    if (process.env.NODE_ENV === "test") {
      _testInbox.set(to.toLowerCase(), { otp });
    }

    return dispatchEmail({
      to,
      fromName: "Falcon Intelligence",
      subject: `${otp} is your Falcon verification code`,
      text: `Hello ${name},\n\nYour Falcon verification code is: ${otp}\n\nThis code will expire in ${expiresInMinutes} minutes. If you did not attempt to sign in, please secure your account.\n\n— Team Falcon`,
      html: otpHtml(name, otp, expiresInMinutes),
    });
  },

  /** Send a password reset link email */
  async sendPasswordResetEmail(opts: SendPasswordResetOptions): Promise<boolean> {
    const { to, name = "Falcon Creator", resetUrl, expiresInMinutes = 15 } = opts;

    if (process.env.NODE_ENV === "test") {
      _testInbox.set(to.toLowerCase(), { resetUrl });
    }

    return dispatchEmail({
      to,
      fromName: "Falcon Security",
      subject: `Reset your Falcon password`,
      text: `Hello ${name},\n\nClick the link below to reset your Falcon password:\n${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.\n\n— Team Falcon`,
      html: passwordResetHtml(name, resetUrl, expiresInMinutes),
    });
  },

  /** Check current email configuration status */
  getConfigStatus(): { type: ProviderType; configured: boolean; details: string } {
    const { type, reason } = getActiveProvider();
    return {
      type,
      configured: type !== "none",
      details: reason || `Email provider active: ${type.toUpperCase()}`,
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

  clearDevInbox(): void {
    _testInbox.clear();
  },
};
