require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "patch-neon-schema.sql"), "utf8");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("Patching database schema...");
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("Schema patch applied successfully.");
    console.log("\nNext, seed staff accounts:");
    console.log("  node scripts/create-admin.js");
  } catch (error) {
    console.error("Patch failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
