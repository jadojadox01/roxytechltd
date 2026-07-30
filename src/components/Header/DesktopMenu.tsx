"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuItem } from "./types";
import { usePathname } from "next/navigation";

interface DesktopMenuProps {
  menuData: MenuItem[];
  stickyMenu: boolean;
}

const DesktopMenu = ({ menuData, stickyMenu }: DesktopMenuProps) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = (index: number) => {
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav>
      <ul className="flex items-center gap-5">
        {menuData.map((menuItem, i) => (
          <li
            key={i}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          >
            {menuItem.submenu ? (
              <>
                <button
                  className={`flex items-center gap-1 text-sm font-semibold transition ${
                    stickyMenu ? "py-3" : "py-4"
                  } ${
                    menuItem.submenu?.some((subItem) => pathname === subItem.path)
                      ? "text-[#ff7a1a]"
                      : "text-[#1c2ea3] hover:text-[#ff7a1a]"
                  }`}
                >
                  {menuItem.title}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${activeDropdown === i ? "rotate-180" : ""
                      }`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute left-0 border border-gray-2 top-full bg-white shadow-lg rounded-lg p-2 min-w-[220px] z-50 transform transition-all duration-200 ${activeDropdown === i
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 translate-y-2 invisible"
                    }`}
                >
                  {menuItem.submenu.map((subItem, j) => (
                    <Link
                      key={j}
                      href={subItem.path || "#"}
                      className={`block rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-[#fff4ea] hover:text-[#ff7a1a] ${
                        subItem.path && pathname.split("?")[0] === subItem.path.split("?")[0]
                          ? "text-[#ff7a1a]"
                          : "text-[#1c2ea3]"
                      }`}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                href={menuItem.path || "#"}
                className={`flex items-center text-sm font-semibold transition ${
                  stickyMenu ? "py-3" : "py-4"
                } ${
                  menuItem.path && pathname.split("?")[0] === menuItem.path.split("?")[0]
                    ? "text-[#ff7a1a]"
                    : "text-[#1c2ea3] hover:text-[#ff7a1a]"
                }`}
              >
                {menuItem.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopMenu;
