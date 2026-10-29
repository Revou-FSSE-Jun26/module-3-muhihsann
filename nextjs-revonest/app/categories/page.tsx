import Link from "next/link";
import Card from "@/components/Card";
import { getCategories, getProducts } from "@/lib/api";

export const metadata = {
  title: "Categories",
  description: "Browse RevOnest product categories.",
};

// Server Component: fetches GET /categories (and GET /products to show a
// product count per category). Each card links to the catalog filtered by
// that category, e.g. /products?category=2.
export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  // Count products per category id.
  const counts = new Map<number, number>();
  for (const p of products) {
    counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Categories
      </h1>
      <p className="mb-6 text-stone-500">
        Pick a category to see its products.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = counts.get(category.id) ?? 0;
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              data-testid={`category-link-${category.id}`}
              className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <Card className="h-full p-5 transition group-hover:border-amber-300 group-hover:shadow-md">
                <h2 className="text-lg font-bold text-stone-900 group-hover:text-amber-700">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-1 text-sm text-stone-500">
                    {category.description}
                  </p>
                )}
                <p className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-stone-500">
                    {count} product{count === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold text-amber-700">
                    Shop {category.name} →
                  </span>
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
