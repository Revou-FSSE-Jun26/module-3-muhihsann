"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CartMenu from "@/components/CartMenu";

/** Internal navigation links shown in the header. */
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout, loading } = useAuth();

  // Auth state is derived from localStorage, which is client-only. Render the
  // auth-dependent UI only after mount so the server HTML and the first client
  // render are identical (prevents a hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const showAuth = mounted && !loading;
  // Admins don't shop: no customer Orders link and no cart in the header.
  // (They see all orders under Dashboard → Orders.)
  const adminView = showAuth && isAdmin;
  const visibleLinks = adminView
    ? navLinks.filter((link) => link.href !== "/orders")
    : navLinks;

  // A link is "active" when the current path matches it (or is nested under it,
  // for everything except the home route).
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Rev<span className="text-amber-600">Onest</span>
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {visibleLinks.map((link) => (
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
            {/* Admins get a Dashboard link. Gated on `showAuth` so the server
                and first client render match (avoids a hydration mismatch). */}
            {showAuth && isAdmin && (
              <li>
                <Link
                  href="/dashboard"
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive("/dashboard")
                      ? "bg-amber-100 text-amber-800"
                      : "text-stone-600 hover:bg-stone-100 hover:text-amber-700"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right side: cart + auth state. `loading` avoids a flash before hydration. */}
        <div className="flex items-center gap-3">
          {!adminView && <CartMenu />}
          {!showAuth ? null : user ? (
            <>
              <span className="hidden text-sm text-stone-600 sm:inline">
                Hi,{" "}
                <span className="font-semibold text-stone-900">
                  {user.username}
                </span>{" "}
                <span
                  className={`ml-0.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
                    isAdmin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  ({user.role})
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition hover:text-amber-700 sm:inline"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
