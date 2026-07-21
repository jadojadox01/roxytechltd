import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

const mapProductsWithReviews = (products: any[]) =>
  products.map((product: any) => {
    const { _count, ...item } = product;
    const variantImages = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : ["/images/products/product-placeholder.png"];
    const derivedVariants = Array.isArray(item.productVariants) && item.productVariants.length > 0
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
      reviews: _count.reviews,
      price: item.price.toNumber(),
      discountedPrice: item?.discountedPrice ? item.discountedPrice.toNumber() : null,
    };
  });

// get product for id and title 
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
  ['products'], { tags: ['products'] }
);

// get new arrival product
export const getNewArrivalsProduct = unstable_cache(
  async () => {
    const selectFields = {
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
          isDefault: true
        }
      },
      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true
            }
          },
        }
      }
    } as const;

    // Prefer products the admin explicitly flagged as new arrivals
    let products = await prisma.product.findMany({
      where: { isNewArrival: true },
      orderBy: { updatedAt: "desc" },
      select: selectFields,
      take: 8
    });

    // Fallback to the most recent products so the section is never empty
    if (products.length === 0) {
      products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        select: selectFields,
        take: 8
      });
    }

    return mapProductsWithReviews(products as any[]);
  },
  ['products'], { tags: ['products'] }
);

// get best selling product
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
            isDefault: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: {
                isApproved: true
              }
            }
          }
        }
      },
      orderBy: [
        { reviews: { _count: "desc" } },
        { updatedAt: "desc" },
      ],
      take: 6
    });
    return mapProductsWithReviews(products as any[]);
  },
  ['products'], { tags: ['products'] }
);

// get latest product
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
            isDefault: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: {
                isApproved: true
              }
            }
          }
        }
      },
      orderBy: [
        { reviews: { _count: "desc" } },
        { updatedAt: "desc" },
      ],
      take: 3
    });
    return mapProductsWithReviews(products as any[]);
  },
  ['products'], { tags: ['products'] }
);


// GET ALL PRODUCTS
export const getAllProducts = unstable_cache(
  async (
    orderBy: { updatedAt?: Prisma.SortOrder } | { reviews: { _count: Prisma.SortOrder } } = { updatedAt: 'desc' }
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
        productVariants: {
          select: {
            image: true,
            color: true,
            size: true,
            isDefault: true
          }
        },
        _count: {
          select: {
            reviews: {
              where: {
                isApproved: true
              }
            }
          }
        }
      },
    })
    return mapProductsWithReviews(products as any[]);
  },
  ['products'], { tags: ['products'] }
);

// GET PRODUCT BY SLUG
export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
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
          isDefault: true
        }
      },
      _count: {
        select: {
          reviews: {
            where: {
              isApproved: true
            }
          }
        }
      },
      additionalInformation: {
        select: {
          name: true,
          description: true
        }
      },
      customAttributes: {
        select: {
          attributeName: true,
          attributeValues: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      body: true,
      reviews: {
        select: {
          name: true,
          comment: true,
          email: true,
          ratings: true
        }
      },
      tags: true,
      offers: true,
      sku: true,
    },
  });
  const transformProduct = {
    ...product,
    price: product?.price.toNumber(),
    discountedPrice: product?.discountedPrice ? product.discountedPrice.toNumber() : null,
    reviews: product?._count.reviews,
  }
  return transformProduct;
}

// GET PRODUCT BY ID
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
  })
  const transformProduct = {
    ...product,
    price: product?.price.toNumber(),
    discountedPrice: product?.discountedPrice ? product.discountedPrice.toNumber() : null
  }
  return transformProduct;
};


export const getRelatedProducts = unstable_cache(
  async (category: string, tags: string[] | undefined, currentProductId: string,productTitle:string) => {
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
        category:{
          select: {
            title: true
          }
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
          not: currentProductId, // Exclude the current product
        },
        OR: [
          {
            category:{
              title: {
                contains: category,
                mode: 'insensitive',
              },
            }
          },
          {
            tags: {
              hasSome: tags,
            }
          },
          {
            title: {
              contains: productTitle,
              mode: 'insensitive',
            }
          }
        ]
      },
      
      orderBy: {
        updatedAt: 'desc',
      },
      take: 8, // or however many related items you want
    });

    return mapProductsWithReviews(products as any[]);
  },
  ['related-products'],
  { tags: ['products'] }
);
