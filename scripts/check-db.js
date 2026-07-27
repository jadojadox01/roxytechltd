require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name::text AS table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("Tables:", tables.map((t) => t.table_name).join(", "));

    const orderStatus = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::\"OrderStatus\"))::text AS status
    `.catch((e) => [{ status: "error: " + e.message }]);
    console.log("OrderStatus:", orderStatus.map((s) => s.status).join(", "));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
