# ▲ RevOnest — Next.js Storefront

RevOnest is a full-stack e-commerce storefront built with **Next.js 16 (App
Router)**, talking to a **Flask REST API** for live data. It supports two
logged-in roles — **customer** and **admin** — with role-based routing, a
persistent shopping cart, checkout, order management, and a full admin
dashboard for product and category CRUD.

This is the complete Checkpoint 3 application: fundamentals (Checkpoint 1) +
components & routing (Checkpoint 2) + authentication, full backend integration,
and end-to-end testing (Checkpoint 3).

**Built with:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 ·
react-hot-toast · Playwright

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Checkpoint 3 — what's new](#-checkpoint-3--whats-new)
3. [Features implemented](#-features-implemented)
4. [Technologies used](#-technologies-used)
5. [Getting started (run locally)](#-getting-started-run-locally)
6. [Running the test suite (test locally)](#-running-the-test-suite-test-locally)
7. [Environment variables](#-environment-variables)
8. [Routes](#-routes)
9. [Project structure](#-project-structure)
10. [Screenshots](#-screenshots)

---

## 🔭 Overview

RevOnest is an online store for everyday essentials (electronics, kitchen,
books, sports). Visitors can browse products and categories; registered
**customers** can build a cart, check out, and manage their own orders;
**admins** get a protected dashboard to manage the catalog and view every
order.

The frontend is a Next.js App Router app that renders a mix of Server
Components (for initial data) and Client Components (for interactivity), and
reads/writes all data through a typed API layer against the Flask backend.
Authentication state and the cart are persisted in `localStorage`, so sessions
and carts survive a page refresh.

---

## 🧱 Checkpoint 3 — what's new

Building on the components and routing from Checkpoint 2, this checkpoint adds
the full logged-in experience and testing:

- **Authentication & role-based access** — register, login, logout, session
  persistence, and route guards for admin-only pages.
- **Customer shopping flow** — per-user cart (localStorage), cart page, a
  dedicated `/checkout` page, order placement via `POST /orders`, a `My Orders`
  list, order detail, and cancel-while-pending.
- **Admin dashboard** — full product and category CRUD, plus a read-only
  overview of all orders.
- **Toast notifications** on success/error for auth, cart, checkout, and CRUD.
- **Playwright E2E suite** covering the three graded flows, with a local mock
  API so tests are deterministic and offline.

---

## ✨ Features implemented

### Authentication & roles
- **Register** (`/register`) with full client-side validation; a successful
  sign-up logs the user in and redirects.
- **Login** (`/login`) with a show/hide password toggle; invalid credentials
  surface a clear error. Role-based redirect: **admin → `/dashboard`**,
  **customer → `/`**.
- Session persisted in `localStorage`; the header shows the logged-in username
  and role badge and survives a refresh.
- **Route guards** redirect logged-out and non-admin users away from protected
  pages (`/dashboard`, `/dashboard/*`).

### Customer
- Browse the catalog (`/products`) with live search and category filtering.
- **Add to cart** from any product card; the cart is **per-user** and persisted
  in `localStorage` (each account keeps its own cart in the browser).
- Header **cart preview** popover: view items, change quantities, remove lines,
  see the running total.
- Full **cart page** (`/cart`) with an empty state and a disabled checkout
  button when the cart is empty.
- **Checkout** (`/checkout`) confirms the order via `POST /orders`, clears the
  cart, and redirects to `/orders`.
- **My Orders** (`/orders`) lists the customer's own orders; **order detail**
  (`/orders/[id]`) shows line items. Customers can **cancel only pending**
  orders.

### Admin
- **Dashboard** (`/dashboard`) — admin-only landing with links to each area.
- **Product CRUD** (`/dashboard/products`) — create, edit, and delete products;
  deletion is blocked by the API when a product has active orders.
- **Category CRUD** (`/dashboard/categories`) — create, edit, and delete
  categories; duplicate names are rejected with a clear error.
- **Orders overview** (`/dashboard/orders`) — read-only view of **all**
  customers' orders; only pending orders can be deleted (enforced on the
  backend).

### UX & quality
- **Toast notifications** (react-hot-toast) on success and error across auth,
  cart, checkout, and all CRUD actions.
- Per-route **`loading.tsx`** skeletons and **`error.tsx`** boundaries.
- **Playwright E2E suite** covering the registration/login flow, the full
  shopping journey, and the admin CRUD journey.

---

## 🛠️ Technologies used

| Area | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router) |
| UI library | **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** |
| Notifications | **react-hot-toast** |
| Routing / navigation | **`next/navigation`** (`useRouter`, `usePathname`, `useSearchParams`, `useParams`) |
| Session / cart persistence | **`localStorage`** |
| API configuration | **`NEXT_PUBLIC_API_BASE_URL`** |
| End-to-end testing | **Playwright** |

---

## 🚀 Getting started (run locally)

```bash
# 1. from the repo root, move into the Next.js app
cd nextjs-revonest

# 2. install dependencies
npm install

# 3. set up the API base URL (already points at the live Flask API)
cp .env.example .env.local

# 4. start the dev server
npm run dev                      # http://localhost:3000
```

Open http://localhost:3000 and log in with one of the demo accounts below.

### Production build

To build and serve the optimized production bundle locally:

```bash
npm run build                    # compile + type-check (all routes)
npm run start                    # serve the build at http://localhost:3000
```

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (hot reload). |
| `npm run build` | Production build (compiles and type-checks every route). |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run test:e2e` | Run the Playwright end-to-end suite (headless). |
| `npm run test:e2e:ui` | Open the Playwright UI runner (watch + debug). |

> **Requirements:** Node.js 18.18+ (20+ recommended) and npm.

> **About the API:** data comes from the Flask API at
> `https://revoshop-sgjp.onrender.com`. It's on a free tier, so the **first
> request after an idle period may take a few seconds** to wake up — this is
> what the `loading.tsx` / `error.tsx` states are for.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@revonest.com` | `Admin123` |
| Customer | `okejohn@email.com` | `Password123` |

---

## 🧪 Running the test suite (test locally)

**Testing approach:** the Playwright suite runs the app against an **in-memory
mock of the Flask API** (`e2e/mock-server.mjs`). Playwright starts both the mock
and the dev server automatically, so the suite is **deterministic, offline, and
never touches real data** — every run starts from the same seeded state.

```bash
# from nextjs-revonest/

# 1. install the Playwright browser once (first time only)
npx playwright install chromium

# 2. run all tests (headless)
npm run test:e2e

# optional: watch/debug in the Playwright UI
npm run test:e2e:ui

# optional: watch the real browser drive the app
npx playwright test --headed
```

A successful run reports **9 passed** across three flows:

- **`e2e/auth.spec.ts`** — register → login, session persistence across refresh,
  invalid-credentials error, admin→dashboard redirect, and the logged-out route
  guard.
- **`e2e/shopping.spec.ts`** — browse → add to cart → checkout → order appears in
  `/orders`; checkout is disabled when the cart is empty.
- **`e2e/admin-crud.spec.ts`** — product create/edit/delete and category create
  with duplicate-name rejection.

> `e2e/screenshots.spec.ts` is a utility (not a behavioural test) that
> regenerates the screenshots below:
> `npx playwright test e2e/screenshots.spec.ts`.

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

| Route | Access | What it does |
| --- | --- | --- |
| `/` | Public | Home with featured products (streamed behind `<Suspense>`). |
| `/products` | Public | Catalog with live search + category filter; admins also see an add-product form. |
| `/products/[id]` | Public | Product detail; `generateMetadata` sets a dynamic title. |
| `/categories` | Public | Category listing. |
| `/login`, `/register` | Public | Auth forms; redirect by role on success. |
| `/cart` | Customer | Cart page with quantity controls, remove, and checkout. |
| `/checkout` | Customer | Order summary + place order. |
| `/orders` | Customer | The logged-in user's orders. |
| `/orders/[id]` | Customer | Order detail with line items. |
| `/dashboard` | Admin | Admin landing. |
| `/dashboard/products` | Admin | Product CRUD. |
| `/dashboard/categories` | Admin | Category CRUD. |
| `/dashboard/orders` | Admin | Read-only overview of all orders. |

---

## 🗂️ Project structure

```
nextjs-revonest/
├── app/
│   ├── layout.tsx            # root layout: providers + Header/Footer + Toaster
│   ├── page.tsx              # home
│   ├── login/ · register/    # auth pages
│   ├── products/             # list + [id] detail (+ loading/error, nested layout)
│   ├── categories/           # category listing
│   ├── cart/ · checkout/     # customer cart + checkout
│   ├── orders/               # orders list + [id] detail
│   └── dashboard/            # admin: products, categories, orders
├── components/               # Header, Footer, Card, ProductCard/Grid/List,
│                             # SearchBar, CategoryFilter, AddProductForm,
│                             # LoginForm, RegisterForm, PasswordInput,
│                             # CartMenu, RouteGuard
├── context/
│   ├── AuthContext.tsx       # auth state + localStorage session
│   └── CartContext.tsx       # per-user cart + checkout
├── lib/
│   ├── api.ts                # typed fetch helpers (res.ok → ApiError)
│   ├── types.ts              # domain + UI types
│   ├── ui.ts                 # formatPrice, status/button classes
│   └── toast.ts              # react-hot-toast helper
├── e2e/                      # Playwright specs + mock API server
├── screenshots/              # screenshots used below
├── playwright.config.ts
├── .env.example
└── package.json
```

---

## 📸 Screenshots

### Authentication

Login page:

![Login](screenshots/auth-01-login.png)
![Login with autofill](screenshots/LoginPage.png)

Register page:

![Register](screenshots/auth-02-register.png)

Logged in (header shows the username + role):

![Logged in](screenshots/auth-04-logged-in.png)

### Shopping journey

Products catalog:

![Products](screenshots/shop-01-products.png)

Cart preview from the header:

![Cart preview](screenshots/shop-03-cart-preview.png)
![Cart preview (customer)](screenshots/CartInUser.png)

Cart page:

![Checkout](screenshots/shop-04-checkout.png)
![Customer cart](screenshots/CustomerCart.png)

My orders (cancel is available only for pending orders):

![Orders](screenshots/shop-06-orders.png)
![Customer orders](screenshots/CustomerOrders.png)

### Admin dashboard

Dashboard:

![Admin dashboard](screenshots/admin-01-dashboard.png)
![Admin dashboard](screenshots/AdminDashboardUI.png)

Product management (create / edit / delete):

![Product form](screenshots/admin-02-product-form.png)
![Product created](screenshots/admin-03-product-created.png)

Category management:

![Categories](screenshots/admin-04-categories.png)

All-orders overview:

![Admin orders](screenshots/admin-06-orders.png)
![Admin orders](screenshots/OrdersDashboardAdmin.png)

### End-to-end tests (Playwright)

![Authentication tests passing](screenshots/PlaywrightAuthenticationTest.png)
![Shopping journey tests passing](screenshots/PlaywrightShoppingJourneyTest.png)
![Admin CRUD tests passing](screenshots/PlaywrightAdminCRUD.png)
