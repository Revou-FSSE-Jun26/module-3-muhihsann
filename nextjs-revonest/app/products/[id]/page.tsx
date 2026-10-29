import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Card from "@/components/Card";
import { getProduct, getCategories } from "@/lib/api";
import { formatPrice } from "@/lib/ui";
import { productImage } from "@/lib/productImages";

type Params = Promise<{ id: string }>;

// Dynamic metadata: fetches the product and uses its real name as the title.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: `Product #${id}` };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  // Fetch the product and the category list together, then look up the
  // product's category name. A failed category fetch shouldn't break the page.
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories().catch(() => []),
  ]);
  const category = categories.find((c) => c.id === product.category_id);
  const inStock = product.stock_quantity > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/products"
        className="text-sm text-stone-500 hover:text-amber-700"
      >
        ← Back to products
      </Link>

      <Card className="mt-4 p-8">
        <div className="relative mb-6 aspect-[3/2] w-full overflow-hidden rounded-xl bg-stone-100">
          <Image
            src={productImage(product.name)}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
            priority
          />
        </div>

        {category && (
          <Link
            href={`/products?category=${category.id}`}
            data-testid="product-category"
            className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 transition hover:bg-amber-200"
          >
            {category.name}
          </Link>
        )}

        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {product.name}
          </h1>
          {inStock ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              In stock ({product.stock_quantity})
            </span>
          ) : (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              Out of stock
            </span>
          )}
        </div>

        <p className="text-stone-600">{product.description}</p>

        <p className="mt-6 text-4xl font-extrabold text-stone-900">
          {formatPrice(product.price)}
        </p>
      </Card>
    </div>
  );
}
