# ▲ RevOnest — Next.js Storefront

The RevOnest store rebuilt as a **Next.js 16 (App Router)** application with
reusable typed components and **live data** from the RevOnest Flask API. This is
Part 2 of the project (the fundamentals stage lives in the repo root).

**Built with:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4

---

## 📑 Table of Contents

1. [Getting started](#-getting-started)
2. [Environment variables](#-environment-variables)
3. [Routes](#-routes)
4. [Components](#-components)
5. [How data fetching works](#-how-data-fetching-works)
6. [Verifying the nested layout](#-verifying-the-nested-layout)
7. [Project structure](#-project-structure)
8. [Screenshots](#-screenshots)

---

## 🚀 Getting started

```bash
# from the repo root
cd nextjs-revonest

# install dependencies
npm install

# set up the API base URL
cp .env.example .env.local      # already points at the live API

# run the dev server
npm run dev                      # http://localhost:3000
```

> **Requirements:** Node.js 18.18+ (20+ recommended) and npm.

> **About the API:** data comes from the Flask API at
> `https://revoshop-sgjp.onrender.com`. It's on a free tier, so the **first
> request after an idle period may take a few seconds** to wake up — this is
> exactly what the `loading.tsx` / `error.tsx` states are for.

---

## 🔑 Environment variables

Copy `.env.example` → `.env.local` and adjust if needed:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Flask API (exposed to the browser). |
| `API_SECRET_KEY` | Server-only secret placeholder (not exposed to the browser). |

`.env.local` is gitignored; `.env.example` is committed as a template.

---

## 🧭 Routes

| Route | Type | What it does |
| --- | --- | --- |
| `/` | Server Component | Fetches `/products`, renders the first 5 as read-only cards. |
| `/products` | Server + Client | Server fetch seeds a client `ProductList` with live search, category filter, cart, and an add-product form. |
| `/products/[id]` | Server Component | Fetches one product via `params.id`; `generateMetadata` sets a dynamic page title from the real product name. |
| `/categories` | Server Component | Fetches `/categories`. |
| `/orders` | Server Component | Fetches `/orders?user_id=1`. |
| `/login` | Client form | Controlled email/password form with per-field validation (UI only). |

Every data-fetching route has its own **`loading.tsx`** (skeleton) and
**`error.tsx`** (friendly error UI with retry).

---

## 🧩 Components

All in `components/`, written in TypeScript:

- **`Header`** — top nav with active-route highlighting via `usePathname()`.
- **`Footer`** — site footer.
- **`Card`** — reusable bordered container.
- **`ProductCard`** — `ProductCardProps`, optional props with destructuring
  defaults, a quantity counter, and conditional stock rendering
  (`getButtonClasses(inStock)`).
- **`ProductGrid`** — renders a `Product[]` with a single `.map()`.
- **`SearchBar`** — controlled input; `onChange` for live search and
  `router.push('/products?search=…')` on Enter.
- **`CategoryFilter`** — fetches `/categories` on mount, reports the selection.
- **`AddProductForm`** — controlled inputs + a `validate()` function returning
  per-field errors.
- **`ProductList`** — the interactive catalog: reads `useSearchParams()`, refetches
  on query/category change, immutable cart updates, and a cart summary.

---

## 🔌 How data fetching works

`lib/api.ts` wraps the native `fetch`:

- `getProducts()`, `getProduct(id)`, `getCategories()`, `getOrders(userId)`.
- A single `res.ok` check throws a typed `ApiError` on failure, which the
  route-level `error.tsx` boundaries catch and render.
- Types live in `lib/types.ts` (`Product`, `Category`, `Order`, `ProductCardProps`,
  form state/error types), mirroring the Flask API's response shape.

---

## 🔁 Verifying the nested layout

`app/products/layout.tsx` wraps both `/products` and `/products/[id]`. It stays
mounted while navigating between them — only the page content swaps.

To see it:
1. Open the browser console and visit `/products` → one
   `[ProductsLayout] mounted` log appears, with a visible mount timestamp.
2. Click into a product (`/products/[id]`) and back → **no new mount log**, and
   the timestamp is unchanged. That proves the layout persists and only the page
   re-renders.

---

## 🗂️ Project structure

```
nextjs-revonest/
├── app/
│   ├── layout.tsx            # root layout: <Header/> + <Footer/> + metadata
│   ├── page.tsx              # home (Server Component)
│   ├── login/page.tsx
│   ├── products/
│   │   ├── layout.tsx        # nested layout (persists across navigation)
│   │   ├── page.tsx          # list (Server fetch → ProductList)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── [id]/
│   │       ├── page.tsx      # detail + generateMetadata
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── categories/           # page + loading + error
│   └── orders/               # page + loading + error
├── components/               # Header, Footer, Card, ProductCard, ProductGrid,
│                             # SearchBar, CategoryFilter, AddProductForm,
│                             # ProductList, LoginForm
├── lib/
│   ├── api.ts                # typed fetch helpers (res.ok → ApiError)
│   ├── types.ts              # domain + UI types
│   └── ui.ts                 # getButtonClasses, formatPrice
├── .env.example
└── package.json
```

---

## 📸 Screenshots

Captured views live in the repo-root [`screenshots/`](../screenshots) folder:

- `RevOnestHome_Nextjs.png` — home with live products
- `RevOnestProducts_Nextjs.png` — products with search + filter + cart
- `RevOnestCategories_Nextjs.png` — categories
- `RevOnestOrders_Nextjs.png` — orders
- `RevOnestLoginPage_Nextjs.png` / `RevOnestLoggedIn_Nextjs.png` — login form + success
