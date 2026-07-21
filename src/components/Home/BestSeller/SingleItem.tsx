"use client";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Product } from "@/types/product";
import { formatPrice } from "@/utils/formatePrice";
import { EyeIcon } from "@/assets/icons";
import { calculateDiscountPercentage } from "@/utils/calculateDiscountPercentage";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const SingleItem = ({ item }: { item: Product }) => {
  const defaultVariant = item?.productVariants.find(
    (variant) => variant.isDefault
  );
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();
  const { addItem, cartDetails } = useCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === item.id
  )
    ? true
    : false;

  const isAlradyWishListed = Object.values(wishlistItems ?? {}).some(
    (wishlistItem) => wishlistItem.id === item.id
  )
    ? true
    : false;

  const fallbackImage = "/images/products/product-placeholder.svg";
  const productImage = defaultVariant?.image && defaultVariant.image.trim()
    ? defaultVariant.image
    : item?.images?.find((image) => image?.trim()) || fallbackImage;

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.discountedPrice ? item.discountedPrice : item.price,
    currency: "usd",
    image: productImage,
    price_id: null,
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: defaultVariant?.color ? defaultVariant.color : "",
    size: defaultVariant?.size ? defaultVariant.size : "",
  };

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    const serializableItem = {
      ...item,
      price: typeof item.price === "object" ? Number(item.price) : item.price,
      discountedPrice: item.discountedPrice != null
        ? (typeof item.discountedPrice === "object" ? Number(item.discountedPrice) : item.discountedPrice)
        : null,
      updatedAt: item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : item.updatedAt ?? null,
    };
    dispatch(updateQuickView(serializableItem as any));
    openModal();
  };

  // add to cart
  const handleAddToCart = () => {
    if (item.quantity > 0) {
      // @ts-ignore
      addItem(cartItem);
      toast.success("Product added to cart!");
    } else {
      toast.error("This product is out of stock!");
    }
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: item.id,
        title: item.title,
        slug: item.slug,
        image: productImage,
        price: item.discountedPrice ? item.discountedPrice : item.price,
        quantity: item.quantity,
        color: defaultVariant?.color ? defaultVariant.color : "",
      })
    );
  };

  return (
    <div className="group flex flex-col rounded-xl border border-gray-3 bg-white p-3 transition duration-200 hover:border-blue hover:shadow-lg">
      <div className="relative mb-3 overflow-hidden rounded-lg bg-[#F6F7FB]">
        {item.discountedPrice && item.discountedPrice > 0 ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-yellow px-2 py-1 text-xs font-semibold text-dark">
            {calculateDiscountPercentage(item.discountedPrice, item.price)}% OFF
          </span>
        ) : null}
        {item.quantity < 1 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}

        <Link
          href={`/products/${item?.slug}`}
          className="flex aspect-square items-center justify-center p-4"
        >
          <Image
            src={productImage}
            alt={item.title || "product-image"}
            width={260}
            height={260}
            className="max-h-[220px] w-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 pb-3 duration-200 ease-linear group-hover:translate-y-0">
          <button
            onClick={handleQuickViewUpdate}
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-3 bg-white text-dark transition hover:border-blue hover:text-blue"
          >
            <EyeIcon />
          </button>
          <button
            onClick={handleItemToWishList}
            aria-label="Add to wishlist"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-white transition ${
              isAlradyWishListed
                ? "border-blue text-blue"
                : "border-gray-3 text-dark hover:border-blue hover:text-blue"
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill={isAlradyWishListed ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="mb-1.5 line-clamp-2 text-sm font-medium text-dark transition hover:text-blue">
        <Link href={`/products/${item?.slug}`}>{item.title}</Link>
      </h3>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg font-bold text-dark">
          {formatPrice(item.discountedPrice || item.price)}
        </span>
        {item.discountedPrice ? (
          <span className="text-sm text-dark-4 line-through">
            {formatPrice(item.price)}
          </span>
        ) : null}
      </div>

      {isAlradyAdded ? (
        <Link
          href="/cart"
          className="mt-auto w-full rounded-full bg-blue py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-dark"
        >
          View in Cart
        </Link>
      ) : (
        <button
          onClick={handleAddToCart}
          disabled={item.quantity < 1}
          className="mt-auto w-full rounded-full bg-blue py-2.5 text-sm font-semibold text-white transition hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {item.quantity > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      )}
    </div>
  );
};

export default SingleItem;
