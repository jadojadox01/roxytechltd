require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const count = await prisma.product.count();
    console.log("count OK:", count);
    const one = await prisma.product.findFirst({ select: { id: true, title: true } });
    console.log("findFirst OK:", one?.title);
  } catch (e) {
    console.error("Failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
