import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
try {
  const count = await p.otpVerification.count();
  console.log("[DB] otp_verifications count:", count);
  const userCount = await p.user.count();
  console.log("[DB] users count:", userCount);
  const sessCount = await p.session.count();
  console.log("[DB] sessions count:", sessCount);
  console.log("[DB] All tables accessible — DB is healthy");
} catch (e) {
  console.error("[DB] ERROR:", e.message);
} finally {
  await p.$disconnect();
}
