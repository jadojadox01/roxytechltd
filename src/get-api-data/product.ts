import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { activeProductWhere } from "@/lib/schema-capabilities";
import { slugify } from "@/lib/slugify";

const mapProductsWithReviews = (products: any[]) =>
  products.map((product: any) => {
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

    const toNum = (value: unknown) => {
      if (value == null) return null;
      if (typeof value === "object" && value !== null && "toNumber" in value) {
        return (value as { toNumber: () => number }).toNumber();
      }
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    return {
      ...item,
      productVariants: derivedVariants,
      reviews: _count?.reviews ?? 0,
      price: toNum(item.price) ?? 0,
      discountedPrice: toNum(item.discountedPrice),
    };
  });

export const getProductsIdAndTitle = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
      },
    });
  },
  ["product-id-title"],
  { tags: ["products"] }
);

export const getNewArrivalsProduct = unstable_cache(
  async () => {
    try {
      const selectFields = {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
        images: true,
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      } as const;

      // Show flagged arrivals even if stock is 0 so admin toggles are visible.
      const products = await prisma.product.findMany({
        where: { isNewArrival: true },
        orderBy: { updatedAt: "desc" },
        select: selectFields,
        take: 8,
      });

      return mapProductsWithReviews(products as any[]);
    } catch (error) {
      console.error("[getNewArrivalsProduct]", error);
      return [];
    }
  },
  ["products-new-arrivals"],
  { tags: ["products", "products-new-arrivals"] }
);

/** Featured catalog strip for homepage (not limited to discounted deals). */
export const getFeaturedProducts = unstable_cache(
  async () => {
    try {
      const selectFields = {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
        images: true,
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
      } as const;

      // Prefer discounted items, then fill with latest products.
      const deals = await prisma.product.findMany({
        where: {
          discountedPrice: { not: null },
        },
        select: selectFields,
        orderBy: { updatedAt: "desc" },
        take: 6,
      });

      if (deals.length >= 3) {
        return mapProductsWithReviews(deals as any[]);
      }

      const latest = await prisma.product.findMany({
        select: selectFields,
        orderBy: { updatedAt: "desc" },
        take: 6,
      });

      const merged = [...deals];
      for (const item of latest) {
        if (!merged.some((p) => p.id === item.id)) merged.push(item);
        if (merged.length >= 6) break;
      }

      return mapProductsWithReviews(merged as any[]);
    } catch (error) {
      console.error("[getFeaturedProducts]", error);
      return [];
    }
  },
  ["featured-products"],
  { tags: ["products", "featured-products"] }
);

export const getBestSellingProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
      orderBy: [{ reviews: { _count: "desc" } }, { updatedAt: "desc" }],
      take: 6,
    });
    return mapProductsWithReviews(products as any[]);
  },
  ["products-best-selling"],
  { tags: ["products"] }
);

export const getDealProducts = unstable_cache(
  async () => {
    try {
      const selectFields = {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
        images: true,
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
      } as const;

      const productFilter = await activeProductWhere();

      const products = await prisma.product.findMany({
        where: {
          discountedPrice: { not: null },
          ...productFilter,
        },
        select: selectFields,
        orderBy: { updatedAt: "desc" },
        take: 12,
      });

      return mapProductsWithReviews(products as any[]);
    } catch (error) {
      console.error("[getDealProducts]", error);
      return [];
    }
  },
  ["deal-products"],
  { tags: ["products", "deal-products"] }
);

export const getLatestProducts = unstable_cache(
  async () => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
      orderBy: [{ reviews: { _count: "desc" } }, { updatedAt: "desc" }],
      take: 3,
    });
    return mapProductsWithReviews(products as any[]);
  },
  ["products-latest"],
  { tags: ["products"] }
);

export const getAllProducts = unstable_cache(
  async (
    orderBy:
      | { updatedAt?: Prisma.SortOrder }
      | { reviews: { _count: Prisma.SortOrder } } = { updatedAt: "desc" }
  ) => {
    const products = await prisma.product.findMany({
      orderBy,
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
          select: {
            id: true,
            title: true,
            slug: true,
          },
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
    });
    return mapProductsWithReviews(products as any[]);
  },
  ["products-all"],
  { tags: ["products"] }
);

export const getProductBySlug = async (slug: string) => {
  const raw = decodeURIComponent(slug || "").trim();
  const candidates = Array.from(
    new Set([raw, raw.replace(/\+/g, " "), slugify(raw)].filter(Boolean))
  );

  let product = null;
  for (const candidate of candidates) {
    product = await prisma.product.findUnique({
      where: { slug: candidate },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        description: true,
        price: true,
        discountedPrice: true,
        slug: true,
        quantity: true,
        updatedAt: true,
        images: true,
        category: {
          select: {
            title: true,
            slug: true,
          },
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
        additionalInformation: {
          select: {
            name: true,
            description: true,
          },
        },
        customAttributes: {
          select: {
            attributeName: true,
            attributeValues: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        body: true,
        tags: true,
        offers: true,
        sku: true,
      },
    });
    if (product) break;
  }

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
    reviews: product._count.reviews,
  };
};

export const getProductById = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      productVariants: true,
      additionalInformation: {
        select: {
          name: true,
          description: true,
        },
      },
      customAttributes: {
        select: {
          attributeName: true,
          attributeValues: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
  const transformProduct = {
    ...product,
    price: product?.price.toNumber(),
    discountedPrice: product?.discountedPrice ? product.discountedPrice.toNumber() : null,
  };
  return transformProduct;
};

export const getRelatedProducts = unstable_cache(
  async (category: string, tags: string[] | undefined, currentProductId: string, productTitle: string) => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        discountedPrice: true,
        quantity: true,
        updatedAt: true,
        tags: true,
        category: {
          select: {
            title: true,
          },
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
            reviews: {
              where: {
                isApproved: true,
              },
            },
          },
        },
      },
      where: {
        id: {
          not: currentProductId,
        },
        OR: [
          {
            category: {
              title: {
                contains: category,
                mode: "insensitive",
              },
            },
          },
          {
            tags: {
              hasSome: tags,
            },
          },
          {
            title: {
              contains: productTitle,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
    });

    return mapProductsWithReviews(products as any[]);
  },
  ["related-products"],
  { tags: ["products", "related-products"] }
);
