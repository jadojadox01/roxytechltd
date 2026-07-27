const bcrypt = require("bcrypt");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function createUser(email, password, name, role) {
  const hashed = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role, password: hashed, name, status: "ACTIVE" },
    });
    console.log(`Updated ${role}:`, email);
  } else {
    await prisma.user.create({
      data: { email, password: hashed, role, name, status: "ACTIVE" },
    });
    console.log(`Created ${role}:`, email);
  }
}

async function main() {
  await createUser("admin@gmail.com", "admin", "Admin", "ADMIN");
  await createUser("storekeeper@gmail.com", "storekeeper", "Store Keeper John", "STORE_KEEPER");
  console.log("\nDefault credentials:");
  console.log("  Admin:        admin@gmail.com / admin");
  console.log("  Store Keeper: storekeeper@gmail.com / storekeeper");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
