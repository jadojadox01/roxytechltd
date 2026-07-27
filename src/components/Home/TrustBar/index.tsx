import { prisma } from "@/lib/prismaDB";
import { PackageIcon, UsersIcon, GridIcon } from "@/assets/icons/home";
import { activeProductWhere } from "@/lib/schema-capabilities";

async function getStats() {
  try {
    const productFilter = await activeProductWhere();
    const [products, categories, customers] = await Promise.all([
      prisma.product.count({ where: productFilter }),
      prisma.category.count(),
      prisma.user.count({ where: { role: "USER" } }),
    ]);
    return { products, categories, customers };
  } catch {
    return { products: 0, categories: 0, customers: 0 };
  }
}

const TrustBar = async () => {
  const stats = await getStats();

  const items = [
    stats.products > 0 && {
      icon: PackageIcon,
      value: String(stats.products),
      label: "Products Available",
    },
    stats.categories > 0 && {
      icon: GridIcon,
      value: String(stats.categories),
      label: "Categories",
    },
    stats.customers > 0 && {
      icon: UsersIcon,
      value: String(stats.customers),
      label: "Registered Customers",
    },
  ].filter(Boolean) as { icon: typeof PackageIcon; value: string; label: string }[];

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-gray-3 bg-white">
      <div className="absolute inset-0 bg-gradient-to-r from-teal/[0.03] via-transparent to-blue/[0.03]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 xl:px-0">
        <div
          className={`grid divide-x divide-gray-3 ${
            items.length === 1
              ? "grid-cols-1"
              : items.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {items.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group flex flex-col items-center gap-2 px-4 py-8 text-center transition hover:bg-gray-1/50 sm:flex-row sm:justify-center sm:gap-4 sm:text-left lg:py-10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal transition group-hover:bg-teal group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-bold text-dark sm:text-2xl">{value}</p>
                <p className="text-sm text-dark-3">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
