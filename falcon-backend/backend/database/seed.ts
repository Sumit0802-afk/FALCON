import bcrypt from "bcryptjs";
import { prisma } from "./prismaClient";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@falcon.app" },
    update: {},
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

  const adminHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@falcon.app" },
    update: { role: "admin" },
    create: {
      name: "Falcon Admin",
      email: "admin@falcon.app",
      passwordHash: adminHash,
      role: "admin",
      isVerified: true,
    },
  });

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
  console.log(`[seed] Ready — login with demo@falcon.app / password123 (admin@falcon.app for admin)`);
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
