import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/get-api-data/product";
import { getReviews } from "@/get-api-data/reviews";
import { getSiteName } from "@/get-api-data/seo-setting";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(decodeURIComponent(slug));
  if (!product) return { title: "Product Not Found" };
  const siteName = await getSiteName();
  return {
    title: `${product.title} | ${siteName}`,
    description: product.shortDescription || product.description || "",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    notFound();
  }

  const reviewData = await getReviews(product.slug);

  return (
    <ProductDetailClient
      product={product as any}
      reviewData={reviewData}
    />
  );
}
