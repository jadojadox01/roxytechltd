import { getApprovedReviews } from "@/get-api-data/review";
import { getSiteName } from "@/get-api-data/seo-setting";
import Testimonials from "./index";

const TestimonialsSection = async () => {
  const [reviews, siteName] = await Promise.all([
    getApprovedReviews(),
    getSiteName(),
  ]);

  const mapped = reviews.map((review) => ({
    id: review.id,
    review: review.comment,
    authorName: review.name,
    authorImg:
      review.product?.images?.[0] ||
      "/images/products/product-placeholder.svg",
    authorRole: review.product?.title || "Verified Customer",
    ratings: review.ratings,
  }));

  return <Testimonials reviews={mapped} siteName={siteName} />;
};

export default TestimonialsSection;
