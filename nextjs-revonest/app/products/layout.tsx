import type { ReactNode } from "react";

/**
 * Nested layout for everything under /products. It stays mounted while
 * navigating between /products and /products/[id] — only the page content
 * (children) swaps. Provides the shared container + breadcrumb.
 */
export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <span className="font-semibold text-stone-700">Products</span>
      </nav>
      {children}
    </div>
  );
}
