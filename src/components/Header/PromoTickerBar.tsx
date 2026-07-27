"use client";

export default function PromoTickerBar({ items }: { items: string[] }) {
  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-white/10 bg-blue-dark/90">
      <div className="flex animate-marquee whitespace-nowrap py-1.5">
        {loop.map((text, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-2 text-[11px] font-medium text-white/85"
          >
            <span className="h-1 w-1 rounded-full bg-yellow" aria-hidden />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
