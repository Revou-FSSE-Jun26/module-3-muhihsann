import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/Card";
import { getProduct } from "@/lib/api";
import { formatPrice } from "@/lib/ui";

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
  const product = await getProduct(id);
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

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-stone-500">Product ID</dt>
            <dd className="font-semibold">{product.id}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Category ID</dt>
            <dd className="font-semibold">{product.category_id}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
