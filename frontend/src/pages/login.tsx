import { FormEvent, useState, useEffect, useRef, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { login, verifyOtp, isAuthenticated } from "@/services/authService";
import { ApiError } from "@/services/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function ArrowRight({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function AlertIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function MailIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateEmail(v: string) {
  if (!v.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password is required";
  return "";
}

// ─── OTP Input Component ──────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
  disabled,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (idx: number, char: string) => {
    const incoming = char.replace(/\D/g, "");
    // Code autofill delivers every digit in a single input event, so spread them across the boxes
    if (incoming.length > 2) {
      const filled = incoming.slice(0, 6);
      onChange(filled);
      inputsRef.current[Math.min(filled.length, 5)]?.focus();
      return;
    }
    const cleaned = incoming.slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = cleaned;
    const next = newDigits.join("");
    onChange(next);
    if (cleaned && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const newDigits = [...digits];
        newDigits[idx - 1] = "";
        onChange(newDigits.join(""));
        inputsRef.current[idx - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[idx] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="otp-grid">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-box${hasError ? " otp-error" : ""}${digits[idx] ? " otp-filled" : ""}`}
          aria-label={`Digit ${idx + 1} of 6`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ─── Redirect ─────────────────────────────────────────────────────────────────
// Only follow in-app paths from ?redirect= so a crafted link can't send users off-site after sign-in
function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
// Match OTP_RESEND_COOLDOWN_SECONDS and OTP_EXPIRY_SECONDS in the backend otp service
const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 300;

// Counts down from the moment start() is called, against a wall-clock deadline
function useCountdown() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  const start = useCallback((durationSeconds: number) => {
    setDeadline(Date.now() + durationSeconds * 1000);
    setSeconds(durationSeconds);
  }, []);

  useEffect(() => {
    if (deadline === null) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return [seconds, start] as const;
}

// ─── Error Messages ───────────────────────────────────────────────────────────
// Maps backend error codes to the copy shown on screen, so raw server or network text is never displayed
function authErrorMessage(err: unknown, invalidInputMessage: string): string {
  if (!(err instanceof ApiError)) {
    return "We couldn't reach Falcon. Check your connection and try again.";
  }
  switch (err.code) {
    case "INVALID_CREDENTIALS":
      return "Incorrect email or password.";
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one to continue.";
    case "OTP_INVALID":
      return err.attemptsRemaining
        ? `Incorrect code. ${err.attemptsRemaining} attempt${err.attemptsRemaining === 1 ? "" : "s"} left.`
        : "Incorrect code. Please check it and try again.";
    case "OTP_ATTEMPTS_EXCEEDED":
      return "Too many incorrect attempts. Request a new code to continue.";
    case "OTP_COOLDOWN":
      return `Please wait ${err.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS} seconds before requesting another code.`;
    case "OTP_RATE_LIMITED":
      return "You've requested too many codes. Please try again later.";
    case "RATE_LIMITED":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "EMAIL_DELIVERY_FAILED":
      return "We couldn't send your verification code. Please try again in a moment.";
  }
  if (err.status === 400) return invalidInputMessage;
  if (err.status === 429) return "Too many attempts. Please wait a few minutes and try again.";
  return "Something went wrong on our end. Please try again.";
}

// ─── Page View Types ──────────────────────────────────────────────────────────
type PageView = "email" | "otp";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<PageView>("email");

  // Credentials step state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  // OTP step state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [expiresLeft, startExpiry] = useCountdown();
  const [cooldownLeft, startCooldown] = useCountdown();

  useEffect(() => {
    setMounted(true);
  }, []);

  // router.query is empty until the router is ready, so wait before reading ?redirect=
  useEffect(() => {
    if (router.isReady && isAuthenticated()) {
      router.replace(safeRedirect(router.query.redirect));
    }
  }, [router.isReady]);

  function showOtpView(expiresInSeconds: number, resendInSeconds: number) {
    startExpiry(expiresInSeconds);
    startCooldown(resendInSeconds);
    setOtp("");
    setOtpError("");
    setView("otp");
  }

  // ── Send OTP ──────────────────────────────────────────────
  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    setSendError("");
    setSendLoading(true);
    try {
      const challenge = await login(email.trim(), password);
      showOtpView(challenge.expiresInSeconds, challenge.resendInSeconds);
    } catch (err) {
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN" && err.retryAfterSeconds) {
        // A code was emailed moments ago and is still valid, so go straight to entering it
        const sentSecondsAgo = RESEND_COOLDOWN_SECONDS - err.retryAfterSeconds;
        showOtpView(OTP_EXPIRY_SECONDS - sentSecondsAgo, err.retryAfterSeconds);
      } else {
        setSendError(authErrorMessage(err, "Enter a valid email address and your password."));
      }
    } finally {
      setSendLoading(false);
    }
  }

  // ── OTP Verify ────────────────────────────────────────────
  async function handleOtpVerify(e: FormEvent) {
    e.preventDefault();
    if (otp.replace(/\D/g, "").length !== 6) {
      setOtpError("Please enter all 6 digits of your verification code.");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      await verifyOtp(email.trim(), otp);
      router.push(safeRedirect(router.query.redirect));
    } catch (err) {
      setOtpError(authErrorMessage(err, "Enter the 6-digit code from your email."));
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  }

  // ── OTP Resend ────────────────────────────────────────────
  async function handleResend() {
    if (cooldownLeft > 0 || resendLoading) return;
    setResendLoading(true);
    setOtpError("");
    try {
      // A resend issues a fresh code and invalidates the previous one
      const challenge = await login(email.trim(), password);
      startExpiry(challenge.expiresInSeconds);
      startCooldown(challenge.resendInSeconds);
      setOtp("");
    } catch (err) {
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN" && err.retryAfterSeconds) {
        startCooldown(err.retryAfterSeconds);
      }
      setOtpError(authErrorMessage(err, "We couldn't resend your code. Please try again."));
    } finally {
      setResendLoading(false);
    }
  }

  function backToEmail() {
    setView("email");
    setOtp("");
    setOtpError("");
    setSendError("");
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Sign in — Falcon</title>
        <meta name="description" content="Sign in to your Falcon design account." />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 24px 16px;
          background: #030507;
          overflow: hidden;
        }

        /* Ambient glow orbs */
        .auth-bg-orb-1 {
          position: fixed;
          top: -180px;
          right: -80px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(47,129,255,0.10) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-bg-orb-2 {
          position: fixed;
          bottom: -120px;
          left: -60px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Subtle grid */
        .auth-bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.024) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Card */
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(8, 11, 18, 0.85);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 36px 36px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.04) inset,
            0 32px 80px rgba(0, 0, 0, 0.65),
            0 0 40px rgba(47, 129, 255, 0.06);
          animation: card-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Brand header */
        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          text-decoration: none;
        }
        .auth-brand-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(255,255,255,0.35));
          transition: transform 0.3s ease;
        }
        .auth-brand:hover .auth-brand-logo { transform: scale(1.06); }
        .auth-brand-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #22D3EE;
          text-transform: uppercase;
        }

        /* Headings */
        .auth-heading {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          color: #f8f8f8;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .auth-sub {
          text-align: center;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .auth-sub-highlight {
          color: rgba(34, 211, 238, 0.8);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        /* Error banner */
        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.28);
          border-radius: 10px;
          padding: 11px 13px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #fca5a5;
          line-height: 1.45;
          animation: fade-in 0.2s ease;
        }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; } }

        /* Field */
        .auth-field { margin-bottom: 14px; }
        .auth-label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 7px;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #f0f0f0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        .auth-input:focus {
          border-color: rgba(47, 129, 255, 0.55);
          background: rgba(47, 129, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(47, 129, 255, 0.12);
        }
        .auth-input.is-error {
          border-color: rgba(239, 68, 68, 0.55);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
        }
        .auth-input.has-toggle { padding-right: 46px; }
        .auth-toggle {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.3);
          padding: 4px;
          display: flex;
          transition: color 0.2s;
          line-height: 0;
        }
        .auth-toggle:hover { color: rgba(255, 255, 255, 0.7); }
        .auth-field-err {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #f87171;
          margin-top: 5px;
        }

        /* Row: remember + forgot */
        .auth-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .auth-link {
          font-size: 12.5px;
          color: rgba(34, 211, 238, 0.75);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s;
        }
        .auth-link:hover { color: #fff; }

        /* Primary button */
        .auth-btn {
          width: 100%;
          background: linear-gradient(135deg, #2F81FF 0%, #1a5fd4 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(47, 129, 255, 0.32);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.1px;
        }
        .auth-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(47, 129, 255, 0.42);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .auth-divider-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }

        /* Footer */
        .auth-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: rgba(255,255,255,0.38);
        }
        .auth-footer a, .auth-footer button {
          color: rgba(255,255,255,0.7);
          text-underline-offset: 2px;
          font-weight: 500;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
          transition: color 0.2s;
        }
        .auth-footer a:hover, .auth-footer button:hover { color: #fff; }

        /* ── OTP Screen ── */
        .otp-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(47, 129, 255, 0.1);
          border: 1px solid rgba(47, 129, 255, 0.25);
          color: #22D3EE;
          margin: 0 auto 20px;
          box-shadow: 0 0 24px rgba(47, 129, 255, 0.14);
        }
        .otp-grid {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin: 24px 0 20px;
        }
        .otp-box {
          width: 46px;
          height: 56px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: #f8f8f8;
          font-size: 22px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          cursor: text;
          appearance: textfield;
          -moz-appearance: textfield;
        }
        .otp-box:focus {
          border-color: rgba(47, 129, 255, 0.7);
          background: rgba(47, 129, 255, 0.07);
          box-shadow: 0 0 0 3px rgba(47, 129, 255, 0.15);
        }
        .otp-box.otp-filled {
          border-color: rgba(34, 211, 238, 0.45);
          background: rgba(34, 211, 238, 0.05);
          color: #22D3EE;
        }
        .otp-box.otp-error {
          border-color: rgba(239, 68, 68, 0.55) !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08) !important;
          color: #fca5a5 !important;
        }
        .otp-box:disabled { opacity: 0.45; cursor: not-allowed; }
        .otp-box::-webkit-outer-spin-button,
        .otp-box::-webkit-inner-spin-button { -webkit-appearance: none; }

        /* Timer & resend */
        .otp-timer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.38);
        }
        .otp-timer { font-family: 'JetBrains Mono', monospace; color: rgba(255,255,255,0.5); }
        .otp-timer.urgent { color: #f87171; }
        .otp-resend {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12.5px;
          font-family: inherit;
          color: rgba(47, 129, 255, 0.8);
          padding: 0;
          transition: color 0.2s;
        }
        .otp-resend:disabled { color: rgba(255,255,255,0.22); cursor: not-allowed; }
        .otp-resend:not(:disabled):hover { color: #22D3EE; }

        /* Back arrow */
        .auth-back {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          color: rgba(255,255,255,0.38);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.06em;
          padding: 0;
          margin-bottom: 24px;
          transition: color 0.2s;
          text-transform: uppercase;
        }
        .auth-back:hover { color: rgba(255,255,255,0.75); }
        .auth-back svg { flex-shrink: 0; }

        /* Spinner */
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .auth-card { padding: 32px 20px 28px; }
          .otp-box { width: 40px; height: 50px; font-size: 18px; }
          .otp-grid { gap: 6px; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-bg-grid" aria-hidden="true" />
        <div className="auth-bg-orb-1" aria-hidden="true" />
        <div className="auth-bg-orb-2" aria-hidden="true" />

        <div className="auth-card" role="main">
        {/* ── EMAIL VIEW ─────────────────────────────────────── */}
        {view === "email" && (
          <>
            <Link href="/" className="auth-brand" aria-label="Back to Falcon home">
              <img src="/falcon-logo-white.png" alt="Falcon" className="auth-brand-logo" />
              <span className="auth-brand-name">FALCON</span>
            </Link>

            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-sub">Sign in with your email and password. We&apos;ll email you a one-time code</p>

            {sendError && (
              <div className="auth-error" role="alert">
                <AlertIcon />
                <span>{sendError}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} noValidate>
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onBlur={() => setEmailError(validateEmail(email))}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`auth-input${emailError ? " is-error" : ""}`}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "em-err" : undefined}
                  />
                </div>
                {emailError && (
                  <p id="em-err" className="auth-field-err" role="alert">
                    <AlertIcon size={12} /> {emailError}
                  </p>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="login-password" className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    onBlur={() => setPasswordError(validatePassword(password))}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`auth-input has-toggle${passwordError ? " is-error" : ""}`}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "pw-err" : undefined}
                  />
                  <button
                    type="button"
                    className="auth-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {passwordError && (
                  <p id="pw-err" className="auth-field-err" role="alert">
                    <AlertIcon size={12} /> {passwordError}
                  </p>
                )}
              </div>

              <div className="auth-row">
                <Link href="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button id="login-submit" type="submit" disabled={sendLoading} className="auth-btn">
                {sendLoading ? <><SpinnerIcon /> Sending code…</> : <>Send OTP <ArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: 24 }}>
              Don&apos;t have an account?{" "}
              <Link href="/register">Create one free</Link>
            </div>
          </>
        )}

        {/* ── OTP VIEW ───────────────────────────────────────── */}
        {view === "otp" && (
          <>
            <button className="auth-back" onClick={backToEmail}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <div className="otp-icon-wrap" aria-hidden="true">
              <MailIcon />
            </div>

            <h1 className="auth-heading">Check your email</h1>
            <p className="auth-sub">
              We&apos;ve sent a verification code to your email
              <br />
              <span className="auth-sub-highlight">{email.trim()}</span>
            </p>

            {otpError && (
              <div className="auth-error" role="alert">
                <AlertIcon /> <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleOtpVerify} noValidate>
              <OtpInput
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(""); }}
                disabled={otpLoading}
                hasError={!!otpError}
              />

              <div className="otp-timer-row">
                <span className={`otp-timer${expiresLeft <= 30 && expiresLeft > 0 ? " urgent" : ""}`}>
                  {expiresLeft > 0 ? `Expires in ${Math.floor(expiresLeft / 60)}:${String(expiresLeft % 60).padStart(2, "0")}` : "Code expired"}
                </span>
                <button
                  type="button"
                  className="otp-resend"
                  disabled={cooldownLeft > 0 || resendLoading}
                  onClick={handleResend}
                >
                  {resendLoading ? "Sending…" : cooldownLeft > 0 ? `Resend OTP in ${cooldownLeft}s` : "Resend OTP"}
                </button>
              </div>

              <button
                id="otp-submit"
                type="submit"
                disabled={otpLoading || otp.replace(/\D/g, "").length !== 6}
                className="auth-btn"
                style={{ marginTop: 20 }}
              >
                {otpLoading ? <><SpinnerIcon /> Verifying…</> : <>Verify &amp; Sign in <ArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer">
              Wrong email?{" "}
              <button onClick={backToEmail}>
                Use a different one
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </>
  );
}
