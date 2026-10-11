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

async function request(path: string, options: { method?: string; body?: any; token?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options.ip) headers["X-Forwarded-For"] = options.ip;
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = res.headers.get("content-type") || "";
  const json: any = contentType.includes("application/json") ? await res.json() : null;
  return { status: res.status, body: json };
}

async function runTests() {
  console.log("=================================================");
  console.log("        FALCON ACCOUNT & SUPPORT TESTS           ");
  console.log("=================================================");

  await connectDatabase();
  server = createApp().listen(4997);
  baseUrl = "http://localhost:4997/api";

  let passed = 0;
  let failed = 0;
  const userIds: string[] = [];

  function assert(condition: boolean, desc: string) {
    if (condition) { console.log(`[PASS] ${desc}`); passed++; }
    else { console.error(`[FAIL] ${desc}`); failed++; }
  }

  try {
    const password = "Password123!";
    const newPassword = "Different456!";
    const makeUser = async (label: string) => {
      const user = await prisma.user.create({
        data: { name: `Account ${label}`, email: `acct_${label}_${Date.now()}@falcon.app`, passwordHash: await bcrypt.hash(password, 12) },
      });
      userIds.push(user.id);
      return user;
    };
    const skipCooldown = (userId: string) =>
      prisma.otpVerification.updateMany({ where: { userId }, data: { createdAt: new Date(Date.now() - 61_000) } });
    const signIn = async (email: string, userId: string, pass: string, ip: string) => {
      await skipCooldown(userId);
      const login = await request("/auth/login", { method: "POST", body: { email, password: pass }, ip });
      if (login.status !== 200) return { status: login.status, token: "" };
      const otp = emailService.getDevLatestOtp(email)!;
      const verified = await request("/auth/verify-otp", { method: "POST", body: { email, otp }, ip });
      return { status: verified.status, token: verified.body?.token as string };
    };

    const alice = await makeUser("alice");
    const bob = await makeUser("bob");
    const first = await signIn(alice.email, alice.id, password, "10.1.0.1");
    const second = await signIn(alice.email, alice.id, password, "10.1.0.2");
    const bobSession = await signIn(bob.email, bob.id, password, "10.1.0.3");
    assert(!!first.token && !!second.token && !!bobSession.token, "Test users can sign in");

    console.log("\n--- Signed-out requests are refused ---");
    assert((await request("/auth/me", { method: "PATCH", body: { name: "X" } })).status === 401, "PATCH /auth/me needs a session");
    assert((await request("/auth/sessions")).status === 401, "GET /auth/sessions needs a session");
    assert((await request("/auth/logout-others", { method: "POST" })).status === 401, "POST /auth/logout-others needs a session");
    assert((await request("/auth/support", { method: "POST", body: { subject: "Hello", message: "I need some help please" } })).status === 401, "POST /auth/support needs a session");
    assert(
      (await request("/auth/change-password", { method: "POST", body: { currentPassword: password, newPassword, confirmPassword: newPassword } })).status === 401,
      "POST /auth/change-password needs a session"
    );

    console.log("\n--- Profile ---");
    const renamed = await request("/auth/me", { method: "PATCH", token: first.token, body: { name: "  Alice Renamed  ", email: "evil@falcon.app", role: "admin" } });
    assert(renamed.status === 200 && renamed.body?.user?.name === "Alice Renamed", "Name is updated and trimmed");
    assert(renamed.body?.user?.email === alice.email && renamed.body?.user?.role === "user", "Email and role cannot be changed through the profile");
    assert(renamed.body?.user?.passwordHash === undefined, "Password hash is never returned");
    assert((await request("/auth/me", { method: "PATCH", token: first.token, body: { name: "   " } })).status === 400, "Blank name is rejected");
    const bobRow = await prisma.user.findUnique({ where: { id: bob.id } });
    assert(bobRow?.name === bob.name, "Another user's profile is untouched");

    console.log("\n--- Sessions ---");
    const sessions = await request("/auth/sessions", { token: first.token });
    assert(sessions.status === 200 && sessions.body?.sessions?.length === 2, "Both of the user's sessions are listed");
    assert(sessions.body?.sessions?.filter((s: any) => s.current).length === 1, "Exactly one is marked as the current session");
    assert(!JSON.stringify(sessions.body).includes("sessionTokenHash"), "Token hashes are not exposed");
    const others = await request("/auth/logout-others", { method: "POST", token: first.token });
    assert(others.status === 200 && others.body?.revoked === 1, "Signing out other devices revokes one session");
    assert((await request("/auth/me", { token: second.token })).status === 401, "The other session no longer works");
    assert((await request("/auth/me", { token: first.token })).status === 200, "The current session still works");
    assert((await request("/auth/me", { token: bobSession.token })).status === 200, "Another user's session is unaffected");

    console.log("\n--- Change password ---");
    const third = await signIn(alice.email, alice.id, password, "10.1.0.4");
    const change = (body: any, ip = "10.1.1.1") => request("/auth/change-password", { method: "POST", token: first.token, body, ip });
    const wrong = await change({ currentPassword: "NotMyPassword1!", newPassword, confirmPassword: newPassword });
    assert(wrong.status === 400 && wrong.body?.code === "WRONG_PASSWORD", "Wrong current password is rejected");
    assert((await change({ currentPassword: password, newPassword: "weak", confirmPassword: "weak" })).status === 400, "Weak new password is rejected");
    assert((await change({ currentPassword: password, newPassword, confirmPassword: "Mismatch789!" })).status === 400, "Mismatched confirmation is rejected");
    assert((await change({ currentPassword: password, newPassword: password, confirmPassword: password })).status === 400, "Reusing the current password is rejected");
    const changed = await change({ currentPassword: password, newPassword, confirmPassword: newPassword });
    assert(changed.status === 200, "Password changes with the correct current password");
    assert((await request("/auth/me", { token: first.token })).status === 200, "The session that changed the password stays signed in");
    assert((await request("/auth/me", { token: third.token })).status === 401, "Other sessions are signed out after a password change");
    assert((await signIn(alice.email, alice.id, password, "10.1.0.5")).status === 401, "The old password no longer signs in");
    assert((await signIn(alice.email, alice.id, newPassword, "10.1.0.6")).status === 200, "The new password signs in");
    let limited = 0;
    for (let i = 0; i < 6; i++) {
      const res = await change({ currentPassword: "NotMyPassword1!", newPassword, confirmPassword: newPassword }, "10.1.9.9");
      if (res.status === 429) limited++;
    }
    assert(limited >= 1, "Repeated password attempts are rate limited");

    console.log("\n--- Support ---");
    const support = (body: any, ip = "10.1.2.1") => request("/auth/support", { method: "POST", token: first.token, body, ip });
    assert((await support({ subject: "Hi", message: "short" })).status === 400, "Too-short message is rejected");
    assert((await support({ topic: "nonsense", subject: "Hello there", message: "I need some help please" })).status === 400, "Unknown topic is rejected");
    const sent = await support({ topic: "bug", subject: "Editor <b>issue</b>\r\nBcc: victim@example.com", message: "The <script>alert(1)</script> button does nothing." });
    assert(sent.status === 200 && sent.body?.success === true, "A valid message is accepted");
    const delivered = emailService.getDevLastSupportRequest();
    assert(delivered?.replyTo === alice.email, "Reply-To is the signed-in user's own address");
    assert(!!delivered && !/[\r\n]/.test(delivered.subject), "Line breaks are stripped from the subject");
    assert(!!delivered && !delivered.html.includes("<script>") && delivered.html.includes("&lt;script&gt;"), "Message HTML is escaped");
    emailService.failNextSendForTest();
    const failedSend = await support({ subject: "Hello there", message: "I need some help please" });
    assert(failedSend.status === 502 && failedSend.body?.code === "EMAIL_DELIVERY_FAILED", "A delivery failure is reported, not hidden");
    let supportLimited = 0;
    for (let i = 0; i < 6; i++) {
      const res = await support({ subject: "Hello there", message: "I need some help please" }, "10.1.9.8");
      if (res.status === 429) supportLimited++;
    }
    assert(supportLimited >= 1, "Support messages are rate limited");

    console.log("\n=================================================");
    console.log(` COMPLETE: ${passed} PASSED, ${failed} FAILED `);
    console.log("=================================================");
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    for (const id of userIds) await prisma.user.delete({ where: { id } }).catch(() => null);
    server.close();
    await disconnectDatabase();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
