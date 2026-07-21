import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: Category }) => {
  const categoryImage = item.image && item.image.trim()
    ? item.image.startsWith("http") || item.image.startsWith("/")
      ? item.image
      : `/${item.image}`
    : "/images/products/product-placeholder.svg";

  return (
    <Link
      href={`/categories/${item.slug}`}
      className="group flex flex-col items-center rounded-xl p-2 transition hover:translate-y-[-2px]"
    >
      <div className="mb-4 flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full bg-[#F2F3F8]">
        <Image
          src={categoryImage}
          alt={item.title}
          width={90}
          height={90}
          className="h-[90px] w-[90px] object-cover"
        />
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block text-center text-base font-medium text-dark duration-500 group-hover:text-teal">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
