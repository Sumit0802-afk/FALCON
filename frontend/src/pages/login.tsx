import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { login, isAuthenticated } from "@/services/authService";
import { Sparkles, ArrowRight, AlertCircle, X } from "lucide-react";

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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

// ─── Validation ───────────────────────────────────────────────────────────────
function validateEmail(value: string): string {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "Password is required";
  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Redirect already-authenticated users ONLY when router is ready
  useEffect(() => {
    setMounted(true);
    if (router.isReady && isAuthenticated()) {
      const redirect = (router.query.redirect as string) || "/";
      router.replace(redirect);
    }
  }, [router.isReady, router.query.redirect]);

  function validateAll(): boolean {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    return !emailErr && !passwordErr;
  }

  async function performLogin(loginEmail: string, loginPass: string) {
    setServerError("");
    setLoading(true);
    try {
      await login(loginEmail, loginPass, rememberMe);
      const destination = (router.query.redirect as string) || "/";
      router.push(destination);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;
    await performLogin(email, password);
  }

  // Quick 1-click Demo User Login
  async function handleDemoLogin() {
    setEmail("demo@falcon.app");
    setPassword("password123");
    setErrors({ email: "", password: "" });
    await performLogin("demo@falcon.app", "password123");
  }

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Sign in — Falcon</title>
        <meta name="description" content="Sign in to your Falcon design account." />
      </Head>

      <style jsx>{`
        .auth-root {
          font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          background: transparent;
        }

        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(10, 14, 20, 0.65);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          padding: 38px 36px;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        }

        .auth-logo {
          width: 46px;
          height: 46px;
          background: #f4f1eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 20px;
          font-weight: 700;
          color: #050708;
          margin: 0 auto 18px;
          box-shadow: 0 0 20px rgba(244, 241, 235, 0.15);
          transition: transform 0.2s ease;
        }
        .auth-logo:hover {
          transform: scale(1.05);
        }

        .auth-title {
          text-align: center;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          color: #f8f8f8;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
        }

        .auth-subtitle {
          text-align: center;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.45);
          margin: 0 0 24px;
          font-family: "Plus Jakarta Sans", sans-serif;
        }

        .auth-field {
          margin-bottom: 16px;
        }

        .auth-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 7px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px;
          font-family: "Plus Jakarta Sans", sans-serif;
          color: #f0f0f0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .auth-input::placeholder {
          color: rgba(255, 255, 255, 0.22);
        }
        .auth-input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: rgba(99, 102, 241, 0.06);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .auth-input.error {
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        .auth-input.has-toggle {
          padding-right: 48px;
        }

        .auth-toggle-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.35);
          padding: 4px;
          display: flex;
          transition: color 0.2s;
        }
        .auth-toggle-btn:hover {
          color: rgba(255, 255, 255, 0.75);
        }

        .auth-field-error {
          font-size: 11.5px;
          color: #f87171;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .auth-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 6px 0 22px;
          gap: 12px;
        }

        .auth-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          user-select: none;
        }
        .auth-checkbox-label input[type="checkbox"] {
          width: 15px;
          height: 15px;
          accent-color: #6366f1;
          cursor: pointer;
          flex-shrink: 0;
        }

        .auth-forgot-link {
          font-size: 13px;
          color: rgba(165, 243, 252, 0.8);
          text-decoration: none;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .auth-forgot-link:hover {
          color: #ffffff;
        }

        .auth-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-size: 14px;
          font-weight: 600;
          font-family: "Plus Jakarta Sans", sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
          letter-spacing: 0.2px;
        }
        .auth-btn-primary:hover:not(:disabled) {
          opacity: 0.94;
          transform: translateY(-1px);
          box-shadow: 0 8px 26px rgba(99, 102, 241, 0.45);
        }
        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-btn-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }
        .auth-divider-text {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          white-space: nowrap;
          font-family: "JetBrains Mono", monospace;
        }

        .auth-btn-google {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          padding: 12px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: "Plus Jakarta Sans", sans-serif;
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .auth-btn-google:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          color: #fff;
        }

        .auth-server-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          line-height: 1.5;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.4);
        }
        .auth-footer a {
          color: #f4f1eb;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .auth-footer a:hover {
          color: #fff;
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">
          {/* Logo */}
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

          {/* Heading */}
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue creating with Falcon</p>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="mb-5 flex w-full items-center justify-between rounded-xl border border-cyan-500/25 bg-cyan-950/20 px-3.5 py-2.5 text-left text-xs transition hover:border-cyan-400/50 hover:bg-cyan-900/30 group"
          >
            <div className="flex items-center gap-2 text-cyan-200">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span className="font-medium">1-Click Demo Sign-In</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400/70 group-hover:text-cyan-300">
              demo@falcon.app →
            </span>
          </button>

          {/* Server error */}
          {serverError && (
            <div className="auth-server-error" role="alert">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                <span>{serverError}</span>
              </div>
              <button
                type="button"
                onClick={() => setServerError("")}
                className="text-red-300 hover:text-white"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email address
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, email: validateEmail(email) }))}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`auth-input${errors.email ? " error" : ""}`}
                  aria-describedby={errors.email ? "login-email-err" : undefined}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p id="login-email-err" className="auth-field-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((p) => ({ ...p, password: "" }));
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, password: validatePassword(password) }))}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`auth-input has-toggle${errors.password ? " error" : ""}`}
                  aria-describedby={errors.password ? "login-pw-err" : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p id="login-pw-err" className="auth-field-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="auth-row">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Falcon
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            {/* Google */}
            <button
              id="login-google"
              type="button"
              className="auth-btn-google"
              onClick={() => {
                setServerError("Google sign-in coming soon. Please use email/password for now.");
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link href="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </>
  );
}
