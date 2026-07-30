"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

type Suggestion = {
  id: string;
  title: string;
  slug: string;
};

type SearchBarProps = {
  placeholder: string;
  className?: string;
  inputClassName?: string;
};

export default function SearchBar({
  placeholder,
  className = "",
  inputClassName = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const goToSearch = (value?: string) => {
    const trimmed = (value ?? query).trim();
    setOpen(false);
    router.push(
      trimmed
        ? `/shop-without-sidebar?q=${encodeURIComponent(trimmed)}`
        : "/shop-without-sidebar"
    );
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToSearch();
        }}
        role="search"
      >
        <div className="flex items-center overflow-hidden rounded-[12px] border border-[#eadbcf] bg-[#fcf7f2]">
          <span className="pl-4 text-[#5b78b9]">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            placeholder={placeholder}
            aria-label="Search for products"
            className={`w-full border-0 bg-transparent px-3 py-2.5 text-sm text-slate-700 outline-none ring-0 placeholder:text-[#8a86ad] ${inputClassName}`}
          />
        </div>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
          ) : (
            <ul>
              {suggestions.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/products/${item.slug}`}
                    className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-[#fff4ea] hover:text-[#ff7a1a]"
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
