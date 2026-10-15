import { ClipboardEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { googleSignIn, isAuthenticated, login, register, verifyOtp } from "@/services/authService";
import { ApiError } from "@/services/api";

/**
 * Sign in and sign up on one card. The dark panel slides from one side to the
 * other when the visitor switches between them, and the form follows it.
 *
 * Signing in keeps its two steps: email and password first, then the 6-digit
 * code that is emailed. The second step is shown in place of the first.
 */

export type AuthMode = "login" | "register";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ICON_PATHS = {
  mail: "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7 8-5H4zm0 2L4 9v8h16V9z",
  lock: "M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4z",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z",
};

function FieldIcon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Brand() {
  return (
    <Link href="/" className="fa-brand" aria-label="Back to Falcon home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/falcon-logo.png" alt="" />
      <span>Falcon</span>
    </Link>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailProblem(value: string): string {
  if (!value.trim()) return "Email address is required";
  return EMAIL.test(value.trim()) ? "" : "Enter a valid email address";
}

/** The rules the backend holds a new password to */
function passwordRules(value: string) {
  return [
    { label: "8+ characters", pass: value.length >= 8 },
    { label: "an uppercase letter", pass: /[A-Z]/.test(value) },
    { label: "a number", pass: /[0-9]/.test(value) },
  ];
}

// Only follow in-app paths from ?redirect= so a crafted link can't send users off-site after sign-in
function safeRedirect(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

// ─── Code entry ───────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled, hasError }: { value: string; onChange: (v: string) => void; disabled?: boolean; hasError?: boolean }) {
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
    const next = [...digits];
    next[idx] = cleaned;
    onChange(next.join(""));
    if (cleaned && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (!digits[idx] && idx > 0) {
        next[idx - 1] = "";
        inputsRef.current[idx - 1]?.focus();
      } else {
        next[idx] = "";
      }
      onChange(next.join(""));
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="fa-otp">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={digits[idx]?.trim() || ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={hasError ? "bad" : digits[idx]?.trim() ? "filled" : ""}
          aria-label={`Digit ${idx + 1} of 6`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ─── Continue with Google ─────────────────────────────────────────────────────

/** The Client ID of Falcon's Google sign-in. Without it the button is not shown */
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (o: Record<string, unknown>) => void; renderButton: (el: HTMLElement, o: Record<string, unknown>) => void } } };
  }
}

let googleScript: Promise<void> | null = null;
/** Google's sign-in library, loaded once and only when the button is shown */
function loadGoogle(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  googleScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { googleScript = null; reject(new Error("Google's sign-in could not be loaded")); };
    document.head.appendChild(script);
  });
  return googleScript;
}

/** Whichever form's button was pressed last receives Google's answer */
let googleReceiver: ((credential: string) => void) | null = null;
let googleReady = false;

/** Google's "G", in its own colours */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google". Google's own button is drawn on top of Falcon's and
 * left invisible, so the click goes to Google as Google requires, while what
 * people see always reads "Continue with Google". Google's button would
 * otherwise show the name and email of whoever is signed in to the browser.
 */
function GoogleButton({ onCredential, onUnavailable }: { onCredential: (credential: string) => void; onUnavailable: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const receive = useRef(onCredential);
  receive.current = onCredential;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    loadGoogle()
      .then(() => {
        const google = window.google;
        if (!live || !box.current || !google) return;
        if (!googleReady) {
          google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r: { credential?: string }) => r.credential && googleReceiver?.(r.credential), ux_mode: "popup" });
          googleReady = true;
        }
        google.accounts.id.renderButton(box.current, { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "center", width: Math.min(400, Math.max(200, box.current.clientWidth)) });
        setReady(true);
      })
      .catch(() => live && onUnavailable());
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pressing anywhere in this button makes this form the one Google answers
  return (
    <div className={`fa-google${ready ? " ready" : ""}`} onPointerDownCapture={() => { googleReceiver = (c) => receive.current(c); }}>
      <div className="fa-google-face" aria-hidden="true"><GoogleMark />Continue with Google</div>
      <div ref={box} className="fa-google-hit" />
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

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

// ─── Error messages ───────────────────────────────────────────────────────────

// Maps backend error codes to the copy shown on screen, so raw server or network text is never displayed
function authErrorMessage(err: unknown, invalidInputMessage: string): string {
  if (!(err instanceof ApiError)) return "We couldn't reach Falcon. Check your connection and try again.";
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

// ─── The card ─────────────────────────────────────────────────────────────────

export default function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sign in, first step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginBad, setLoginBad] = useState({ email: false, password: false });
  const [loginMessage, setLoginMessage] = useState<{ text: string; ok?: boolean } | null>(null);
  const [sendLoading, setSendLoading] = useState(false);

  // Sign in, second step
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [expiresLeft, startExpiry] = useCountdown();
  const [cooldownLeft, startCooldown] = useCountdown();

  // Sign up
  const [name, setName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signupBad, setSignupBad] = useState({ name: false, email: false, password: false, terms: false });
  const [signupMessage, setSignupMessage] = useState<{ text: string; ok?: boolean } | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // router.query is empty until the router is ready, so wait before reading ?redirect=
  useEffect(() => {
    if (router.isReady && isAuthenticated()) router.replace(safeRedirect(router.query.redirect));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  /** Slides to the other side and puts its address in the bar, without loading a new page */
  function switchTo(next: AuthMode) {
    setMode(next);
    setLoginMessage(null);
    setSignupMessage(null);
    const url = `/${next}${window.location.search}`;
    window.history.replaceState({ ...window.history.state, url, as: url }, "", url);
  }

  function showCodeStep(expiresInSeconds: number, resendInSeconds: number) {
    startExpiry(expiresInSeconds);
    startCooldown(resendInSeconds);
    setOtp("");
    setOtpError("");
    setStep("code");
  }

  function backToCredentials() {
    setStep("credentials");
    setOtp("");
    setOtpError("");
    setLoginMessage(null);
  }

  // ── Sign in: ask for a code ───────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const emailErr = emailProblem(email);
    const passwordErr = password ? "" : "Password is required";
    setLoginBad({ email: !!emailErr, password: !!passwordErr });
    if (emailErr || passwordErr) {
      setLoginMessage({ text: emailErr || passwordErr });
      return;
    }

    setLoginMessage(null);
    setSendLoading(true);
    try {
      const challenge = await login(email.trim(), password);
      showCodeStep(challenge.expiresInSeconds, challenge.resendInSeconds);
    } catch (err) {
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN" && err.retryAfterSeconds) {
        // A code was emailed moments ago and is still valid, so go straight to entering it
        const sentSecondsAgo = RESEND_COOLDOWN_SECONDS - err.retryAfterSeconds;
        showCodeStep(OTP_EXPIRY_SECONDS - sentSecondsAgo, err.retryAfterSeconds);
      } else {
        setLoginMessage({ text: authErrorMessage(err, "Enter a valid email address and your password.") });
      }
    } finally {
      setSendLoading(false);
    }
  }

  // ── Sign in: check the code ───────────────────────────────
  async function handleVerify(e: FormEvent) {
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
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN" && err.retryAfterSeconds) startCooldown(err.retryAfterSeconds);
      setOtpError(authErrorMessage(err, "We couldn't resend your code. Please try again."));
    } finally {
      setResendLoading(false);
    }
  }

  // ── Continue with Google ──────────────────────────────────
  const [googleLoading, setGoogleLoading] = useState(false);
  async function handleGoogle(credential: string, show: (m: { text: string; ok?: boolean } | null) => void) {
    show(null);
    setGoogleLoading(true);
    try {
      await googleSignIn(credential);
      router.push(safeRedirect(router.query.redirect));
    } catch (err) {
      show({ text: err instanceof ApiError && err.message ? err.message : "We couldn't reach Falcon. Check your connection and try again." });
      setGoogleLoading(false);
    }
  }
  const googleOff = () => {};

  // ── Sign up ───────────────────────────────────────────────
  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    const nameErr = name.trim() ? "" : "Full name is required";
    const emailErr = emailProblem(newEmail);
    const failed = passwordRules(newPassword).filter((rule) => !rule.pass);
    const passwordErr = !newPassword ? "Password is required" : failed.length ? `Your password needs ${failed.map((rule) => rule.label).join(", ")}` : "";
    const termsErr = agreed ? "" : "Please accept the terms to continue";
    setSignupBad({ name: !!nameErr, email: !!emailErr, password: !!passwordErr, terms: !!termsErr });
    const first = nameErr || emailErr || passwordErr || termsErr;
    if (first) {
      setSignupMessage({ text: first });
      return;
    }

    setSignupMessage(null);
    setSignupLoading(true);
    // The code is entered on the sign-in side, which also resends it with the same email and password
    const toCodeStep = (expiresInSeconds: number, resendInSeconds: number) => {
      setEmail(newEmail.trim());
      setPassword(newPassword);
      switchTo("login");
      showCodeStep(expiresInSeconds, resendInSeconds);
      setNewPassword("");
    };
    try {
      // The password can be shown while typing, so it is not asked for a second time
      const challenge = await register(name.trim(), newEmail.trim(), newPassword, newPassword);
      toCodeStep(challenge.expiresInSeconds, challenge.resendInSeconds);
    } catch (err) {
      if (err instanceof ApiError && err.code === "OTP_COOLDOWN" && err.retryAfterSeconds) {
        // A code for this sign-up was emailed moments ago and is still valid
        toCodeStep(OTP_EXPIRY_SECONDS - (RESEND_COOLDOWN_SECONDS - err.retryAfterSeconds), err.retryAfterSeconds);
      } else {
        setSignupMessage({ text: err instanceof ApiError && err.message ? err.message : "We couldn't reach Falcon. Check your connection and try again." });
      }
    } finally {
      setSignupLoading(false);
    }
  }

  if (!mounted) return null;

  const registering = mode === "register";
  const rules = passwordRules(newPassword);

  return (
    <>
      <Head>
        <title>{registering ? "Create account — Falcon" : "Sign in — Falcon"}</title>
        <meta name="description" content={registering ? "Create your free Falcon design account." : "Sign in to your Falcon design account."} />
      </Head>

      <style>{AUTH_CSS}</style>

      {/* The light theme recolours whole pages. This one carries its own colours for both themes */}
      <div className="fa-page" data-theme-keep="">
        <div className={`fa-card${registering ? " register" : ""}${GOOGLE_CLIENT_ID ? " with-google" : ""}`} role="main" aria-busy={googleLoading}>
          <div className="fa-card-bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/falcon-logo-white.png" alt="" />
          </div>

          {/* ── Sign up side ─────────────────────────────────── */}
          <div className="fa-hero register">
            <h2>Welcome back</h2>
            <p>Sign in to manage your Falcon projects.</p>
            <button type="button" className="fa-switch" onClick={() => switchTo("login")}>Login</button>
          </div>

          <form className="fa-form register" onSubmit={handleSignup} noValidate>
            <Brand />
            <h1>Sign up</h1>

            <div className="fa-field">
              <label htmlFor="signup-name">Full Name</label>
              <div className={`fa-input${signupBad.name ? " bad" : ""}`}>
                <FieldIcon name="user" />
                <input id="signup-name" type="text" value={name} onChange={(e) => { setName(e.target.value); setSignupBad((b) => ({ ...b, name: false })); }} placeholder="John Doe" autoComplete="name" maxLength={100} />
              </div>
            </div>

            <div className="fa-field">
              <label htmlFor="signup-email">Email Address</label>
              <div className={`fa-input${signupBad.email ? " bad" : ""}`}>
                <FieldIcon name="mail" />
                <input id="signup-email" type="email" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setSignupBad((b) => ({ ...b, email: false })); }} placeholder="johndoe@gmail.com" autoComplete="email" />
              </div>
            </div>

            <div className="fa-field">
              <label htmlFor="signup-password">Password</label>
              <div className={`fa-input${signupBad.password ? " bad" : ""}`}>
                <FieldIcon name="lock" />
                <input id="signup-password" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setSignupBad((b) => ({ ...b, password: false })); }} placeholder="••••••••" autoComplete="new-password" aria-describedby="signup-rules" />
                <button type="button" className="fa-eye" onClick={() => setShowNewPassword((v) => !v)} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                  <EyeIcon off={showNewPassword} />
                </button>
              </div>
              <p id="signup-rules" className="fa-rules">
                {rules.map((rule, i) => (
                  <span key={rule.label} className={rule.pass ? "ok" : ""}>{rule.label}{i < rules.length - 1 ? " · " : ""}</span>
                ))}
              </p>
            </div>

            <label className={`fa-row${signupBad.terms ? " bad" : ""}`}>
              <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setSignupBad((b) => ({ ...b, terms: false })); }} />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>

            <button type="submit" className="fa-submit" disabled={signupLoading || googleLoading}>{signupLoading ? "Creating account…" : "Sign up"}</button>
            {GOOGLE_CLIENT_ID && (
              <>
                <div className="fa-or" aria-hidden="true"><span>or</span></div>
                <GoogleButton onCredential={(c) => handleGoogle(c, setSignupMessage)} onUnavailable={googleOff} />
              </>
            )}
            <div className={`fa-msg${signupMessage?.ok ? " ok" : ""}`} role={signupMessage && !signupMessage.ok ? "alert" : undefined} aria-live="polite">{signupMessage?.text}</div>
          </form>

          {/* ── Sign in side ─────────────────────────────────── */}
          <div className="fa-hero login">
            <h2>Get started</h2>
            <p>Open an account and start building with Falcon.</p>
            <button type="button" className="fa-switch" onClick={() => switchTo("register")}>Sign up</button>
          </div>

          {step === "credentials" ? (
            <form className="fa-form login" onSubmit={handleLogin} noValidate>
              <Brand />
              <h1>Login</h1>

              <div className="fa-field">
                <label htmlFor="login-email">Email Address</label>
                <div className={`fa-input${loginBad.email ? " bad" : ""}`}>
                  <FieldIcon name="mail" />
                  <input id="login-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setLoginBad((b) => ({ ...b, email: false })); }} placeholder="johndoe@gmail.com" autoComplete="email" />
                </div>
              </div>

              <div className="fa-field">
                <label htmlFor="login-password">Password</label>
                <div className={`fa-input${loginBad.password ? " bad" : ""}`}>
                  <FieldIcon name="lock" />
                  <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setLoginBad((b) => ({ ...b, password: false })); }} placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" className="fa-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
              </div>

              <Link href="/forgot-password" className="fa-link">Forgot your password?</Link>

              <button id="login-submit" type="submit" className="fa-submit" disabled={sendLoading || googleLoading}>{sendLoading ? "Sending code…" : "Login"}</button>
              {GOOGLE_CLIENT_ID ? (
                <>
                  <div className="fa-or" aria-hidden="true"><span>or</span></div>
                  <GoogleButton onCredential={(c) => handleGoogle(c, setLoginMessage)} onUnavailable={googleOff} />
                </>
              ) : (
                <p className="fa-note">We&apos;ll email you a one-time code to finish signing in.</p>
              )}
              <div className={`fa-msg${loginMessage?.ok ? " ok" : ""}`} role={loginMessage && !loginMessage.ok ? "alert" : undefined} aria-live="polite">{loginMessage?.text}</div>
            </form>
          ) : (
            <form className="fa-form login" onSubmit={handleVerify} noValidate>
              <button type="button" className="fa-back" onClick={backToCredentials}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              <h1>Check your email</h1>
              <p className="fa-note">We&apos;ve sent a 6-digit code to <strong>{email.trim()}</strong></p>

              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} disabled={otpLoading} hasError={!!otpError} />

              <div className="fa-timer">
                <span className={expiresLeft <= 30 ? "urgent" : ""}>
                  {expiresLeft > 0 ? `Expires in ${Math.floor(expiresLeft / 60)}:${String(expiresLeft % 60).padStart(2, "0")}` : "Code expired"}
                </span>
                <button type="button" disabled={cooldownLeft > 0 || resendLoading} onClick={handleResend}>
                  {resendLoading ? "Sending…" : cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend code"}
                </button>
              </div>

              <button id="otp-submit" type="submit" className="fa-submit" disabled={otpLoading || otp.replace(/\D/g, "").length !== 6}>{otpLoading ? "Verifying…" : "Verify & sign in"}</button>
              <div className="fa-msg" role={otpError ? "alert" : undefined} aria-live="polite">{otpError}</div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AUTH_CSS = `
.fa-page{
  --fa-page:#0d0f17; --fa-card:#ffffff; --fa-ink:#111214; --fa-muted:#8a8f9c; --fa-field:#f1f2f5;
  --fa-accent:#5b45d6; --fa-shadow:rgba(0,0,0,.5);
  /* One column as wide as the screen, so the card can never be wider than it */
  min-height:100vh; display:grid; grid-template-columns:minmax(0,1fr); place-items:center; padding:16px;
  padding-top:max(16px, env(safe-area-inset-top)); padding-bottom:max(16px, env(safe-area-inset-bottom));
  background:var(--fa-page); color:var(--fa-ink);
  font-family:"Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;
}
html[data-theme="light"] .fa-page{ --fa-page:#f3f5fb; --fa-shadow:rgba(41,30,113,.12); }
.fa-page *{box-sizing:border-box}

/* ---------- Card ---------- */
.fa-card{
  position:relative; overflow:hidden; width:660px; max-width:100%; height:520px;
  border-radius:24px; background:var(--fa-card); border:8px solid var(--fa-card);
  box-shadow:0 12px 80px var(--fa-shadow);
}
.fa-card-bg{
  position:absolute; z-index:2; top:0; left:0; bottom:0; width:50%;
  border-radius:18px; translate:100% 0; transition:.65s ease-in-out; overflow:hidden;
  background:
    radial-gradient(60% 40% at 70% 85%, rgba(120,90,255,.45), transparent 70%),
    radial-gradient(50% 35% at 20% 20%, rgba(60,80,200,.35), transparent 70%),
    linear-gradient(160deg,#0a0b14 0%,#05060b 100%);
}
.fa-card-bg img{position:absolute;left:50%;top:12%;width:70%;translate:-50% 0;opacity:.14}
.fa-card.register .fa-card-bg{translate:0 0}

.fa-hero,.fa-form{
  position:absolute; top:0; width:50%; height:100%;
  opacity:0; visibility:hidden; transition:.65s ease-in-out;
}
.fa-hero.login,.fa-form.login{opacity:1;visibility:visible}
.fa-card.register :is(.fa-hero,.fa-form).login{opacity:0;visibility:hidden}
.fa-card.register :is(.fa-hero,.fa-form).register{opacity:1;visibility:visible}
.fa-hero.login{left:50%;translate:0}
.fa-card.register .fa-hero.login{translate:100% 0}
.fa-hero.register{left:0;translate:-100% 0}
.fa-card.register .fa-hero.register{translate:0}
.fa-form.login{left:0;translate:0}
.fa-card.register .fa-form.login{translate:100% 0}
.fa-form.register{left:50%;translate:-100% 0}
.fa-card.register .fa-form.register{translate:0}

/* ---------- Hero ---------- */
.fa-hero{
  z-index:3; display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:16px; color:#f9f9f9; padding:0 24px; text-align:center;
}
.fa-hero h2{margin:0;font-size:24px;font-weight:700;color:#f9f9f9}
.fa-hero p{margin:0;font-size:13px;line-height:1.5;color:rgba(255,255,255,.6)}
.fa-switch{
  padding:12px 46px; border-radius:50px; border:0; color:#f9f9f9; font:inherit; font-size:14px; cursor:pointer;
  background:rgb(255 255 255 / 8%); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); transition:.3s;
}
.fa-switch:hover,.fa-switch:focus-visible{color:#212625;background:#f9f9f9;outline:none}

/* ---------- Form ---------- */
.fa-form{
  z-index:1; display:flex; flex-direction:column; justify-content:center; gap:12px;
  padding:24px 28px; background:var(--fa-card); margin:0;
}
.fa-brand{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px;margin-bottom:2px;color:var(--fa-ink);text-decoration:none;align-self:flex-start}
.fa-brand img{width:26px;height:26px;object-fit:contain}
.fa-form h1{margin:0;font-size:24px;font-weight:700;line-height:1.2;color:var(--fa-ink);letter-spacing:0}
.fa-field label{display:block;font-size:11px;font-weight:600;margin-bottom:6px;color:var(--fa-ink)}
.fa-input{display:flex;align-items:center;gap:10px;background:var(--fa-field);border-radius:10px;padding:0 12px}
.fa-input > svg{width:16px;height:16px;flex:none;color:#9ca0ab}
.fa-input input{
  flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:13px;color:var(--fa-ink);padding:11px 0;
}
.fa-input input::placeholder{color:#a3a7b3}
.fa-input input:focus{outline:none}
.fa-input input:-webkit-autofill{-webkit-box-shadow:0 0 0 40px var(--fa-field) inset;-webkit-text-fill-color:var(--fa-ink)}
.fa-input:focus-within{outline:2px solid var(--fa-accent);outline-offset:1px}
.fa-input.bad{outline:2px solid #e5484d;outline-offset:1px}
.fa-eye{flex:none;display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;background:none;color:#9ca0ab;cursor:pointer;border-radius:6px}
.fa-eye:hover,.fa-eye:focus-visible{color:var(--fa-ink);outline:none}
.fa-eye svg{width:16px;height:16px}
.fa-rules{margin:6px 0 0;font-size:11px;line-height:1.3;color:var(--fa-muted)}
.fa-rules .ok{color:#1c8a4b}
.fa-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--fa-ink);cursor:pointer}
.fa-row input{accent-color:var(--fa-accent);width:15px;height:15px;margin:0;flex:none}
.fa-row.bad{color:#c9353a}
.fa-link{font-size:12px;color:var(--fa-muted);text-decoration:none;align-self:flex-start}
.fa-link:hover,.fa-link:focus-visible{color:var(--fa-ink)}
.fa-note{margin:0;font-size:12px;line-height:1.45;color:var(--fa-muted)}
.fa-note strong{color:var(--fa-ink);font-weight:600;word-break:break-all}
.fa-submit{
  padding:13px;border:0;border-radius:8px;font:inherit;font-size:13px;color:#fff;
  background:#111214;cursor:pointer;transition:.3s;
}
.fa-submit:hover:not(:disabled){background:#2a2c31}
.fa-submit:focus-visible{outline:2px solid var(--fa-accent);outline-offset:2px}
.fa-submit:disabled{opacity:.55;cursor:not-allowed}
.fa-msg{font-size:12px;line-height:1.35;min-height:16px;color:#c9353a}

/* ---------- Continue with Google ---------- */
.fa-card.with-google{height:580px}
.fa-or{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--fa-muted);text-transform:uppercase;letter-spacing:.08em}
.fa-or::before,.fa-or::after{content:"";flex:1;height:1px;background:var(--fa-field)}
.fa-google{position:relative;height:40px;color-scheme:light;visibility:hidden}
.fa-google.ready{visibility:visible}
.fa-google-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border:1px solid #3a3c42;border-radius:8px;background:#18191c;color:#fff;font-size:13px;font-weight:600;pointer-events:none;transition:background .2s,border-color .2s}
.fa-google-face svg{position:absolute;left:14px;top:50%;translate:0 -50%}
.fa-google:hover .fa-google-face{background:#24262b;border-color:#4a4d55}
.fa-google:focus-within .fa-google-face{outline:2px solid var(--fa-accent);outline-offset:2px}
.fa-google-hit{position:absolute;inset:0;overflow:hidden;opacity:.01}
.fa-msg.ok{color:#1c8a4b}

/* ---------- Code step ---------- */
.fa-back{display:flex;align-items:center;gap:6px;align-self:flex-start;padding:0;border:0;background:none;font:inherit;font-size:12px;color:var(--fa-muted);cursor:pointer}
.fa-back:hover,.fa-back:focus-visible{color:var(--fa-ink);outline:none}
.fa-back svg{width:14px;height:14px}
.fa-otp{display:flex;gap:7px}
.fa-otp input{
  flex:1;min-width:0;height:46px;border:0;border-radius:10px;background:var(--fa-field);
  text-align:center;font:inherit;font-size:18px;font-weight:600;color:var(--fa-ink);
}
.fa-otp input:focus{outline:2px solid var(--fa-accent);outline-offset:1px}
.fa-otp input.filled{background:#e9e7fb}
.fa-otp input.bad{outline:2px solid #e5484d;outline-offset:1px}
.fa-timer{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;color:var(--fa-muted)}
.fa-timer .urgent{color:#c9353a}
.fa-timer button{padding:0;border:0;background:none;font:inherit;font-size:12px;color:var(--fa-accent);cursor:pointer}
.fa-timer button:disabled{color:#b4b8c2;cursor:not-allowed}

/* ---------- Phones: the dark panel sits on top, the form below it ---------- */
@media (max-width:560px){
  .fa-card{height:640px}
  .fa-card.with-google{height:720px}
  .fa-card-bg{width:100%;height:150px;bottom:auto;translate:none !important}
  .fa-hero{left:0 !important;width:100%;height:150px;translate:none !important;gap:8px;padding:0 16px;transition:opacity .4s ease, visibility .4s}
  .fa-hero h2{font-size:20px}
  .fa-switch{padding:9px 34px}
  .fa-form{left:0 !important;top:150px;width:100%;height:calc(100% - 150px);translate:none !important;padding:16px 18px;gap:10px;transition:opacity .4s ease, visibility .4s}
  .fa-form h1{font-size:21px}
}
/* ---------- Larger screens: the whole card grows, keeping its proportions ---------- */
@media (min-width:1000px) and (min-height:720px){ .fa-card{zoom:1.25} }
@media (min-width:1500px) and (min-height:860px){ .fa-card{zoom:1.4} }

@media (prefers-reduced-motion:reduce){.fa-card-bg,.fa-hero,.fa-form{transition:none}}
`;
