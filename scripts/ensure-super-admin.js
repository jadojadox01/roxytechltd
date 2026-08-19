require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const EMAIL = "xjado.jeanne@gmail.com";
const NAME = "Super Admin";
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "jado1234";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });
  const password = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      name: NAME,
      password,
      role: "ADMIN",
      status: "ACTIVE",
    },
    create: {
      name: NAME,
      email: EMAIL,
      password,
      role: "ADMIN",
      status: "ACTIVE",
    },
    select: { id: true, email: true, role: true, status: true },
  });

  console.log("Super admin ready:", user.email, user.role, user.status);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
