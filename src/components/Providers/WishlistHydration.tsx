"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setWishlistItems } from "@/redux/features/wishlist-slice";
import { WishlistItem } from "@/types/wishlistItem";

export default function WishlistHydration() {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wishlistItems");
      if (!raw) return;

      const parsed = JSON.parse(raw) as WishlistItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        dispatch(setWishlistItems(parsed));
      }
    } catch {
      localStorage.removeItem("wishlistItems");
    }
  }, [dispatch]);

  return null;
}
