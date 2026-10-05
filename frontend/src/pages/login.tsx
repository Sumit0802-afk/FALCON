import { FormEvent, useState, useEffect, useRef, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { login, verifyOtp, resendOtp, register, MfaChallenge, isAuthenticated } from "@/services/authService";

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
function ShieldIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
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
    const cleaned = char.replace(/\D/g, "").slice(-1);
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
          maxLength={1}
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

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number, active: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!active) return;
    setSeconds(initialSeconds);
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, initialSeconds]);

  return seconds;
}

// ─── Page View Types ──────────────────────────────────────────────────────────
type PageView = "login" | "otp" | "forgot";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<PageView>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // OTP state
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendActive, setResendActive] = useState(true);
  const cooldownLeft = useCountdown(resendCooldown, resendActive);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      const redirect = (router.query.redirect as string) || "/";
      router.replace(redirect);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setLoginErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoginError("");
    setLoginLoading(true);
    try {
      const challenge = await login(email, password);
      setMfaChallenge(challenge);
      setResendCooldown(challenge.expiresInSeconds > 60 ? 60 : challenge.expiresInSeconds);
      setResendActive(true);
      setView("otp");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoginLoading(false);
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
      await verifyOtp(mfaChallenge!.mfaToken, otp);
      const destination = (router.query.redirect as string) || "/";
      router.push(destination);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      setOtp("");
    } finally {
      setOtpLoading(false);
    }
  }

  // ── OTP Resend ────────────────────────────────────────────
  async function handleResend() {
    if (cooldownLeft > 0 || !mfaChallenge) return;
    setResendLoading(true);
    setOtpError("");
    try {
      const res = await resendOtp(mfaChallenge.mfaToken);
      setResendCooldown(res.cooldownSeconds);
      setResendActive(false);
      setTimeout(() => setResendActive(true), 10);
      setOtp("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }


  // ── Forgot Password ───────────────────────────────────────
  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(forgotEmail);
    if (err) { setForgotError(err); return; }
    setForgotError("");
    setForgotLoading(true);
    try {
      await (await import("@/services/authService")).forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
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
        {/* ── LOGIN VIEW ─────────────────────────────────────── */}
        {view === "login" && (
          <>
            <Link href="/" className="auth-brand" aria-label="Back to Falcon home">
              <img src="/falcon-logo-white.png" alt="Falcon" className="auth-brand-logo" />
              <span className="auth-brand-name">FALCON</span>
            </Link>

            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-sub">Sign in to continue creating with Falcon</p>

            {loginError && (
              <div className="auth-error" role="alert">
                <AlertIcon />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLoginErrors((p) => ({ ...p, email: "" })); }}
                    onBlur={() => setLoginErrors((p) => ({ ...p, email: validateEmail(email) }))}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`auth-input${loginErrors.email ? " is-error" : ""}`}
                    aria-invalid={!!loginErrors.email}
                    aria-describedby={loginErrors.email ? "em-err" : undefined}
                  />
                </div>
                {loginErrors.email && (
                  <p id="em-err" className="auth-field-err" role="alert">
                    <AlertIcon size={12} /> {loginErrors.email}
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
                    onChange={(e) => { setPassword(e.target.value); setLoginErrors((p) => ({ ...p, password: "" })); }}
                    onBlur={() => setLoginErrors((p) => ({ ...p, password: validatePassword(password) }))}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`auth-input has-toggle${loginErrors.password ? " is-error" : ""}`}
                    aria-invalid={!!loginErrors.password}
                    aria-describedby={loginErrors.password ? "pw-err" : undefined}
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
                {loginErrors.password && (
                  <p id="pw-err" className="auth-field-err" role="alert">
                    <AlertIcon size={12} /> {loginErrors.password}
                  </p>
                )}
              </div>

              <div className="auth-row">
                <button type="button" className="auth-link" onClick={() => setView("forgot")}>
                  Forgot password?
                </button>
              </div>

              <button id="login-submit" type="submit" disabled={loginLoading} className="auth-btn">
                {loginLoading ? <><SpinnerIcon /> Verifying…</> : <>Sign in to Falcon <ArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer" style={{ marginTop: 24 }}>
              Don&apos;t have an account?{" "}
              <Link href="/register">Create one free</Link>
            </div>
          </>
        )}

        {/* ── OTP VIEW ───────────────────────────────────────── */}
        {view === "otp" && mfaChallenge && (
          <>
            <button className="auth-back" onClick={() => { setView("login"); setOtp(""); setOtpError(""); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <div className="otp-icon-wrap" aria-hidden="true">
              <ShieldIcon />
            </div>

            <h1 className="auth-heading">Verify your identity</h1>
            <p className="auth-sub">
              Enter the 6-digit code sent to{" "}
              <span className="auth-sub-highlight">{mfaChallenge.email}</span>
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
                <span className={`otp-timer${cooldownLeft <= 30 && cooldownLeft > 0 ? " urgent" : ""}`}>
                  {cooldownLeft > 0 ? `Expires in ${Math.floor(cooldownLeft / 60)}:${String(cooldownLeft % 60).padStart(2, "0")}` : "Code expired"}
                </span>
                <button
                  type="button"
                  className="otp-resend"
                  disabled={cooldownLeft > 0 || resendLoading}
                  onClick={handleResend}
                >
                  {resendLoading ? "Sending…" : cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code"}
                </button>
              </div>

              <button
                id="otp-submit"
                type="submit"
                disabled={otpLoading || otp.replace(/\D/g, "").length !== 6}
                className="auth-btn"
                style={{ marginTop: 20 }}
              >
                {otpLoading ? <><SpinnerIcon /> Verifying…</> : <>Confirm & Continue <ArrowRight /></>}
              </button>
            </form>

            <div className="auth-footer">
              Wrong account?{" "}
              <button onClick={() => { setView("login"); setOtp(""); setOtpError(""); }}>
                Sign in differently
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD VIEW ────────────────────────────── */}
        {view === "forgot" && (
          <>
            <button className="auth-back" onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back to sign in
            </button>

            {!forgotSent ? (
              <>
                <div className="otp-icon-wrap" aria-hidden="true">
                  <MailIcon />
                </div>

                <h1 className="auth-heading">Reset password</h1>
                <p className="auth-sub">
                  Enter your email address and we&apos;ll send you a secure reset link.
                </p>

                {forgotError && (
                  <div className="auth-error" role="alert">
                    <AlertIcon /> <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgot} noValidate>
                  <div className="auth-field">
                    <label htmlFor="forgot-email" className="auth-label">Email address</label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(""); }}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`auth-input${forgotError ? " is-error" : ""}`}
                    />
                  </div>

                  <button type="submit" disabled={forgotLoading} className="auth-btn" style={{ marginTop: 8 }}>
                    {forgotLoading ? <><SpinnerIcon /> Sending…</> : <>Send reset link <ArrowRight /></>}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div className="otp-icon-wrap" aria-hidden="true" style={{ margin: "0 auto 20px" }}>
                  <MailIcon />
                </div>
                <h2 className="auth-heading">Check your inbox</h2>
                <p className="auth-sub" style={{ marginBottom: 0 }}>
                  If an account with <span className="auth-sub-highlight">{forgotEmail}</span> exists,
                  we&apos;ve sent a secure reset link that expires in 15 minutes.
                </p>
                <button
                  style={{ marginTop: 28 }}
                  className="auth-btn"
                  onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                >
                  Return to sign in
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
}
