/* =====================================================================
   Small UI helpers that map typed data to Tailwind class strings.
   ===================================================================== */

/**
 * Returns different Tailwind class strings for the add-to-cart button
 * depending on whether the product is in stock.
 */
export function getButtonClasses(inStock: boolean): string {
  const base =
    "w-full rounded-lg px-4 py-2 text-sm font-semibold transition";
  return inStock
    ? `${base} bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.99]`
    : `${base} cursor-not-allowed bg-stone-200 text-stone-400`;
}

/** Format a numeric price as a currency string. */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/** Tailwind classes for an order-status pill, colour-coded by stage. */
export function getStatusClasses(status: string): string {
  const base = "rounded-full px-3 py-1 text-xs font-semibold";
  switch (status) {
    case "pending":
      return `${base} bg-amber-100 text-amber-700`;
    case "processing":
      return `${base} bg-blue-100 text-blue-700`;
    case "shipped":
      return `${base} bg-indigo-100 text-indigo-700`;
    case "delivered":
      return `${base} bg-green-100 text-green-700`;
    case "cancelled":
      return `${base} bg-stone-200 text-stone-600`;
    default:
      return `${base} bg-stone-100 text-stone-600`;
  }
}
