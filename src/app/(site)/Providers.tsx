"use client";
import { ModalProvider } from "../context/QuickViewModalContext";
import { ReduxProvider } from "@/redux/provider";
import { SessionProvider } from "next-auth/react";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import CartProvider from "@/components/Providers/CartProvider";
import CartHydration from "@/components/Providers/CartHydration";
import WishlistHydration from "@/components/Providers/WishlistHydration";
import CurrencyHydration from "@/components/Providers/CurrencyHydration";

const Providers = ({
  children,
  currency = "RWF",
}: {
  children: React.ReactNode;
  currency?: string;
}) => {
  return (
    <SessionProvider>
      <ReduxProvider>
        <CurrencyHydration currency={currency} />
        <CartHydration />
        <WishlistHydration />
        <CartProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              {children}
              <QuickViewModal />
              <CartSidebarModal />
              <PreviewSliderModal />
            </PreviewSliderProvider>
          </ModalProvider>
        </CartProvider>
      </ReduxProvider>
    </SessionProvider>
  );
};

export default Providers;