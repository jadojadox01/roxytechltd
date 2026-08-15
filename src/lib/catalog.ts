import { prisma } from "@/lib/prismaDB";
import { activeProductWhere } from "@/lib/schema-capabilities";

function toNum(value: unknown) {
  if (value == null) return null;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapProduct(product: any) {
  const { _count, ...item } = product;
  const variantImages =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : ["/images/products/product-placeholder.svg"];
  const derivedVariants =
    Array.isArray(item.productVariants) && item.productVariants.length > 0
      ? item.productVariants
      : variantImages.map((image: string, index: number) => ({
          image,
          color: null,
          size: null,
          isDefault: index === 0,
        }));

  return {
    ...item,
    productVariants: derivedVariants,
    reviews: _count?.reviews ?? 0,
    price: toNum(item.price) ?? 0,
    discountedPrice: toNum(item.discountedPrice),
    updatedAt:
      item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  };
}

export type CatalogQuery = {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function getCatalogPage(params: CatalogQuery = {}) {
  const page = Math.max(1, Number(params.page || 1));
  const limit = Math.min(24, Math.max(4, Number(params.limit || 12)));
  const category = params.category?.trim() || "";
  const sort = params.sort || "latest";
  const q = params.q?.trim() || "";
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;

  const productFilter = await activeProductWhere();
  const andFilters: Record<string, unknown>[] = [];

  if (category) {
    andFilters.push({ category: { slug: category } });
  }

  if (q) {
    andFilters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (
    (minPrice != null && Number.isFinite(minPrice)) ||
    (maxPrice != null && Number.isFinite(maxPrice) && maxPrice !== Infinity)
  ) {
    const priceFilter: Record<string, number> = {};
    if (minPrice != null && Number.isFinite(minPrice)) priceFilter.gte = minPrice;
    if (maxPrice != null && Number.isFinite(maxPrice) && maxPrice !== Infinity) {
      priceFilter.lt = maxPrice;
    }
    andFilters.push({
      OR: [
        { discountedPrice: priceFilter },
        { AND: [{ discountedPrice: null }, { price: priceFilter }] },
      ],
    });
  }

  const where: Record<string, unknown> =
    andFilters.length > 0 ? { AND: [productFilter, ...andFilters] } : productFilter;

  let orderBy: Record<string, unknown> | Record<string, unknown>[] = {
    updatedAt: "desc",
  };
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name-asc":
      orderBy = { title: "asc" };
      break;
    case "name-desc":
      orderBy = { title: "desc" };
      break;
    case "oldest":
      orderBy = { updatedAt: "asc" };
      break;
    case "popular":
      orderBy = [{ reviews: { _count: "desc" } }, { updatedAt: "desc" }];
      break;
    default:
      orderBy = { updatedAt: "desc" };
  }

  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    prisma.product.count({ where: where as never }),
    prisma.product.findMany({
      where: where as never,
      orderBy: orderBy as never,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
        images: true,
        category: {
          select: { id: true, title: true, slug: true },
        },
        productVariants: {
          select: {
            image: true,
            color: true,
            size: true,
            isDefault: true,
          },
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
          },
        },
      },
    }),
  ]);

  const products = rows.map(mapProduct);
  const hasMore = skip + products.length < total;

  return { products, page, limit, total, hasMore };
}
