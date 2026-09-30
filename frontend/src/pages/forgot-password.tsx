import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { forgotPassword } from "@/services/authService";

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function validateEmail(v: string) {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (ex) {
      // Always show "sent" to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Reset password — Falcon</title>
        <meta name="description" content="Reset your Falcon design account password." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .auth-root {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; background: #070709; overflow: hidden;
        }
        .auth-glow {
          position: fixed; top: -15%; left: 50%; transform: translateX(-50%);
          width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .auth-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 40px 36px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .auth-logo {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #f1efe8 0%, #e2ddd4 100%);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #111;
          margin: 0 auto 20px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .auth-title { text-align: center; font-size: 24px; font-weight: 700; color: #f8f8f8; letter-spacing: -0.4px; margin: 0 0 8px; }
        .auth-subtitle { text-align: center; font-size: 14px; color: rgba(255,255,255,0.4); margin: 0 0 32px; line-height: 1.6; }
        .auth-label {
          display: block; font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.5); margin-bottom: 8px;
          letter-spacing: 0.3px; text-transform: uppercase;
        }
        .auth-input {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 13px 16px;
          font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
          color: #f0f0f0; outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.6); background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .auth-input.error { border-color: rgba(239,68,68,0.6); box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .auth-field-error { font-size: 12px; color: #f87171; margin-top: 6px; }
        .auth-btn-primary {
          width: 100%; margin-top: 20px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff; border: none; border-radius: 12px; padding: 14px;
          font-size: 14px; font-weight: 600; font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .auth-btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .auth-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .auth-success-box {
          text-align: center; padding: 8px 0;
        }
        .auth-success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .auth-success-title { font-size: 20px; font-weight: 700; color: #f8f8f8; margin-bottom: 8px; }
        .auth-success-desc { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.6; }
        .auth-back {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; margin-top: 24px; font-size: 13.5px;
          color: rgba(255,255,255,0.4); text-decoration: none; transition: color 0.2s;
        }
        .auth-back:hover { color: rgba(255,255,255,0.8); }
      `}</style>

      <div className="auth-root">
        <div className="auth-glow" />
        <div className="auth-card">
          <Link href="/" className="mb-6 flex flex-col items-center justify-center gap-2.5 group">
            <img
              src="/falcon-logo-white.png"
              alt="Falcon Logo"
              className="h-12 w-12 object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
            />
            <span className="text-sm font-black tracking-[0.2em] font-sans text-cyan-400">
              FALCON
            </span>
          </Link>

          {sent ? (
            <div className="auth-success-box">
              <div className="auth-success-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h1 className="auth-success-title">Check your inbox</h1>
              <p className="auth-success-desc">
                If <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
              </p>
              <Link href="/login" className="auth-back">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Forgot your password?</h1>
              <p className="auth-subtitle">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              {serverError && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 16 }}>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="fp-email" className="auth-label">Email address</label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onBlur={() => setEmailError(validateEmail(email))}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`auth-input${emailError ? " error" : ""}`}
                  aria-invalid={!!emailError}
                />
                {emailError && <p className="auth-field-error" role="alert">⚑ {emailError}</p>}

                <button id="fp-submit" type="submit" disabled={loading} className="auth-btn-primary">
                  {loading ? <><LoadingSpinner /> Sending…</> : "Send reset link"}
                </button>
              </form>

              <Link href="/login" className="auth-back">
                ← Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
