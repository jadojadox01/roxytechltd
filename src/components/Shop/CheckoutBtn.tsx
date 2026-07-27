"use client";

import React from "react";
import { useCart } from "@/hooks/useCart";

const CheckoutBtn = () => {
  const { goToCheckout } = useCart();

  return (
    <button
      type="button"
      onClick={goToCheckout}
      className="inline-flex rounded-lg bg-dark px-5 py-[7px] text-custom-sm font-medium text-white duration-200 ease-out hover:bg-darkLight"
    >
      Checkout
    </button>
  );
};

export default CheckoutBtn;
