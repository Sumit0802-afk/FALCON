import { FormEvent, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resetPassword } from "@/services/authService";

function SpinnerIcon() {
  return (
    <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function validate(): string {
    if (!newPassword) return "New password is required";
    if (newPassword.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(newPassword)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(newPassword)) return "Password must contain at least one number";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    if (!token || typeof token !== "string") { setError("Invalid reset link. Please request a new one."); return; }

    setError("");
    setLoading(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Reset password — Falcon</title>
        <meta name="description" content="Set a new password for your Falcon account." />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #030507; }
        .rp-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: #030507;
          position: relative;
          overflow: hidden;
        }
        .rp-grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.024) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .rp-orb {
          position: fixed; top: -150px; right: -80px;
          width: 550px; height: 550px; border-radius: 50%;
          background: radial-gradient(circle, rgba(47,129,255,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .rp-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 420px;
          background: rgba(8, 11, 18, 0.85);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 40px 36px 36px;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.65);
          animation: rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; } }
        .rp-brand { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 28px; text-decoration: none; }
        .rp-brand img { width: 42px; height: 42px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
        .rp-brand-name { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.3em; color: #22D3EE; text-transform: uppercase; }
        h1 { text-align: center; font-size: 22px; font-weight: 700; color: #f8f8f8; letter-spacing: -0.4px; margin-bottom: 6px; }
        .rp-sub { text-align: center; font-size: 13.5px; color: rgba(255,255,255,0.4); margin-bottom: 28px; line-height: 1.5; }
        .rp-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 7px; }
        .rp-input-wrap { position: relative; margin-bottom: 14px; }
        .rp-input {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 12px 46px 12px 14px; font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif; color: #f0f0f0; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .rp-input::placeholder { color: rgba(255,255,255,0.2); }
        .rp-input:focus { border-color: rgba(47,129,255,0.55); background: rgba(47,129,255,0.05); box-shadow: 0 0 0 3px rgba(47,129,255,0.12); }
        .rp-toggle { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3); padding: 4px; display: flex; transition: color 0.2s; }
        .rp-toggle:hover { color: rgba(255,255,255,0.7); }
        .rp-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.28); border-radius: 10px; padding: 11px 13px; margin-bottom: 18px; font-size: 13px; color: #fca5a5; }
        .rp-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.28); border-radius: 10px; padding: 16px; text-align: center; color: #86efac; font-size: 14px; line-height: 1.5; }
        .rp-btn {
          width: 100%; background: linear-gradient(135deg, #2F81FF, #1a5fd4);
          color: #fff; border: none; border-radius: 10px; padding: 13px;
          font-size: 14px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(47,129,255,0.32);
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 8px;
        }
        .rp-btn:hover:not(:disabled) { opacity: 0.93; transform: translateY(-1px); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .rp-req-list { list-style: none; font-size: 12px; color: rgba(255,255,255,0.38); margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 6px; }
        .rp-req-list li { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 3px 9px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; }
        .rp-footer { text-align: center; margin-top: 22px; font-size: 13px; color: rgba(255,255,255,0.38); }
        .rp-footer a { color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .rp-footer a:hover { color: #fff; }
      `}</style>

      <div className="rp-grid" aria-hidden="true" />
      <div className="rp-orb" aria-hidden="true" />

      <div className="rp-card" role="main">
        <Link href="/" className="rp-brand">
          <img src="/falcon-logo-white.png" alt="Falcon" />
          <span className="rp-brand-name">FALCON</span>
        </Link>

        <h1>Set new password</h1>
        <p className="rp-sub">Choose a strong password for your Falcon account.</p>

        {!success ? (
          <>
            <ul className="rp-req-list">
              <li>8+ characters</li>
              <li>One uppercase</li>
              <li>One number</li>
            </ul>

            {error && <div className="rp-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="rp-new" className="rp-label">New password</label>
              <div className="rp-input-wrap">
                <input
                  id="rp-new"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="rp-input"
                />
                <button type="button" className="rp-toggle" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>

              <label htmlFor="rp-confirm" className="rp-label">Confirm password</label>
              <div className="rp-input-wrap">
                <input
                  id="rp-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  className="rp-input"
                />
              </div>

              <button id="rp-submit" type="submit" disabled={loading} className="rp-btn">
                {loading ? <><SpinnerIcon /> Updating password…</> : "Reset Falcon password"}
              </button>
            </form>
          </>
        ) : (
          <div className="rp-success">
            ✓ Password updated successfully!<br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>Redirecting you to sign in…</span>
          </div>
        )}

        <div className="rp-footer">
          <Link href="/login">← Return to sign in</Link>
        </div>
      </div>
    </>
  );
}
