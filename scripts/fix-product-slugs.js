require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const products = await prisma.product.findMany({
      select: { id: true, title: true, slug: true },
    });

    for (const product of products) {
      const nextSlug = slugify(product.slug || product.title);
      if (!nextSlug || nextSlug === product.slug) continue;

      let uniqueSlug = nextSlug;
      let i = 2;
      while (
        await prisma.product.findFirst({
          where: { slug: uniqueSlug, NOT: { id: product.id } },
          select: { id: true },
        })
      ) {
        uniqueSlug = `${nextSlug}-${i++}`;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { slug: uniqueSlug },
      });
      console.log(`Fixed slug: "${product.slug}" -> "${uniqueSlug}"`);
    }

    console.log("Done");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
