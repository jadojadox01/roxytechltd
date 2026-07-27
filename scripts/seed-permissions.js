const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { name: "product:view", description: "View products", module: "PRODUCT" },
  { name: "product:create", description: "Create products", module: "PRODUCT" },
  { name: "product:update", description: "Update products", module: "PRODUCT" },
  { name: "product:delete", description: "Delete products", module: "PRODUCT" },
  { name: "category:view", description: "View categories", module: "CATEGORY" },
  { name: "category:create", description: "Create categories", module: "CATEGORY" },
  { name: "category:update", description: "Update categories", module: "CATEGORY" },
  { name: "category:delete", description: "Delete categories", module: "CATEGORY" },
  { name: "inventory:view", description: "View inventory", module: "INVENTORY" },
  { name: "inventory:manage", description: "Manage inventory", module: "INVENTORY" },
  { name: "order:view", description: "View orders", module: "ORDER" },
  { name: "order:update", description: "Update orders", module: "ORDER" },
  { name: "user:view", description: "View users", module: "USER" },
  { name: "user:create", description: "Create users", module: "USER" },
  { name: "user:update", description: "Update users", module: "USER" },
  { name: "user:delete", description: "Delete users", module: "USER" },
  { name: "reports:view", description: "View reports", module: "REPORTS" },
  { name: "activity:view", description: "View activity logs", module: "ACTIVITY" },
  { name: "settings:view", description: "View settings", module: "SETTINGS" },
  { name: "settings:update", description: "Update settings", module: "SETTINGS" },
];

const ROLE_PERMISSIONS = {
  STORE_KEEPER: [
    "product:view", "product:create", "product:update", "product:delete",
    "category:view", "inventory:view", "inventory:manage",
    "order:view", "order:update",
  ],
  ADMIN: PERMISSIONS.map((p) => p.name),
};

async function main() {
  console.log("Seeding permissions...");

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
  }

  for (const [role, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permName of permNames) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId: permission.id } },
        update: {},
        create: { role, permissionId: permission.id },
      });
    }
  }

  console.log("Permissions seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
