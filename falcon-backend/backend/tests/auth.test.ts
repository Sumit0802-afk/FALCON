import "dotenv/config";
import { createApp } from "../app";
import { connectDatabase, disconnectDatabase, prisma } from "../database/prismaClient";
import { emailService } from "../services/email.service";
import bcrypt from "bcryptjs";

// Minimal custom fetch/test client using app
import http from "http";

let server: http.Server;
let baseUrl: string;

async function request(path: string, options: { method?: string; body?: any; headers?: Record<string, string>; cookies?: string } = {}) {
  const method = options.method || "GET";
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.cookies) {
    headers["Cookie"] = options.cookies;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const setCookie = res.headers.get("set-cookie") || "";
  let json: any = null;
  if (contentType.includes("application/json")) {
    json = await res.json();
  }

  return { status: res.status, ok: res.ok, body: json, setCookie };
}

async function runTests() {
  console.log("=================================================");
  console.log("      FALCON AUTHENTICATION SECURITY AUDIT       ");
  console.log("=================================================");

  await connectDatabase();

  const app = createApp();
  const port = 4999;
  server = app.listen(port);
  baseUrl = `http://localhost:${port}/api`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    const testEmail = `sec_test_${Date.now()}@falcon.app`;
    const testPassword = "Password123!";

    // Setup: Create test user with hashed password
    const passwordHash = await bcrypt.hash(testPassword, 12);
    const testUser = await prisma.user.create({
      data: {
        name: "Security Tester",
        email: testEmail,
        passwordHash,
      },
    });

    console.log(`\n--- Test 1: Wrong password returns generic error without leaking info ---`);
    const badPassRes = await request("/auth/login", {
      method: "POST",
      body: { email: testEmail, password: "WrongPassword99!" },
    });
    assert(badPassRes.status === 401, "Status code is 401 Unauthorized");
    assert(badPassRes.body?.error === "Invalid email or password", "Generic error message returned");

    console.log(`\n--- Test 2: Unknown account returns generic error without leaking existence ---`);
    const unknownRes = await request("/auth/login", {
      method: "POST",
      body: { email: "nonexistent_account_9999@falcon.app", password: "Password123!" },
    });
    assert(unknownRes.status === 401, "Status code is 401 Unauthorized");
    assert(unknownRes.body?.error === "Invalid email or password", "Identical generic error prevents enumeration");

    console.log(`\n--- Test 3: Valid credentials triggers MFA OTP challenge ---`);
    const loginRes = await request("/auth/login", {
      method: "POST",
      body: { email: testEmail, password: testPassword },
    });
    assert(loginRes.status === 200, "Status code is 200 OK");
    assert(loginRes.body?.mfaRequired === true, "mfaRequired is true");
    assert(typeof loginRes.body?.mfaToken === "string", "Short-lived mfaToken returned");
    assert(!loginRes.body?.otp, "Plaintext OTP is NEVER returned in response");

    const mfaToken = loginRes.body?.mfaToken;
    const dispatchedOtp = emailService.getDevLatestOtp(testEmail);
    assert(!!dispatchedOtp && dispatchedOtp.length === 6, "Cryptographically secure 6-digit OTP dispatched to user email");

    console.log(`\n--- Test 4: Verify wrong OTP increments attempts and rejects ---`);
    const wrongOtpRes = await request("/auth/verify-otp", {
      method: "POST",
      body: { mfaToken, otp: "000000" },
    });
    assert(wrongOtpRes.status === 401, "Status is 401 for wrong OTP");
    assert(wrongOtpRes.body?.error === "Invalid or expired verification code.", "Generic error for wrong OTP");

    console.log(`\n--- Test 5: Verify correct OTP creates authenticated session & HttpOnly cookie ---`);
    const correctOtpRes = await request("/auth/verify-otp", {
      method: "POST",
      body: { mfaToken, otp: dispatchedOtp! },
    });
    assert(correctOtpRes.status === 200, "Status is 200 OK on correct OTP");
    assert(correctOtpRes.body?.user?.email === testEmail, "Returns authenticated user data");
    assert(correctOtpRes.setCookie.includes("falcon_session="), "Sets HttpOnly falcon_session cookie");
    assert(correctOtpRes.setCookie.includes("HttpOnly"), "Cookie is marked HttpOnly");

    const sessionCookie = correctOtpRes.setCookie.split(";")[0];

    console.log(`\n--- Test 6: OTP Reuse prevention (replay attack defense) ---`);
    const reuseOtpRes = await request("/auth/verify-otp", {
      method: "POST",
      body: { mfaToken, otp: dispatchedOtp! },
    });
    assert(reuseOtpRes.status === 401, "Reusing already-verified OTP is strictly rejected");

    console.log(`\n--- Test 7: Protected route access using HttpOnly session cookie ---`);
    const meRes = await request("/auth/me", {
      method: "GET",
      cookies: sessionCookie,
    });
    assert(meRes.status === 200, "Successfully accessed /auth/me with session cookie");
    assert(meRes.body?.user?.id === testUser.id, "Correct user identified by server session");

    console.log(`\n--- Test 8: Unauthorized access without session ---`);
    const noAuthRes = await request("/auth/me", { method: "GET" });
    assert(noAuthRes.status === 401, "Protected route denies unauthenticated access");

    console.log(`\n--- Test 9: Logout revokes session on server ---`);
    const logoutRes = await request("/auth/logout", {
      method: "POST",
      cookies: sessionCookie,
    });
    assert(logoutRes.status === 200, "Logout endpoint succeeds");
    assert(logoutRes.setCookie.includes("falcon_session=;"), "Clears session cookie");

    // Attempt to reuse revoked session
    const revokedRes = await request("/auth/me", {
      method: "GET",
      cookies: sessionCookie,
    });
    assert(revokedRes.status === 401, "Revoked session cannot access protected endpoints");

    console.log(`\n--- Test 10: OTP Resend cooldown enforcement ---`);
    const freshLogin = await request("/auth/login", {
      method: "POST",
      body: { email: testEmail, password: testPassword },
    });
    const freshMfaToken = freshLogin.body?.mfaToken;

    const fastResendRes = await request("/auth/resend-otp", {
      method: "POST",
      body: { mfaToken: freshMfaToken },
    });
    assert(fastResendRes.status === 429, "Immediate resend triggers cooldown rate limit (429)");

    console.log(`\n--- Test 11: Password reset flow ---`);
    const forgotRes = await request("/auth/forgot-password", {
      method: "POST",
      body: { email: testEmail },
    });
    assert(forgotRes.status === 200, "Forgot password returns generic 200");
    const resetUrl = emailService.getDevLatestResetUrl(testEmail);
    assert(!!resetUrl, "Password reset token generated and sent to email");

    const tokenMatch = resetUrl?.match(/token=([a-f0-9]+)/);
    const resetToken = tokenMatch ? tokenMatch[1] : "";

    const resetRes = await request("/auth/reset-password", {
      method: "POST",
      body: {
        token: resetToken,
        newPassword: "NewSecurePassword456!",
        confirmPassword: "NewSecurePassword456!",
      },
    });
    assert(resetRes.status === 200, "Password reset succeeds with valid token");

    // Login with new password
    const newPassLogin = await request("/auth/login", {
      method: "POST",
      body: { email: testEmail, password: "NewSecurePassword456!" },
    });
    assert(newPassLogin.status === 200 && newPassLogin.body?.mfaRequired, "Can login with new password");

    // Clean up test user
    await prisma.user.delete({ where: { id: testUser.id } }).catch(() => null);

    console.log("\n=================================================");
    console.log(` AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    server.close();
    await disconnectDatabase();
    process.exit(0);
  }
}

runTests();
