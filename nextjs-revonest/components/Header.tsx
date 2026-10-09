"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Internal navigation links shown in the header. */
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

export default function Header() {
  const pathname = usePathname();

  // A link is "active" when the current path matches it (or is nested under it,
  // for everything except the home route).
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Rev<span className="text-amber-600">Onest</span>
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-amber-100 text-amber-800"
                      : "text-stone-600 hover:bg-stone-100 hover:text-amber-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/login"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isActive("/login")
              ? "bg-amber-700 text-white"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          Log in
        </Link>
      </div>
    </header>
  );
}
