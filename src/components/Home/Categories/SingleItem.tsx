import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const resolveImage = (image: string | null) => {
  if (image?.trim()) {
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `/${image}`;
  }
  return "/images/products/product-placeholder.svg";
};

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <Link
      href={`/categories/${item.slug}`}
      className="group flex flex-col items-center rounded-2xl border border-gray-3 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg hover:shadow-teal/10"
    >
      <div className="mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gray-1 ring-1 ring-gray-3/50 transition group-hover:ring-teal/30">
        <Image
          src={resolveImage(item.image)}
          alt={item.title}
          width={80}
          height={80}
          className="h-16 w-16 object-cover transition duration-500 group-hover:scale-110"
        />
      </div>
      <h3 className="line-clamp-1 text-center text-sm font-semibold text-dark transition group-hover:text-teal">
        {item.title}
      </h3>
      <span className="mt-0.5 text-xs text-dark-4">{item.productCount || 0} items</span>
    </Link>
  );
};

export default SingleItem;
