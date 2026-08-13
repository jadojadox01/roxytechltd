"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import SearchBar from "./SearchBar";
import {
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { HeaderSetting } from "@prisma/client";
import { useAppSelector } from "@/redux/store";
import { useSession, signOut } from "next-auth/react";
import type { MenuItem } from "./types";

type SiteSettings = {
  id: string;
  about: string | null;
  mission: string | null;
  vision: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  currency: string;
};

type HeaderCategory = {
  id: string;
  title: string;
  slug: string;
};

type IProps = {
  headerData?: (HeaderSetting & { siteName?: string | null }) | null;
  siteName?: string;
  siteSettings?: SiteSettings | null;
  categories?: HeaderCategory[];
};

const MainHeader = ({ headerData, siteName = "Shop", siteSettings, categories = [] }: IProps) => {
  const { data: session, status } = useSession();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { handleCartClick, cartCount } = useCart();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer).items
    ?.length;

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userMenuOpen]);

  const isLoggedIn = status === "authenticated" && session?.user;
  const userName = session?.user?.name || session?.user?.email || "Account";
  const currency = siteSettings?.currency || "RWF";
  const displaySiteName = headerData?.siteName?.trim() || siteName;

  const defaultHeaderText =
    currency === "RWF"
      ? `${displaySiteName} — stationery, school & office supplies across Rwanda`
      : `Shop quality products at ${displaySiteName}`;

  const dynamicMenu: MenuItem[] = [
    { title: "Home", path: "/" },
    { title: "Products", path: "/shop-with-sidebar" },
    {
      title: "Categories",
      submenu:
        categories.length > 0
          ? categories.slice(0, 8).map((category) => ({
              title: category.title,
              path: `/categories/${category.slug}`,
            }))
          : [{ title: "Browse shop", path: "/shop-with-sidebar" }],
    },
    { title: "About", path: "/about" },
    ...(isLoggedIn ? [{ title: "Track Order", path: "/track-order" }] : []),
    { title: "Contact", path: "/contact" },
  ];

  const searchPlaceholder =
    categories.length > 0
      ? `Search ${categories
          .slice(0, 3)
          .map((category) => category.title.toLowerCase())
          .join(", ")}...`
      : `Search products at ${displaySiteName}...`;

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-50 bg-white transition-all ease-in-out duration-300 ${
          stickyMenu ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="bg-[#1b2559] py-2">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <p className="text-center text-[11px] font-medium text-white/90 sm:text-xs">
              {headerData?.headerText || defaultHeaderText}
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <div className="flex items-center gap-3 py-3 lg:gap-5">
              <Link className="block shrink-0" href="/">
                <Image
                  src={headerData?.headerLogo || "/images/logo/logo.svg"}
                  alt={displaySiteName}
                  width={640}
                  height={180}
                  priority
                  className="h-20 w-auto max-w-[220px] object-contain sm:h-24 sm:max-w-[280px]"
                />
              </Link>

              <SearchBar
                placeholder={searchPlaceholder}
                className="hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm"
              />

              <div className="hidden lg:block">
                <DesktopMenu menuData={dynamicMenu} stickyMenu={stickyMenu} />
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {isLoggedIn ? (
                  <div className="user-menu-container relative hidden sm:block">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#1c2ea3] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
                      aria-label="Account menu"
                    >
                      <UserIcon />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-3 bg-white py-2 shadow-2">
                        <p className="truncate px-4 py-1 text-xs font-semibold text-slate-500">{userName}</p>
                        <Link
                          href="/user/my-account"
                          className="block px-4 py-2 text-sm text-dark-2 hover:bg-gray-1 hover:text-blue"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/track-order"
                          className="block px-4 py-2 text-sm text-dark-2 hover:bg-gray-1 hover:text-blue"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Track Order
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-dark-2 hover:bg-gray-1 hover:text-blue"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Wishlist
                        </Link>
                        <hr className="my-1 border-gray-2" />
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-red hover:bg-red-light-6"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#1c2ea3] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a] sm:inline-flex"
                    aria-label="Sign in"
                  >
                    <UserIcon />
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#1c2ea3] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
                  aria-label="Wishlist"
                >
                  <HeartIcon />
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff7a1a] px-1 text-[10px] font-semibold text-white">
                    {wishlistCount || 0}
                  </span>
                </Link>

                <button
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#1c2ea3] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
                  onClick={handleOpenCartModal}
                  aria-label="Cart"
                >
                  <CartIcon />
                  <span className="absolute -top-1.5 -right-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff7a1a] px-1 text-[10px] font-semibold text-white">
                    {cartCount || 0}
                  </span>
                </button>

                <Link
                  href="/shop-with-sidebar"
                  className="hidden rounded-lg bg-[#ff7a1a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#e7680d] sm:inline-flex"
                >
                  Shop Now
                </Link>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#1c2ea3] transition hover:border-[#ff7a1a] hover:text-[#ff7a1a] lg:hidden"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                  aria-label={navigationOpen ? "Close menu" : "Open menu"}
                >
                  {navigationOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>

            <div className="pb-3 md:hidden">
              <SearchBar placeholder={searchPlaceholder} className="mx-auto max-w-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Offcanvas */}
      <MobileMenu
        headerLogo={headerData?.headerLogo || null}
        siteName={displaySiteName}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={dynamicMenu}
        categories={categories}
      />
    </>
  );
};

export default MainHeader;
