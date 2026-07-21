import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/get-api-data/product";
import { getReviews } from "@/get-api-data/reviews";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | ROXY TECH`,
    description: product.shortDescription || product.description || "",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [product, reviewData] = await Promise.all([
    getProductBySlug(slug),
    getReviews(slug),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product as any}
      reviewData={reviewData}
    />
  );
}
