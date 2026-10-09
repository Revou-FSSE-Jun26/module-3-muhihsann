"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Nested layout for everything under /products. It stays mounted while
 * navigating between /products and /products/[id] — only the page content
 * (children) swaps.
 *
 * To VERIFY the "no re-render" behaviour:
 *  - open the browser console and visit /products
 *  - the mount effect below logs ONCE ("mounted")
 *  - click into /products/[id] and back — no new "mounted" log appears,
 *    proving the layout persists and only the page swaps.
 */
export default function ProductsLayout({ children }: { children: ReactNode }) {
  // Capture the time this layout first mounted; it won't change on navigation.
  const mountedAt = useRef(new Date().toLocaleTimeString());

  useEffect(() => {
    // Runs exactly once, when the nested layout mounts.
    console.log("[ProductsLayout] mounted at", mountedAt.current);
    return () => console.log("[ProductsLayout] unmounted");
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <span className="font-semibold text-stone-700">Products</span>
      </nav>
      <p className="mb-6 text-xs text-stone-400">
        Nested layout mounted at {mountedAt.current} — this timestamp stays the
        same while navigating between the list and a product detail.
      </p>
      {children}
    </div>
  );
}
