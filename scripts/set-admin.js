/**
 * Upsert production admin credentials on Neon.
 * Usage: node scripts/set-admin.js
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const EMAIL = (process.env.ADMIN_EMAIL || "gracenkurikiyinka@gmail.com").trim().toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "12345678";
const NAME = process.env.ADMIN_NAME || "Grace NKURIKIYINKA";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const hashed = await bcrypt.hash(PASSWORD, 12);
    const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

    if (existing) {
      await prisma.user.update({
        where: { email: EMAIL },
        data: {
          password: hashed,
          role: "ADMIN",
          status: "ACTIVE",
          name: NAME,
        },
      });
      console.log("Updated ADMIN:", EMAIL);
    } else {
      await prisma.user.create({
        data: {
          email: EMAIL,
          password: hashed,
          role: "ADMIN",
          status: "ACTIVE",
          name: NAME,
        },
      });
      console.log("Created ADMIN:", EMAIL);
    }

    // Keep a backup admin usable if the primary fails
    const backupEmail = "admin@gmail.com";
    const backupHash = await bcrypt.hash("admin", 12);
    const backup = await prisma.user.findUnique({ where: { email: backupEmail } });
    if (backup) {
      await prisma.user.update({
        where: { email: backupEmail },
        data: { password: backupHash, role: "ADMIN", status: "ACTIVE" },
      });
      console.log("Reset backup ADMIN:", backupEmail, "/ admin");
    }

    const users = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STORE_KEEPER"] } },
      select: { email: true, role: true, status: true, name: true },
    });
    console.log("Staff users:", users);

    const check = await prisma.user.findUnique({ where: { email: EMAIL } });
    console.log("Password verifies:", await bcrypt.compare(PASSWORD, check.password));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
