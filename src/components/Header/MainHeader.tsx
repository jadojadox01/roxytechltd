"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { menuData } from "./menuData";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { HeaderSetting } from "@prisma/client";
import { useAppSelector } from "@/redux/store";
import { useSession, signOut } from "next-auth/react";
import { formatPrice } from "@/utils/formatePrice";

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
  siteSettings?: SiteSettings | null;
  categories?: HeaderCategory[];
};

const MainHeader = ({ headerData, siteSettings, categories = [] }: IProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { handleCartClick, cartCount, totalPrice } = useCart();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer).items
    ?.length;

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/shop-without-sidebar?q=${encodeURIComponent(query)}` : "/shop-without-sidebar");
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

  const defaultHeaderText =
    currency === "RWF"
      ? "Get free delivery on orders over 100,000 RWF"
      : "Get free delivery on qualifying orders";

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-50 bg-white transition-all ease-in-out duration-300 ${
          stickyMenu ? "shadow-md" : "shadow-sm"
        }`}
      >
        {/* Topbar */}
        <div className="bg-blue-dark py-2">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <div className="flex items-center justify-between">
              <p className="hidden text-xs font-medium text-white/90 lg:block">
                {headerData?.headerText || defaultHeaderText}
              </p>
              <div className="flex items-center gap-4 ml-auto lg:ml-0">
                <Link
                  href="/about"
                  className="hidden text-xs font-medium text-white/80 transition hover:text-yellow sm:inline"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="hidden text-xs font-medium text-white/80 transition hover:text-yellow sm:inline"
                >
                  Help
                </Link>
                {isLoggedIn ? (
                  <div className="user-menu-container relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 text-xs font-medium text-white transition hover:text-yellow"
                    >
                      <UserIcon />
                      <span className="max-w-[120px] truncate">{userName.split(" ")[0]}</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-3 bg-white py-2 shadow-2 z-999">
                        <Link
                          href="/user/my-account"
                          className="block px-4 py-2 text-sm text-dark-2 hover:bg-gray-1 hover:text-blue"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Account
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
                          onClick={() => { setUserMenuOpen(false); signOut(); }}
                          className="block w-full px-4 py-2 text-left text-sm text-red hover:bg-red-light-6"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="text-xs font-medium text-white/90 transition hover:text-yellow"
                    >
                      Create an account
                    </Link>
                    <Link
                      href="/signin"
                      className="text-xs font-medium text-white/90 transition hover:text-yellow"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header - Walmart blue bar */}
        <div className="bg-blue">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <div className="flex items-center justify-between gap-4 py-3.5">
              {/* Logo */}
              <Link className="block shrink-0" href="/">
                {headerData?.headerLogo ? (
                  <Image
                    src={headerData.headerLogo}
                    alt={headerData.siteName || "Logo"}
                    width={148}
                    height={36}
                    priority
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-white">
                    {headerData?.siteName || "ROXY TECH"}
                    <svg className="h-4 w-4 text-yellow" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 6.9L21 9.2l-5.2 4.1L17.6 20 12 16.2 6.4 20l1.8-6.7L3 9.2l6.6-.3L12 2z" />
                    </svg>
                  </span>
                )}
              </Link>

              {/* Search bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden flex-1 max-w-xl md:block"
                role="search"
              >
                <div className="flex items-center overflow-hidden rounded-full bg-white">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search everything at ROXY TECH..."
                    aria-label="Search for products"
                    className="w-full bg-transparent px-5 py-2.5 text-sm text-dark outline-none placeholder:text-dark-5"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-12 shrink-0 items-center justify-center bg-yellow text-dark transition hover:bg-yellow-dark"
                    aria-label="Search"
                  >
                    <SearchIcon />
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4">
                {isLoggedIn ? (
                  <Link
                    href="/user/my-account"
                    className="hidden text-white transition hover:text-yellow sm:block"
                    aria-label="Account"
                  >
                    <UserIcon />
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="hidden text-white transition hover:text-yellow sm:block"
                    aria-label="Account"
                  >
                    <UserIcon />
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="relative text-white transition hover:text-yellow"
                  aria-label="Wishlist"
                >
                  <HeartIcon />
                  <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-dark bg-yellow text-[10px] font-semibold rounded-full inline-flex items-center justify-center">
                    {wishlistCount || 0}
                  </span>
                </Link>

                <button
                  className="relative flex items-center gap-2 text-white transition hover:text-yellow"
                  onClick={handleOpenCartModal}
                  aria-label="Cart"
                >
                  <span className="relative">
                    <CartIcon />
                    <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-dark bg-yellow text-[10px] font-semibold rounded-full inline-flex items-center justify-center">
                      {cartCount || 0}
                    </span>
                  </span>
                  <span className="hidden text-sm font-semibold lg:inline">
                    {formatPrice(totalPrice || 0)}
                  </span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  className="text-white transition xl:hidden hover:text-yellow"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                  aria-label={navigationOpen ? "Close menu" : "Open menu"}
                >
                  {navigationOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>

            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="pb-3 md:hidden" role="search">
              <div className="flex items-center overflow-hidden rounded-full bg-white">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search everything..."
                  aria-label="Search for products"
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-dark outline-none placeholder:text-dark-5"
                />
                <button
                  type="submit"
                  className="flex h-10 w-11 shrink-0 items-center justify-center bg-yellow text-dark"
                  aria-label="Search"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Nav bar */}
        <div className="hidden border-t border-gray-2 bg-white xl:block">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <div className="flex items-center gap-6">
              <DesktopMenu menuData={menuData} stickyMenu={stickyMenu} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Offcanvas */}
      <MobileMenu
        headerLogo={headerData?.headerLogo || null}
        siteName={headerData?.siteName || null}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={menuData}
        categories={categories}
      />
    </>
  );
};

export default MainHeader;
