import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient({
    log: ["error"],
  });

  try {
    const otpCount = await p.otpVerification.count();
    const userCount = await p.user.count();
    const sessionCount = await p.session.count();

    console.log("[DB CHECK] otp_verifications table: OK, rows =", otpCount);
    console.log("[DB CHECK] users table: OK, rows =", userCount);
    console.log("[DB CHECK] sessions table: OK, rows =", sessionCount);
    console.log("[DB CHECK] All auth tables are accessible ✓");

    // Try fetching the last OTP record if any exist
    if (otpCount > 0) {
      const latest = await p.otpVerification.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, purpose: true, used: true, expiresAt: true, createdAt: true, userId: true },
      });
      console.log("[DB CHECK] Latest OTP record:", JSON.stringify(latest, null, 2));
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[DB CHECK] FAILED:", msg);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
}

main();
