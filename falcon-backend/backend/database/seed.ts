import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prismaClient";

/**
 * Sample data for a development database: a demo account with a starter
 * project, and the starter templates.
 *
 * No account gets a known password. The demo password is SEED_DEMO_PASSWORD
 * when set, or a random one printed once. An admin account is made only when
 * SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are both set. The seed refuses to
 * run with NODE_ENV=production unless ALLOW_PRODUCTION_SEED=1.
 */

/** A password that meets the sign-up rules, made fresh each time */
function randomPassword(): string {
  return `Falcon-${crypto.randomBytes(12).toString("base64url")}9`;
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "1") {
    throw new Error("Refusing to seed a production database. Set ALLOW_PRODUCTION_SEED=1 if you really mean to.");
  }

  const demoPassword = process.env.SEED_DEMO_PASSWORD || randomPassword();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@falcon.app" },
    // An existing demo account gets the new password too, so no old, known password keeps working
    update: { passwordHash },
    create: {
      name: "Demo User",
      email: "demo@falcon.app",
      passwordHash,
    },
  });

  const existing = await prisma.project.findFirst({ where: { ownerId: user.id } });
  if (!existing) {
    await prisma.project.create({
      data: {
        title: "Untitled design",
        ownerId: user.id,
        pages: {
          create: [
            {
              name: "Page 1",
              width: 1080,
              height: 1080,
              presetName: "Instagram Post",
              background: "#FFFFFF",
              elements: "[]",
              order: 0,
            },
          ],
        },
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
    const adminHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "admin", passwordHash: adminHash },
      create: { name: "Falcon Admin", email: adminEmail, passwordHash: adminHash, role: "admin", isVerified: true },
    });
    console.log(`[seed] admin account: ${adminEmail}`);
  }

  const { templateService } = await import("../services/template.service");
  const { generateTemplateBatch } = await import("../templates/generator");
  const { importMany } = await import("../services/templateImport.service");

  await templateService.ensureTaxonomy();
  const publishedCount = await prisma.designTemplate.count({ where: { status: "published" } });
  if (publishedCount === 0) {
    const starter = generateTemplateBatch(168, 0, true);
    const imported = await importMany(starter, { sourceType: "seed", publish: true, batchSize: 84 });
    console.log(
      `[seed] templates imported=${imported.imported} skipped=${imported.skipped} failed=${imported.failed}`
    );
  } else {
    console.log(`[seed] templates already present (${publishedCount} published)`);
  }

  // eslint-disable-next-line no-console
  console.log(`[seed] Ready — demo account demo@falcon.app${process.env.SEED_DEMO_PASSWORD ? " (password from SEED_DEMO_PASSWORD)" : `, password: ${demoPassword} (shown once)`}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
