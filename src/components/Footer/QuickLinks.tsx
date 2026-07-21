import Link from "next/link";

const quickLinks = [
  { id: 1, label: "About", href: "/about" },
  { id: 2, label: "Contact", href: "/contact" },
];

export default function QuickLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2 className="mb-7.5 text-xl font-semibold text-dark">Links</h2>
      <ul className="flex flex-col gap-3">
        {quickLinks.map((link) => (
          <li key={link.id}>
            <Link
              className="text-base text-dark-3 duration-200 ease-out hover:text-teal"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
