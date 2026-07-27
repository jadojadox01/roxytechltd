import Link from "next/link";
import { ArrowRightIcon } from "@/assets/icons";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:mb-10 ${
        isCenter
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={isCenter ? "max-w-2xl" : ""}>
        {eyebrow && (
          <span className="mb-2 inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-base text-dark-3 ${isCenter ? "mx-auto" : "max-w-xl"}`}>
            {description}
          </p>
        )}
      </div>
      {href && !isCenter && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-teal transition hover:text-teal-dark"
        >
          {linkLabel}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
