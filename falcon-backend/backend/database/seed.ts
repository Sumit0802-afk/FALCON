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

  // eslint-disable-next-line no-console
  console.log(`[seed] Ready — login with demo@falcon.app / password123`);
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
