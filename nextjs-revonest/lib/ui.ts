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
