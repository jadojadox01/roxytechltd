"use client";
import { ModalContext } from "@/app/context/QuickViewModalContext";
import { EyeIcon } from "@/assets/icons";
import { useCart } from "@/hooks/useCart";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { Product } from "@/types/product";
import { calculateDiscountPercentage } from "@/utils/calculateDiscountPercentage";
import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useContext } from "react";

type Props = {
  bgClr?: string;
  item: Product;
};

const ProductItem = ({ item, bgClr = "white" }: Props) => {
  const defaultVariant = item?.productVariants?.find((variant) => variant.isDefault);
  const modalContext = useContext(ModalContext);
  const openModal = modalContext?.openModal;
  const dispatch = useDispatch<AppDispatch>();
  const { addItem, buyNow, cartDetails } = useCart();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const isAlradyAdded = Object.values(cartDetails ?? {}).some(
    (cartItem) => cartItem.id === item.id
  );

  const isAlradyWishListed = Object.values(wishlistItems ?? {}).some(
    (wishlistItem) => wishlistItem.id === item.id
  );

  const fallbackImage = "/images/products/product-placeholder.svg";
  const productImage =
    defaultVariant?.image && defaultVariant.image.trim()
      ? defaultVariant.image
      : item?.images?.find((image) => image?.trim()) || fallbackImage;

  const productHref = `/products/${item?.slug}`;

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.discountedPrice ? item.discountedPrice : item.price,
    quantity: 1,
    currency: "usd",
    image: productImage,
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: defaultVariant?.color ? defaultVariant.color : "",
    size: defaultVariant?.size ? defaultVariant.size : "",
  };

  const handleQuickViewUpdate = () => {
    const serializableItem = {
      ...item,
      price: typeof item.price === "object" ? Number(item.price) : item.price,
      discountedPrice:
        item.discountedPrice != null
          ? typeof item.discountedPrice === "object"
            ? Number(item.discountedPrice)
            : item.discountedPrice
          : null,
      updatedAt:
        item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt ?? null,
    };
    dispatch(updateQuickView(serializableItem as any));
    if (openModal) openModal();
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    toast.success("Product added to cart!");
  };

  const handleBuyNow = () => {
    buyNow(cartItem);
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

  const bgClass = bgClr === "white" ? "bg-white" : "bg-[#F6F7FB]";

  return (
    <div className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 transition duration-200 hover:border-[#1c2ea3] hover:shadow-lg">
      <div className={`relative mb-3 overflow-hidden rounded-lg ${bgClass}`}>
        {item.discountedPrice && item.discountedPrice > 0 ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#ff7a1a] px-2 py-1 text-xs font-semibold text-white">
            {calculateDiscountPercentage(item.discountedPrice, item.price)}% OFF
          </span>
        ) : null}
        <Link href={productHref} className="relative block aspect-square overflow-hidden">
          <Image
            src={productImage}
            alt={item.title || "product-image"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 pb-3 duration-200 ease-linear group-hover:translate-y-0">
          <button
            onClick={handleQuickViewUpdate}
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
          >
            <EyeIcon />
          </button>
          <button
            onClick={handleItemToWishList}
            aria-label="Add to wishlist"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-white transition ${
              isAlradyWishListed
                ? "border-[#ff7a1a] text-[#ff7a1a]"
                : "border-slate-200 text-slate-800 hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
            }`}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill={isAlradyWishListed ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-slate-900 transition hover:text-[#1c2ea3]">
        <Link href={productHref}>{item.title}</Link>
      </h3>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg font-bold text-slate-900">
          {formatPrice(item.discountedPrice || item.price)}
        </span>
        {item.discountedPrice ? (
          <span className="text-sm text-slate-400 line-through">{formatPrice(item.price)}</span>
        ) : null}
      </div>

      {isAlradyAdded ? (
        <Link
          href="/cart"
          className="mt-auto w-full rounded-full bg-[#1c2ea3] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#16257e]"
        >
          View in Cart
        </Link>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border border-[#1c2ea3] py-2.5 text-xs font-semibold text-[#1c2ea3] transition hover:bg-[#1c2ea3]/5 sm:text-sm"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full rounded-full bg-[#ff7a1a] py-2.5 text-xs font-semibold text-white transition hover:bg-[#e7680d] sm:text-sm"
          >
            Buy Now
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductItem;
