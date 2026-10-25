/* =====================================================================
   Product image resolver.

   The Flask API doesn't store product images, so the frontend maps each
   product to a local image in /public/images (the same photos used by the
   earlier Tailwind catalog). Self-hosted means the images always match the
   product, never 404, and work offline. Anything unmapped falls back to a
   generated, name-labelled placeholder so a card is never broken.
   ===================================================================== */

// Local images (served from /public/images), keyed by lowercased product name.
const IMAGE_BY_NAME: Record<string, string> = {
  "wireless mouse": "/images/wireless-mouse.jpg",
  "mechanical keyboard": "/images/mechanical-keyboard.jpg",
  "wireless headphones": "/images/headphones.jpg",
  laptop: "/images/compact-laptop.jpg",
  "stainless steel pan": "/images/steel-pan.jpg",
  "espresso machine": "/images/espresso-machine.jpg",
  "electric kettle": "/images/electric-kettle.jpg",
  "air fryer": "/images/air-fryer.jpg",
  "the silent patient": "/images/the-silent-patient.jpg",
  "atomic habits": "/images/atomic-habits.jpg",
  "the midnight library": "/images/midnight-library.jpg",
  "running shoes": "/images/running-shoes.jpg",
  "yoga mat": "/images/yoga-mat.jpg",
  "dumbbell set": "/images/adjustable-dumbbell.jpg",
  "water bottle": "/images/water-bottle.jpg",
};

/**
 * A deterministic, name-based placeholder for products without a local image.
 * Uses the brand's amber palette and shows the product's own name, so it's
 * never misleading.
 */
function placeholder(name: string): string {
  const label = encodeURIComponent(name);
  return `https://placehold.co/600x400/fef3c7/b45309?text=${label}`;
}

/** Resolve a display image URL for a product by its name. */
export function productImage(name: string): string {
  return IMAGE_BY_NAME[name.trim().toLowerCase()] ?? placeholder(name);
}
