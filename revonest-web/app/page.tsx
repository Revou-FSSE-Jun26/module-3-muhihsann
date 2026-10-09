import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Everyday Essentials
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Welcome to Rev<span className="text-amber-600">Onest</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-stone-600">
        The RevOnest storefront, now rebuilt with Next.js, the App Router, and
        reusable typed components. Product data will be fetched live from the
        Flask API.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
        >
          Browse products
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 transition hover:border-amber-400 hover:text-amber-700"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
