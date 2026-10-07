import "dotenv/config";
import http from "http";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { connectDatabase, disconnectDatabase, prisma } from "../database/prismaClient";
import { emailService } from "../services/email.service";

// Routes mail into the in-memory test inbox instead of SMTP
process.env.NODE_ENV = "test";

let server: http.Server;
let baseUrl: string;

// Everything the process prints is captured so the run can prove no code leaked into logs
let capturedOutput = "";
for (const stream of [process.stdout, process.stderr]) {
  const original = stream.write.bind(stream);
  stream.write = ((chunk: any, ...rest: any[]) => {
    capturedOutput += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    return original(chunk, ...rest);
  }) as typeof stream.write;
}

async function request(
  path: string,
  options: { method?: string; body?: any; cookies?: string; ip?: string } = {}
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.cookies) headers["Cookie"] = options.cookies;
  // The app trusts one proxy hop, so this sets the client IP the rate limiters see
  if (options.ip) headers["X-Forwarded-For"] = options.ip;

  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const setCookie = res.headers.get("set-cookie") || "";
  const json: any = contentType.includes("application/json") ? await res.json() : null;

  return { status: res.status, ok: res.ok, body: json, setCookie };
}

async function runTests() {
  console.log("=================================================");
  console.log("      FALCON AUTHENTICATION SECURITY AUDIT       ");
  console.log("=================================================");

  await connectDatabase();

  const app = createApp();
  server = app.listen(4999);
  baseUrl = `http://localhost:4999/api`;

  let passed = 0;
  let failed = 0;
  let testUserId: string | undefined;

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
    const issuedCodes: string[] = [];

    const testUser = await prisma.user.create({
      data: {
        name: "Security Tester",
        email: testEmail,
        passwordHash: await bcrypt.hash(testPassword, 12),
      },
    });
    testUserId = testUser.id;

    /** Ages the user's codes past the resend cooldown without waiting 60 real seconds */
    const skipCooldown = () =>
      prisma.otpVerification.updateMany({
        where: { userId: testUser.id },
        data: { createdAt: new Date(Date.now() - 61_000) },
      });

    // Step 1 of login: email + password. A correct pair emails a code.
    const sendOtp = (ip: string, email = testEmail, password = testPassword) =>
      request("/auth/login", { method: "POST", body: { email, password }, ip });

    const verifyOtp = (ip: string, otp: string, email = testEmail) =>
      request("/auth/verify-otp", { method: "POST", body: { email, otp }, ip });

    const latestCode = () => {
      const code = emailService.getDevLatestOtp(testEmail)!;
      issuedCodes.push(code);
      return code;
    };

    console.log(`\n--- Test 1: Invalid email is rejected ---`);
    const badEmailRes = await sendOtp("10.0.0.1", "not-an-email");
    assert(badEmailRes.status === 400, "Malformed email returns 400");

    console.log(`\n--- Test 2: Wrong password and unknown account get the same answer, and no code ---`);
    const unknownRes = await sendOtp("10.0.0.1", "nonexistent_account_9999@falcon.app");
    assert(unknownRes.status === 401, "Unknown email returns 401");
    assert(unknownRes.body?.code === "INVALID_CREDENTIALS", "Error code is INVALID_CREDENTIALS");
    const badPassRes = await sendOtp("10.0.0.1", testEmail, "WrongPassword99!");
    assert(badPassRes.status === 401, "Wrong password returns 401");
    assert(badPassRes.body?.error === unknownRes.body?.error, "Identical message prevents account enumeration");
    assert(emailService.getDevLatestOtp(testEmail) === undefined, "No code is emailed without the correct password");
    const noPasswordRes = await request("/auth/send-otp", { method: "POST", body: { email: testEmail }, ip: "10.0.0.9" });
    assert(noPasswordRes.status === 404, "There is no endpoint that sends a code without a password");

    console.log(`\n--- Test 3: Correct email + password emails a code and never returns it ---`);
    const sendRes = await sendOtp("10.0.0.1");
    assert(sendRes.status === 200, "Status code is 200 OK");
    assert(sendRes.body?.success === true, "success is true");
    assert(sendRes.body?.message === "OTP sent successfully", "Message is 'OTP sent successfully'");
    const firstCode = latestCode();
    assert(/^\d{6}$/.test(firstCode || ""), "A 6-digit code was dispatched to the user's email");
    assert(!JSON.stringify(sendRes.body).includes(firstCode), "The code is not present anywhere in the response");

    const storedRecord = await prisma.otpVerification.findFirst({
      where: { userId: testUser.id, used: false },
    });
    assert(!!storedRecord && /^[a-f0-9]{64}$/.test(storedRecord.otpHash), "Database stores a hash");
    assert(!!storedRecord && !storedRecord.otpHash.includes(firstCode), "Database does not store the plain code");
    const ttlMs = storedRecord ? storedRecord.expiresAt.getTime() - Date.now() : 0;
    assert(ttlMs > 290_000 && ttlMs <= 300_000, "Code expires 5 minutes after it is issued");

    console.log(`\n--- Test 4: Incorrect code is rejected ---`);
    const wrongCode = firstCode === "000000" ? "111111" : "000000";
    const wrongOtpRes = await verifyOtp("10.0.0.1", wrongCode);
    assert(wrongOtpRes.status === 401, "Status is 401 for wrong code");
    assert(wrongOtpRes.body?.code === "OTP_INVALID", "Error code is OTP_INVALID");

    console.log(`\n--- Test 5: Correct code creates a session & HttpOnly cookie ---`);
    const correctOtpRes = await verifyOtp("10.0.0.1", firstCode);
    assert(correctOtpRes.status === 200, "Status is 200 OK on correct code");
    assert(correctOtpRes.body?.user?.email === testEmail, "Returns authenticated user data");
    assert(typeof correctOtpRes.body?.token === "string", "Returns the Falcon session JWT");
    assert(correctOtpRes.setCookie.includes("falcon_session="), "Sets falcon_session cookie");
    assert(correctOtpRes.setCookie.includes("HttpOnly"), "Cookie is marked HttpOnly");

    const sessionCookie = correctOtpRes.setCookie.split(";")[0];

    console.log(`\n--- Test 6: A used code cannot be replayed ---`);
    const reuseOtpRes = await verifyOtp("10.0.0.1", firstCode);
    assert(reuseOtpRes.status === 401, "Reusing an already-verified code is rejected");

    console.log(`\n--- Test 7: Session works, and logout revokes it ---`);
    const meRes = await request("/auth/me", { cookies: sessionCookie });
    assert(meRes.status === 200 && meRes.body?.user?.id === testUser.id, "Session cookie authenticates /auth/me");
    const noAuthRes = await request("/auth/me");
    assert(noAuthRes.status === 401, "Protected route denies unauthenticated access");
    const logoutRes = await request("/auth/logout", { method: "POST", cookies: sessionCookie });
    assert(logoutRes.status === 200, "Logout endpoint succeeds");
    const revokedRes = await request("/auth/me", { cookies: sessionCookie });
    assert(revokedRes.status === 401, "Revoked session cannot access protected endpoints");

    console.log(`\n--- Test 8: Resend cooldown, and a new code invalidates the old one ---`);
    await skipCooldown();
    await sendOtp("10.0.0.2");
    const olderCode = latestCode();
    const tooSoonRes = await sendOtp("10.0.0.2");
    assert(tooSoonRes.status === 429, "Immediate re-request is refused with 429");
    assert(tooSoonRes.body?.code === "OTP_COOLDOWN", "Error code is OTP_COOLDOWN");
    assert(tooSoonRes.body?.retryAfterSeconds > 0, "Response says how long to wait");
    await skipCooldown();
    const resendRes = await sendOtp("10.0.0.2");
    assert(resendRes.status === 200, "Re-request succeeds once the cooldown has passed");
    const newerCode = latestCode();
    if (olderCode !== newerCode) {
      const oldCodeRes = await verifyOtp("10.0.0.2", olderCode);
      assert(oldCodeRes.status === 401, "The previous code no longer works");
    }
    const newCodeRes = await verifyOtp("10.0.0.2", newerCode);
    assert(newCodeRes.status === 200, "The newest code works");

    console.log(`\n--- Test 9: Expired code is rejected ---`);
    await skipCooldown();
    await sendOtp("10.0.0.3");
    const expiringCode = latestCode();
    await prisma.otpVerification.updateMany({
      where: { userId: testUser.id, used: false },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const expiredRes = await verifyOtp("10.0.0.3", expiringCode);
    assert(expiredRes.status === 401, "Expired code returns 401");
    assert(expiredRes.body?.code === "OTP_EXPIRED", "Error code is OTP_EXPIRED");

    console.log(`\n--- Test 10: Too many incorrect attempts invalidates the code ---`);
    await skipCooldown();
    await sendOtp("10.0.0.4");
    const lockedCode = latestCode();
    const badGuess = lockedCode === "000000" ? "111111" : "000000";
    for (let i = 1; i <= 4; i++) {
      const res = await verifyOtp("10.0.0.4", badGuess);
      assert(res.body?.code === "OTP_INVALID", `Incorrect attempt ${i} of 5 is rejected`);
    }
    const fifthRes = await verifyOtp("10.0.0.4", badGuess);
    assert(fifthRes.status === 429, "Fifth incorrect attempt returns 429");
    assert(fifthRes.body?.code === "OTP_ATTEMPTS_EXCEEDED", "Error code is OTP_ATTEMPTS_EXCEEDED");
    const afterLockRes = await verifyOtp("10.0.0.4", lockedCode);
    assert(afterLockRes.status === 401, "Even the correct code is refused after the limit");

    console.log(`\n--- Test 11: Per-email request limit ---`);
    await skipCooldown();
    const sixthSendRes = await sendOtp("10.0.0.5");
    assert(sixthSendRes.status === 429, "Sixth code within an hour is refused with 429");
    assert(sixthSendRes.body?.code === "OTP_RATE_LIMITED", "Error code is OTP_RATE_LIMITED");

    console.log(`\n--- Test 12: Email delivery failure ---`);
    await prisma.otpVerification.deleteMany({ where: { userId: testUser.id } });
    emailService.failNextSendForTest();
    const failedSendRes = await sendOtp("10.0.0.6");
    assert(failedSendRes.status === 502, "Delivery failure returns 502");
    assert(failedSendRes.body?.code === "EMAIL_DELIVERY_FAILED", "Error code is EMAIL_DELIVERY_FAILED");
    assert(!/smtp|simulated|stack/i.test(JSON.stringify(failedSendRes.body)), "No internal details in the response");
    const orphanCount = await prisma.otpVerification.count({ where: { userId: testUser.id } });
    assert(orphanCount === 0, "The undelivered code is discarded");
    const retryRes = await sendOtp("10.0.0.6");
    assert(retryRes.status === 200, "The user can retry immediately after a failed delivery");
    latestCode();

    console.log(`\n--- Test 13: Per-IP request limit ---`);
    let ipLimited = false;
    for (let i = 0; i < 6; i++) {
      const res = await sendOtp("10.0.0.7", "nonexistent_account_9999@falcon.app");
      ipLimited = res.status === 429 && res.body?.code === "RATE_LIMITED";
    }
    assert(ipLimited, "Sixth request from one IP within the window is refused with 429");

    console.log(`\n--- Test 14: Password reset flow ---`);
    const forgotRes = await request("/auth/forgot-password", {
      method: "POST",
      body: { email: testEmail },
      ip: "10.0.0.8",
    });
    assert(forgotRes.status === 200, "Forgot password returns generic 200");
    const resetUrl = emailService.getDevLatestResetUrl(testEmail);
    assert(!!resetUrl, "Password reset token generated and sent to email");
    const resetToken = resetUrl?.match(/token=([a-f0-9]+)/)?.[1] || "";
    const resetRes = await request("/auth/reset-password", {
      method: "POST",
      body: {
        token: resetToken,
        newPassword: "NewSecurePassword456!",
        confirmPassword: "NewSecurePassword456!",
      },
      ip: "10.0.0.8",
    });
    assert(resetRes.status === 200, "Password reset succeeds with valid token");

    console.log(`\n--- Test 15: Nothing sensitive was logged ---`);
    const leaked = issuedCodes.filter((code) => capturedOutput.includes(code));
    assert(issuedCodes.length >= 6, `Checked ${issuedCodes.length} issued codes against all process output`);
    assert(leaked.length === 0, "No verification code appears in any log line");
    assert(!capturedOutput.includes(resetToken), "No reset token appears in any log line");
    assert(!capturedOutput.includes(correctOtpRes.body?.token), "No session JWT appears in any log line");
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
    assert(!smtpPassword || !capturedOutput.includes(smtpPassword), "No SMTP password appears in any log line");

    console.log("\n=================================================");
    console.log(` AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => null);
    }
    server.close();
    await disconnectDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
