"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type SupportLink = { label: string; href: string };

export default function FooterSupportLinks({ links }: { links: SupportLink[] }) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const visible = links.filter(
    (link) => link.href !== "/track-order" || isLoggedIn
  );

  return (
    <ul className="space-y-2">
      {visible.map((link) => (
        <li key={link.href + link.label}>
          <Link
            href={link.href}
            className="text-[13px] text-white/60 transition hover:text-[#ff7a20]"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
