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
2. [Features implemented](#-features-implemented)
3. [Technologies used](#-technologies-used)
4. [Getting started](#-getting-started)
5. [Running the test suite](#-running-the-test-suite)
6. [Environment variables](#-environment-variables)
7. [Routes](#-routes)
8. [Project structure](#-project-structure)
9. [Screenshots](#-screenshots)

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
> what the `loading.tsx` / `error.tsx` states are for.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@revonest.com` | `Admin123` |
| Customer | `okejohn@email.com` | `Password123` |

---

## 🧪 Running the test suite

The Playwright suite runs the app against an **in-memory mock of the API**
(`e2e/mock-server.mjs`), so it's deterministic, offline, and never touches real
data. Playwright starts the mock and the dev server automatically.

```bash
# from nextjs-revonest/

# install the browser once (first time only)
npx playwright install chromium

# run all tests (headless)
npm run test:e2e

# watch/debug in the Playwright UI
npm run test:e2e:ui

# watch the real browser drive the app
npx playwright test --headed
```

The suite covers three flows:

- **`e2e/auth.spec.ts`** — register → login, session persistence, invalid
  credentials, admin redirect, and the logged-out route guard.
- **`e2e/shopping.spec.ts`** — browse → add to cart → checkout → order appears;
  empty-cart checkout is disabled.
- **`e2e/admin-crud.spec.ts`** — product create/edit/delete and category create
  with duplicate-name rejection.

> `e2e/screenshots.spec.ts` is a utility (not a behavioural test) that
> regenerates the screenshots below.

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
