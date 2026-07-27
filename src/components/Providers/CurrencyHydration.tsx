"use client";

import { useEffect } from "react";
import { setCurrency } from "@/utils/formatePrice";

export default function CurrencyHydration({ currency }: { currency: string }) {
  useEffect(() => {
    if (currency) {
      setCurrency(currency);
    }
  }, [currency]);

  return null;
}
