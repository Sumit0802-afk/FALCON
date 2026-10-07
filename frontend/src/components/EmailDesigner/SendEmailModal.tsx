import React, { useState, useEffect } from "react";
import { EmailDesign } from "@/types/email";
import { exportEmailHtml } from "@/utils/emailUtils";
import { ApiError } from "@/services/api";
import { parseRecipients, sendDesignEmail } from "@/services/emailTemplateService";

const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Turns a failed send into a message that tells the user what to do next. */
function sendErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Please sign in to send emails.";
    if (err.status === 429) return "You've sent several emails in a short time. Please wait a few minutes and try again.";
    if (err.code === "EMAIL_DELIVERY_FAILED") return "The mail server did not accept the email. Please try again in a moment.";
    if (err.status === 400) return err.message.replace(/^[a-z.0-9]+: /i, "");
    return "Something went wrong on our end. Please try again.";
  }
  return "We couldn't reach Falcon. Check your connection and try again.";
}

interface SendEmailModalProps {
  design: EmailDesign;
  onClose: () => void;
}

type ModalView = "form" | "sending" | "success" | "error";

export default function SendEmailModal({ design, onClose }: SendEmailModalProps) {
  const [view, setView] = useState<ModalView>("form");

  // Form fields prefilled from existing email settings
  const [fromName, setFromName] = useState(design.settings.senderName || "Falcon Studio");
  const [fromEmail, setFromEmail] = useState(design.settings.replyTo || "");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(design.settings.subject || "Falcon Email Design");
  const [testEmail, setTestEmail] = useState("");

  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  // Test send states
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Main send result message & error
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Generated email HTML
  const emailHtml = exportEmailHtml(design);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view !== "sending") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, view]);

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setTestResult({ success: false, message: "Please enter a test recipient email address." });
      return;
    }

    try {
      setTestSending(true);
      setTestResult(null);

      const recipients = parseRecipients(testEmail);
      if (!recipients.length || recipients.some((r) => !VALID_EMAIL.test(r))) {
        setTestResult({ success: false, message: "Please enter a valid test email address." });
        return;
      }
      await sendDesignEmail({
        to: recipients,
        subject: `[TEST] ${subject.trim() || "Falcon email"}`,
        html: emailHtml,
        fromName: fromName.trim() || undefined,
        replyTo: VALID_EMAIL.test(fromEmail.trim()) ? fromEmail.trim() : undefined,
      });
      setTestResult({ success: true, message: `Test email sent to ${recipients.join(", ")}.` });
    } catch (err) {
      setTestResult({ success: false, message: sendErrorMessage(err) });
    } finally {
      setTestSending(false);
    }
  };

  // Send main email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!to.trim()) {
      setErrorMessage("Please enter at least one recipient email address.");
      return;
    }

    const toList = parseRecipients(to);
    const ccList = parseRecipients(cc);
    const bccList = parseRecipients(bcc);
    const invalid = [...toList, ...ccList, ...bccList].find((r) => !VALID_EMAIL.test(r));
    if (invalid) {
      setErrorMessage(`"${invalid}" is not a valid email address.`);
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject.");
      return;
    }

    setView("sending");
    setErrorMessage("");

    try {
      const result = await sendDesignEmail({
        to: toList,
        cc: ccList.length ? ccList : undefined,
        bcc: bccList.length ? bccList : undefined,
        subject: subject.trim(),
        html: emailHtml,
        fromName: fromName.trim() || undefined,
        replyTo: VALID_EMAIL.test(fromEmail.trim()) ? fromEmail.trim() : undefined,
      });
      setStatusMessage(result.message || "Your email has been sent to the selected recipients.");
      setView("success");
    } catch (err) {
      setErrorMessage(sendErrorMessage(err));
      setView("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4"
      style={{ backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && view !== "sending") onClose();
      }}
    >
      <div className="flex w-[820px] max-w-[96vw] max-h-[92vh] flex-col rounded-2xl border border-white/[0.08] bg-[#09090b] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c0e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D084]/15 font-mono text-[14px] font-bold text-[#00D084]">
              ✉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold tracking-tight text-white">Send Email</h2>
                <span className="rounded-full border border-[#00D084]/40 bg-[#00D084]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#00D084]">
                  Production Dispatcher
                </span>
              </div>
              <p className="text-[12px] text-zinc-400">
                Send this design directly to your recipients.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={view === "sending"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        {/* ─── SUCCESS VIEW ──────────────────────────────────────────────── */}
        {view === "success" && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D084]/20 text-[#00D084]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-white">Email sent successfully</h3>
            <p className="mt-2 max-w-[420px] text-[13px] text-zinc-400">
              {statusMessage || "Your email has been delivered to the selected recipients."}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Back to Editor
              </button>
              <button
                type="button"
                onClick={() => {
                  setTo("");
                  setView("form");
                }}
                className="rounded-lg bg-[#00D084] px-5 py-2.5 text-[12px] font-semibold text-black transition-colors hover:bg-[#00b872]"
              >
                Send Another
              </button>
            </div>
          </div>
        )}

        {/* ─── ERROR VIEW ────────────────────────────────────────────────── */}
        {view === "error" && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-white">Email could not be sent</h3>
            <p className="mt-2 max-w-[460px] text-[13px] text-red-300">
              {errorMessage || "Unable to deliver email. Please check recipient addresses or server credentials."}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView("form")}
                className="rounded-lg bg-[#00D084] px-6 py-2.5 text-[12px] font-semibold text-black transition-colors hover:bg-[#00b872]"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Back to Editor
              </button>
            </div>
          </div>
        )}

        {/* ─── SENDING VIEW ──────────────────────────────────────────────── */}
        {view === "sending" && (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <svg className="mb-4 h-12 w-12 animate-spin text-[#00D084]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <h3 className="text-[18px] font-bold text-white">Sending...</h3>
            <p className="mt-1 text-[13px] text-zinc-400">
              Delivering your email design to recipients via configured email service.
            </p>
          </div>
        )}

        {/* ─── FORM VIEW ─────────────────────────────────────────────────── */}
        {view === "form" && (
          <>
            {/* View tabs: Compose vs Email Preview */}
            <div className="flex shrink-0 border-b border-white/[0.06] bg-[#070709] px-6">
              <button
                type="button"
                onClick={() => setActiveTab("compose")}
                className={`py-3 text-[12px] font-semibold transition-colors mr-6 border-b-2 ${
                  activeTab === "compose"
                    ? "border-[#00D084] text-[#00D084]"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                1. Recipient &amp; Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`py-3 text-[12px] font-semibold transition-colors border-b-2 ${
                  activeTab === "preview"
                    ? "border-[#00D084] text-[#00D084]"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                2. Email Preview Before Sending
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "compose" && (
                <form id="send-email-form" onSubmit={handleSendEmail} className="space-y-4">
                  {/* From Section */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Sender Name
                      </label>
                      <input
                        type="text"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                        placeholder="Falcon Studio"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Reply-To (optional)
                      </label>
                      <input
                        type="email"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        placeholder="Replies go to your account email"
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Subject Line (from Email Settings)
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject of your email..."
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                    />
                  </div>

                  {/* To (Multiple recipients) */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        To (Recipient Email)
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        Separate multiple emails with commas
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="client@example.com, team@falcon.io"
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                    />
                  </div>

                  {/* CC & BCC Optional */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        CC (Optional)
                      </label>
                      <input
                        type="text"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        placeholder="cc@example.com"
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[12px] text-zinc-300 placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        BCC (Optional)
                      </label>
                      <input
                        type="text"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        placeholder="bcc@example.com"
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[12px] text-zinc-300 placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                      />
                    </div>
                  </div>

                  {/* ── Test Email Quick Panel ── */}
                  <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-zinc-300">
                        Send Test Email
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Test rendering &amp; delivery safely
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter test email address..."
                        className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[12px] text-white placeholder-zinc-600 outline-none focus:border-[#00D084]/40"
                      />
                      <button
                        type="button"
                        onClick={handleSendTest}
                        disabled={testSending || !testEmail.trim()}
                        className="flex items-center gap-1.5 rounded-lg border border-[#00D084]/50 bg-[#00D084]/15 px-4 py-2 text-[12px] font-semibold text-[#00D084] transition-colors hover:bg-[#00D084]/25 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {testSending ? "Sending..." : "Send Test Email"}
                      </button>
                    </div>

                    {testResult && (
                      <div
                        className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] ${
                          testResult.success
                            ? "bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/30"
                            : "bg-red-500/10 text-red-300 border border-red-500/30"
                        }`}
                      >
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Email Preview Tab */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  {/* Meta summary card */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-[12px] text-zinc-400 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300 w-16">From:</span>
                      <span className="text-zinc-200">{fromName}{fromEmail ? ` (replies to ${fromEmail})` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300 w-16">To:</span>
                      <span className="text-zinc-200">{to || "(No recipient specified yet)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-300 w-16">Subject:</span>
                      <span className="text-white font-medium">{subject}</span>
                    </div>
                  </div>

                  {/* Sandboxed Iframe Preview */}
                  <div className="rounded-xl border border-white/[0.08] bg-white p-2 shadow-inner">
                    <iframe
                      title="Email Preview"
                      srcDoc={emailHtml}
                      sandbox="allow-same-origin"
                      className="h-[360px] w-full rounded border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0c0c0e] px-6 py-4">
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D084]" />
                Server credentials are encrypted &amp; kept server-side
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/[0.1] px-4 py-2 text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "compose") {
                      setActiveTab("preview");
                    } else {
                      const form = document.getElementById("send-email-form") as HTMLFormElement;
                      if (form) form.requestSubmit();
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg bg-[#00D084] px-5 py-2 text-[12px] font-bold text-black shadow-lg transition-all hover:bg-[#00b872] active:scale-[0.98]"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 208, 132, 0.35)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {activeTab === "compose" ? "Review & Send Email" : "Send Email Now"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
