import { apiFetch } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  message?: string;
}

export interface MfaChallenge {
  mfaRequired: true;
  mfaToken: string;
  email: string;
  expiresInSeconds: number;
}

// ────────────────────────────────────────────────────────────
// Token helpers — Bearer token stored ONLY for hybrid clients.
// Sessions are primarily managed via HttpOnly cookies set by
// the backend. localStorage usage here is minimal and does NOT
// store sensitive user data beyond the JWT for API calls.
// ────────────────────────────────────────────────────────────
const TOKEN_KEY = "falcon_token";

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    clearToken();
    return null;
  }
  return token;
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof window !== "undefined"
      ? window.atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
    const payload = JSON.parse(decodeURIComponent(
      json.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    ));
    if (payload.exp && typeof payload.exp === "number") {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

// ────────────────────────────────────────────────────────────
// Auth API functions
// ────────────────────────────────────────────────────────────

/** Phase 1: submit email + password → get MFA challenge */
export async function login(email: string, password: string): Promise<MfaChallenge> {
  return apiFetch<MfaChallenge>("/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}

/** Phase 2: submit 6-digit OTP → get authenticated session */
export async function verifyOtp(mfaToken: string, otp: string): Promise<AuthResult> {
  const result = await apiFetch<AuthResult>("/auth/verify-otp", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ mfaToken, otp }),
  });
  // Store JWT for Bearer-header fallback (HttpOnly cookie is primary)
  if (result.token) saveToken(result.token);
  return result;
}

/** Resend OTP with server-enforced cooldown */
export async function resendOtp(mfaToken: string): Promise<{ message: string; cooldownSeconds: number }> {
  return apiFetch<{ message: string; cooldownSeconds: number }>("/auth/resend-otp", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ mfaToken }),
  });
}

/** Register new account → triggers MFA challenge immediately */
export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<MfaChallenge> {
  return apiFetch<MfaChallenge>("/auth/register", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Reset password with single-use token from email */
export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}

/** Server-side logout — revokes session cookie + DB session */
export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // best-effort
  } finally {
    clearToken();
  }
}

/** Fetch authenticated user profile from server */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      credentials: "include",
    });
    return res.user;
  } catch {
    clearToken();
    return null;
  }
}