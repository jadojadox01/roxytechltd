"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import ReviewStar from "@/components/Shop/ReviewStar";
import toast from "react-hot-toast";

type Variant = {
  image: string;
  color?: string | null;
  size?: string | null;
  isDefault: boolean;
};

type Review = {
  name: string;
  email: string;
  comment: string;
  ratings: number;
};

type CustomAttribute = {
  attributeName: string;
  attributeValues: { id: string; title: string }[];
};

type AdditionalInfo = {
  name: string;
  description?: string | null;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  body?: string | null;
  price: number;
  discountedPrice?: number | null;
  quantity: number;
  sku?: string | null;
  tags: string[];
  offers: string[];
  images: string[];
  productVariants: Variant[];
  reviews: number;
  category?: { title: string; slug: string } | null;
  additionalInformation: AdditionalInfo[];
  customAttributes: CustomAttribute[];
};

type ReviewItem = {
  name: string;
  email: string;
  comment: string;
  ratings: number;
};

type ReviewData = {
  reviews: ReviewItem[];
  avgRating: number;
  totalRating: number;
};

type RelatedProduct = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountedPrice?: number | null;
  productVariants?: Variant[];
};

type Props = {
  product: Product;
  reviewData: ReviewData;
  relatedProducts?: RelatedProduct[];
};

export default function ProductDetailClient({
  product,
  reviewData,
  relatedProducts = [],
}: Props) {
  const { addItem, buyNow } = useCart();
  const [selectedImage, setSelectedImage] = useState(
    (product.productVariants ?? []).find((v) => v.isDefault)?.image ||
      (product.productVariants ?? [])[0]?.image ||
      (product.images ?? [])[0] ||
      "/images/products/product-placeholder.png"
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "info" | "reviews">("description");

  // Review form
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", comment: "", ratings: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);

  const allImages = [
    ...(product.productVariants ?? []).map((v) => v.image),
    ...(product.images ?? []).filter((img) => !(product.productVariants ?? []).some((v) => v.image === img)),
  ].filter(Boolean);

  const effectivePrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: effectivePrice,
      quantity,
      image: selectedImage,
      slug: product.slug,
      availableQuantity: product.quantity,
    });
    toast.success(`${product.title} added to cart`);
  };

  const handleBuyNow = () => {
    buyNow({
      id: product.id,
      name: product.title,
      price: effectivePrice,
      quantity,
      image: selectedImage,
      slug: product.slug,
      availableQuantity: product.quantity,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.email || !reviewForm.comment) return;

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reviewForm, productSlug: product.slug }),
      });
      if (res.ok) {
        toast.success("Review submitted for approval. Thank you!");
        setReviewForm({ name: "", email: "", comment: "", ratings: 5 });
      } else {
        toast.error("Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0071CE] transition">Home</Link>
          <span>/</span>
          <Link href="/shop-without-sidebar" className="hover:text-[#0071CE] transition">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-[#0071CE] transition">
                {product.category.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Images */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-contain p-4"
              />
              {hasDiscount && (
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === img
                        ? "border-[#0071CE] ring-2 ring-[#0071CE]/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-4">
            {/* Category */}
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex w-fit items-center rounded-full bg-[#0071CE]/10 px-3 py-1 text-xs font-medium text-[#0071CE] hover:bg-[#0071CE]/20 transition"
              >
                {product.category.title}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating — only shown when there are approved reviews */}
            {reviewData.totalRating > 0 && (
              <div className="flex items-center gap-2">
                <ReviewStar avgRating={reviewData.avgRating} />
                <span className="text-sm text-slate-600">
                  {reviewData.avgRating.toFixed(1)} · {reviewData.totalRating} review{reviewData.totalRating !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-700">SKU:</span> {product.sku}
                </div>
              </div>
            )}

            {/* Custom Attributes */}
            {product.customAttributes?.map((attr) => (
              <div key={attr.attributeName}>
                <p className="mb-2 text-sm font-medium text-slate-700">{attr.attributeName}</p>
                <div className="flex flex-wrap gap-2">
                  {attr.attributeValues.map((val) => (
                    <span
                      key={val.id}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#0071CE] hover:bg-[#e6f1fa] cursor-pointer transition"
                    >
                      {val.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity + Add to Cart / Buy Now */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition font-bold text-lg"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[48px] text-center text-sm font-semibold text-slate-900 py-2.5 border-x border-slate-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2.5 text-slate-600 hover:bg-slate-50 transition font-bold text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 sm:flex-none rounded-lg border border-[#0071CE] bg-white px-6 py-2.5 text-sm font-semibold text-[#0071CE] transition hover:bg-[#0071CE]/5 sm:px-8"
                >
                  Add to Cart
                </button>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full rounded-lg bg-[#02AAA4] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#028f86] sm:w-auto sm:px-8"
              >
                Buy Now
              </button>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Tags:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Offers */}
            {product.offers?.length > 0 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1.5">
                  Available Offers
                </p>
                <ul className="space-y-1">
                  {product.offers.map((offer, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {offer}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Description / Additional Info / Reviews */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab nav */}
          <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-none">
            {(["description", "info", "reviews"] as const).map((tab) => {
              const labels: Record<string, string> = {
                description: "Description",
                info: `Additional Info (${product.additionalInformation?.length ?? 0})`,
                reviews: `Reviews (${reviewData.totalRating})`,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[#0071CE] text-[#0071CE]"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "description" && (
              <div className="prose prose-sm sm:prose max-w-none text-slate-700">
                {product.description ? (
                  <p className="leading-relaxed">{product.description}</p>
                ) : (
                  <p className="text-slate-500 italic">No description provided.</p>
                )}
                {product.body && (
                  <div
                    className="mt-4"
                    dangerouslySetInnerHTML={{ __html: product.body }}
                  />
                )}
              </div>
            )}

            {activeTab === "info" && (
              <div>
                {product.additionalInformation?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-slate-100">
                        {product.additionalInformation.map((info) => (
                          <tr key={info.name} className="hover:bg-slate-50">
                            <td className="py-3 pr-6 font-medium text-slate-700 whitespace-nowrap w-1/3">
                              {info.name}
                            </td>
                            <td className="py-3 text-slate-600">
                              {info.description || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No additional information provided.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Existing reviews */}
                {reviewData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900">
                          {reviewData.avgRating.toFixed(1)}
                        </div>
                        <ReviewStar avgRating={reviewData.avgRating} />
                        <div className="text-xs text-slate-500 mt-1">
                          {reviewData.totalRating} review{reviewData.totalRating !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reviewData.reviews.map((review, idx) => (
                        <div key={idx} className="py-4">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="font-semibold text-slate-900">{review.name}</p>
                              <ReviewStar avgRating={review.ratings} />
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    No reviews yet. Be the first to review this product.
                  </p>
                )}

                {/* Review form */}
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
                    {/* Star rating */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((f) => ({ ...f, ratings: star }))}
                            className="text-2xl leading-none transition"
                          >
                            <span className={star <= reviewForm.ratings ? "text-yellow-400" : "text-slate-300"}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Name</label>
                      <input
                        required
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Email</label>
                      <input
                        required
                        type="email"
                        value={reviewForm.email}
                        onChange={(e) => setReviewForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Your email"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Comment</label>
                      <textarea
                        required
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        placeholder="Share your experience with this product..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="rounded-lg bg-[#0071CE] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900">Related products</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.slice(0, 8).map((item) => {
                const image =
                  item.productVariants?.find((v) => v.isDefault)?.image ||
                  item.productVariants?.[0]?.image ||
                  "/images/products/product-placeholder.svg";
                const price = item.discountedPrice ?? item.price;
                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#1c2ea3] hover:shadow-sm"
                  >
                    <img
                      src={image}
                      alt={item.title}
                      className="mx-auto h-28 w-full object-contain"
                    />
                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#ff7a1a]">
                      {formatPrice(price)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
