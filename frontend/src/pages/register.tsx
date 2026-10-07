import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { register, isAuthenticated } from "@/services/authService";

// ─── Icons ────────────────────────────────────────────────────────────────────
function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Password strength ─────────────────────────────────────────────────────────
interface PasswordCheck {
  label: string;
  pass: boolean;
}

function getPasswordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", pass: pw.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(pw) },
    { label: "One number", pass: /[0-9]/.test(pw) },
  ];
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateName(v: string) { return v.trim().length > 0 ? "" : "Full name is required"; }
function validateEmail(v: string) {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
  return "";
}
function validatePassword(v: string) {
  if (!v) return "Password is required";
  if (v.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Must contain at least one uppercase letter";
  if (!/[0-9]/.test(v)) return "Must contain at least one number";
  return "";
}
function validateConfirm(pw: string, cpw: string) {
  if (!cpw) return "Please confirm your password";
  if (pw !== cpw) return "Passwords do not match";
  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirm: "", terms: "" });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pwChecks = getPasswordChecks(password);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  function validateAll(): boolean {
    const e = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(password, confirmPassword),
      terms: termsAccepted ? "" : "You must accept the terms to continue",
    };
    setErrors(e);
    return Object.values(e).every((v) => !v);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validateAll()) return;
    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Create account — Falcon</title>
        <meta name="description" content="Create your free Falcon design account." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .auth-root {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          background: #070709;
          overflow: hidden;
        }
        .auth-glow-1 {
          position: fixed; top: -20%; right: -10%;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .auth-glow-2 {
          position: fixed; bottom: -20%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .auth-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 460px;
          background: rgba(255,255,255,0.035);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px;
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
        .auth-title {
          text-align: center; font-size: 26px; font-weight: 700;
          color: #f8f8f8; letter-spacing: -0.5px; margin: 0 0 6px;
        }
        .auth-subtitle {
          text-align: center; font-size: 14px;
          color: rgba(255,255,255,0.4); margin: 0 0 32px;
        }
        .auth-field { margin-bottom: 16px; }
        .auth-label {
          display: block; font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.5); margin-bottom: 8px;
          letter-spacing: 0.3px; text-transform: uppercase;
        }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 13px 16px;
          font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
          color: #f0f0f0; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .auth-input.error { border-color: rgba(239,68,68,0.6); box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .auth-input.has-toggle { padding-right: 48px; }
        .auth-toggle-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); padding: 4px; display: flex; transition: color 0.2s;
        }
        .auth-toggle-btn:hover { color: rgba(255,255,255,0.7); }
        .auth-field-error {
          font-size: 12px; color: #f87171; margin-top: 6px;
          display: flex; align-items: center; gap: 4px;
        }

        /* Password strength */
        .pw-strength {
          margin-top: 10px; display: flex; flex-direction: column; gap: 5px;
        }
        .pw-check {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; transition: color 0.2s;
        }
        .pw-check.ok { color: #4ade80; }
        .pw-check.fail { color: rgba(255,255,255,0.3); }
        .pw-check-dot {
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s;
        }
        .pw-check.ok .pw-check-dot { background: rgba(74,222,128,0.2); }
        .pw-check.fail .pw-check-dot { background: rgba(255,255,255,0.06); }

        /* Terms */
        .auth-terms-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin: 4px 0 24px; cursor: pointer;
        }
        .auth-terms-row input[type="checkbox"] {
          width: 16px; height: 16px; accent-color: #6366f1;
          cursor: pointer; flex-shrink: 0; margin-top: 1px;
        }
        .auth-terms-text {
          font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.5;
        }
        .auth-terms-text a {
          color: rgba(99,102,241,0.9); text-decoration: none; transition: color 0.2s;
        }
        .auth-terms-text a:hover { color: #818cf8; }
        .auth-terms-error {
          display: block; font-size: 12px; color: #f87171; margin-top: 4px;
        }

        /* Buttons */
        .auth-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff; border: none; border-radius: 12px; padding: 14px;
          font-size: 14px; font-weight: 600;
          font-family: 'Inter', system-ui, sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35); letter-spacing: 0.2px;
        }
        .auth-btn-primary:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45);
        }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* Server error */
        .auth-server-error {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #fca5a5;
          margin-bottom: 16px; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
        }

        /* Success */
        .auth-success {
          text-align: center; padding: 20px 0;
        }
        .auth-success-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(74,222,128,0.15);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          border: 1px solid rgba(74,222,128,0.3);
        }
        .auth-success-title { font-size: 20px; font-weight: 700; color: #f8f8f8; margin-bottom: 8px; }
        .auth-success-desc { font-size: 14px; color: rgba(255,255,255,0.45); }

        .auth-footer {
          text-align: center; margin-top: 28px;
          font-size: 13.5px; color: rgba(255,255,255,0.35);
        }
        .auth-footer a {
          color: rgba(255,255,255,0.75); text-decoration: none;
          font-weight: 500; transition: color 0.2s;
        }
        .auth-footer a:hover { color: #fff; }
      `}</style>

      <div className="auth-root">
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />

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

          {success ? (
            <div className="auth-success">
              <div className="auth-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="auth-success-title">Account created!</h1>
              <p className="auth-success-desc">Taking you to sign in. We&apos;ll email you a verification code…</p>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Start designing with Falcon for free</p>

              {serverError && (
                <div className="auth-server-error" role="alert">
                  <span>⚠</span>
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full name */}
                <div className="auth-field">
                  <label htmlFor="reg-name" className="auth-label">Full name</label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    onBlur={() => setErrors((p) => ({ ...p, name: validateName(name) }))}
                    autoComplete="name"
                    placeholder="Jane Smith"
                    className={`auth-input${errors.name ? " error" : ""}`}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="auth-field-error" role="alert">⚑ {errors.name}</p>}
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="reg-email" className="auth-label">Email address</label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                    onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`auth-input${errors.email ? " error" : ""}`}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="auth-field-error" role="alert">⚑ {errors.email}</p>}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label htmlFor="reg-password" className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                      onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className={`auth-input has-toggle${errors.password ? " error" : ""}`}
                      aria-invalid={!!errors.password}
                    />
                    <button type="button" className="auth-toggle-btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && <p className="auth-field-error" role="alert">⚑ {errors.password}</p>}
                  {/* Strength indicators */}
                  {password && (
                    <div className="pw-strength">
                      {pwChecks.map((chk) => (
                        <div key={chk.label} className={`pw-check ${chk.pass ? "ok" : "fail"}`}>
                          <div className="pw-check-dot">
                            {chk.pass && <CheckIcon />}
                          </div>
                          {chk.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="auth-field">
                  <label htmlFor="reg-confirm" className="auth-label">Confirm password</label>
                  <div className="auth-input-wrap">
                    <input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
                      onBlur={() => setErrors((p) => ({ ...p, confirm: validateConfirm(password, confirmPassword) }))}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className={`auth-input has-toggle${errors.confirm ? " error" : ""}`}
                      aria-invalid={!!errors.confirm}
                    />
                    <button type="button" className="auth-toggle-btn" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirm && <p className="auth-field-error" role="alert">⚑ {errors.confirm}</p>}
                </div>

                {/* Terms */}
                <div>
                  <label className="auth-terms-row">
                    <input
                      id="reg-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => { setTermsAccepted(e.target.checked); setErrors((p) => ({ ...p, terms: "" })); }}
                    />
                    <span className="auth-terms-text">
                      I agree to the{" "}
                      <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                    </span>
                  </label>
                  {errors.terms && <span className="auth-terms-error" role="alert">⚑ {errors.terms}</span>}
                </div>

                <button
                  id="reg-submit"
                  type="submit"
                  disabled={loading}
                  className="auth-btn-primary"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </form>

              <div className="auth-footer">
                Already have an account?{" "}
                <Link href="/login">Sign in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}