import Card from "@/components/Card";
import { getCategories } from "@/lib/api";

export const metadata = {
  title: "Categories",
  description: "Browse RevOnest product categories.",
};

// Server Component: fetches GET /categories.
export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Categories
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-5">
            <h2 className="text-lg font-bold text-stone-900">{category.name}</h2>
            {category.description && (
              <p className="mt-1 text-sm text-stone-500">
                {category.description}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
