"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useDispatch } from "react-redux";
import {
  removeAllItemsFromWishlist,
  removeItemFromWishlist,
} from "@/redux/features/wishlist-slice";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { formatPrice } from "@/utils/formatePrice";

const WishlistPageContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const { addItem, buyNow, cartDetails } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="rounded-2xl border border-[#e8ecff] bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d4ddff] bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Your wishlist is empty
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Save products you love and they will appear here.
        </p>
        <Link
          href="/shop-without-sidebar"
          className="mt-6 inline-flex rounded-lg bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const handleAddToCart = (item: (typeof wishlistItems)[number]) => {
    if (item.quantity < 1) {
      toast.error("This product is out of stock!");
      return;
    }

    addItem({
      id: item.id,
      name: item.title,
      price: item.price,
      quantity: 1,
      currency: "usd",
      image: item.image,
      slug: item.slug,
      availableQuantity: item.quantity,
      color: item.color ?? "",
      size: "",
    });
    toast.success("Product added to cart!");
  };

  const handleBuyNow = (item: (typeof wishlistItems)[number]) => {
    if (item.quantity < 1) {
      toast.error("This product is out of stock!");
      return;
    }

    buyNow({
      id: item.id,
      name: item.title,
      price: item.price,
      currency: "usd",
      image: item.image,
      slug: item.slug,
      quantity: 1,
      availableQuantity: item.quantity,
      color: item.color ?? "",
      size: "",
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
      <div className="space-y-4">
        {wishlistItems.map((item) => {
          const isAlreadyInCart = Object.values(cartDetails ?? {}).some(
            (cartItem) => cartItem.id === item.id
          );

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-[#e8ecff] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <Link
                href={`/products/${item.slug}`}
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-50"
              >
                <Image
                  src={item.image || "/images/products/product-placeholder.svg"}
                  alt={item.title}
                  width={96}
                  height={96}
                  className="h-20 w-20 object-contain"
                />
              </Link>

              <div className="flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-lg font-semibold text-slate-900 hover:text-[#1c2ea3]"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-slate-600">
                  {formatPrice(item.price)}
                </p>
                {item.color && (
                  <p className="mt-1 text-sm text-slate-500">
                    Color: {item.color}
                  </p>
                )}
                <p className="mt-1 text-sm text-slate-500">
                  {item.quantity > 0 ? "In stock" : "Out of stock"}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.quantity < 1 || isAlreadyInCart}
                    className="inline-flex rounded-lg border border-[#1c2ea3] px-4 py-2 text-sm font-semibold text-[#1c2ea3] transition hover:bg-[#eef2ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isAlreadyInCart
                      ? "In cart"
                      : item.quantity > 0
                        ? "Add to cart"
                        : "Out of stock"}
                  </button>
                  <button
                    onClick={() => handleBuyNow(item)}
                    disabled={item.quantity < 1}
                    className="inline-flex rounded-lg bg-[#ff7a1a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e7680d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => dispatch(removeItemFromWishlist(item.id))}
                    className="text-sm font-medium text-red-500 transition hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => dispatch(removeAllItemsFromWishlist())}
          className="text-sm font-semibold text-slate-600 transition hover:text-[#1c2ea3]"
        >
          Clear wishlist
        </button>
      </div>

      <aside className="rounded-2xl border border-[#e8ecff] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Wishlist summary</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Saved items</span>
            <span>{wishlistItems.length}</span>
          </div>
        </div>

        <Link
          href="/shop-without-sidebar"
          className="mt-6 flex w-full justify-center rounded-lg bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Continue shopping
        </Link>
        <Link
          href="/cart"
          className="mt-3 flex w-full justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
        >
          View cart
        </Link>
      </aside>
    </div>
  );
};

export default WishlistPageContent;
