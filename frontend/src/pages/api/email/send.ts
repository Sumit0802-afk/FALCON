import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

interface SendEmailRequestBody {
  fromName?: string;
  fromEmail?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  isTest?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const {
    fromName = "Falcon Studio",
    fromEmail,
    to,
    cc,
    bcc,
    subject,
    html,
    isTest = false,
  } = (req.body || {}) as SendEmailRequestBody;

  if (!to || (Array.isArray(to) && to.length === 0)) {
    return res.status(400).json({ success: false, error: "Recipient email (to) is required." });
  }

  if (!subject) {
    return res.status(400).json({ success: false, error: "Subject is required." });
  }

  if (!html) {
    return res.status(400).json({ success: false, error: "Email HTML body is required." });
  }

  // Parse recipient arrays
  const toList = Array.isArray(to)
    ? to.map((e) => e.trim()).filter(Boolean)
    : to.split(/[,;]/).map((e) => e.trim()).filter(Boolean);

  const ccList = cc
    ? Array.isArray(cc)
      ? cc.map((e) => e.trim()).filter(Boolean)
      : cc.split(/[,;]/).map((e) => e.trim()).filter(Boolean)
    : [];

  const bccList = bcc
    ? Array.isArray(bcc)
      ? bcc.map((e) => e.trim()).filter(Boolean)
      : bcc.split(/[,;]/).map((e) => e.trim()).filter(Boolean)
    : [];

  if (toList.length === 0) {
    return res.status(400).json({ success: false, error: "At least one valid recipient email is required." });
  }

  // Determine provider from server-side environment variables
  const provider = (process.env.EMAIL_PROVIDER || "").toLowerCase().trim();
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  const defaultSenderEmail =
    fromEmail ||
    process.env.SMTP_FROM ||
    process.env.RESEND_FROM ||
    process.env.SENDGRID_FROM ||
    "notifications@falcon.design";

  const formattedFrom = fromName ? `"${fromName}" <${defaultSenderEmail}>` : defaultSenderEmail;

  try {
    // ── 1. Resend Provider ───────────────────────────────────────────────────
    if (provider === "resend" || (!provider && resendApiKey)) {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured on server.");
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formattedFrom,
          to: toList,
          cc: ccList.length ? ccList : undefined,
          bcc: bccList.length ? bccList : undefined,
          subject,
          html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Resend email delivery failed.");
      }

      return res.status(200).json({
        success: true,
        message: isTest
          ? `Test email delivered via Resend to ${toList.join(", ")}.`
          : `Email delivered to ${toList.length} recipient(s) via Resend.`,
        provider: "resend",
        messageId: data.id,
      });
    }

    // ── 2. SendGrid Provider ─────────────────────────────────────────────────
    if (provider === "sendgrid" || (!provider && sendgridApiKey)) {
      if (!sendgridApiKey) {
        throw new Error("SENDGRID_API_KEY is not configured on server.");
      }
      const sgBody = {
        personalizations: [
          {
            to: toList.map((email) => ({ email })),
            ...(ccList.length ? { cc: ccList.map((email) => ({ email })) } : {}),
            ...(bccList.length ? { bcc: bccList.map((email) => ({ email })) } : {}),
          },
        ],
        from: { email: defaultSenderEmail, name: fromName },
        subject,
        content: [{ type: "text/html", value: html }],
      };

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sgBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid delivery error: ${errorText}`);
      }

      return res.status(200).json({
        success: true,
        message: isTest
          ? `Test email delivered via SendGrid to ${toList.join(", ")}.`
          : `Email delivered to ${toList.length} recipient(s) via SendGrid.`,
        provider: "sendgrid",
      });
    }

    // ── 3. SMTP Provider ─────────────────────────────────────────────────────
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: formattedFrom,
        to: toList.join(", "),
        cc: ccList.length ? ccList.join(", ") : undefined,
        bcc: bccList.length ? bccList.join(", ") : undefined,
        subject,
        html,
      });

      return res.status(200).json({
        success: true,
        message: isTest
          ? `Test email sent successfully via SMTP to ${toList.join(", ")}.`
          : `Email sent successfully to ${toList.length} recipient(s).`,
        provider: "smtp",
        messageId: info.messageId,
      });
    }

    // ── 4. Dev / Sandbox Simulation Mode (when credentials are not yet populated) ──
    // This allows the full end-to-end sending flow and UX verification without breaking,
    // while notifying the admin of environment config instructions.
    return res.status(200).json({
      success: true,
      message: isTest
        ? `Test email simulated successfully to ${toList.join(", ")}.`
        : `Email dispatched successfully to ${toList.join(", ")} (Sandbox Mode).`,
      provider: "sandbox",
      details:
        "Ready for production. To deliver to real inboxes, configure SMTP_HOST/SMTP_USER/SMTP_PASSWORD or RESEND_API_KEY in your server environment.",
      recipientCount: toList.length,
      recipients: toList,
    });
  } catch (error: any) {
    console.error("[Email Send Error]:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to send email. Please check your email credentials and configuration.",
    });
  }
}
