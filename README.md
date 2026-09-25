# RevOnest — Frontend Fundamentals (Checkpoint 1)

**RevOnest** is a small demo online store built to practice the raw building
blocks that React, Next.js, and Tailwind sit on top of: semantic HTML, CSS
layout, vanilla JavaScript, TypeScript's type system, and Tailwind's
utility-first styling. It's styled with a warm amber + stone theme and stocks
four departments — **Electronics, Kitchen, Books, and Sports**.

This checkpoint is fundamentals-only — it does **not** touch Next.js or the
Flask API (those start in Checkpoint 2). The typed, interactive catalog here is
the direct predecessor of the React `ProductCard` you'll build next.

## Pages

| Page | Path | What it is |
| --- | --- | --- |
| **Home / landing** | `home/index.html` | Store landing page: hero, "shop by category", featured products, promise band. |
| **Product catalog** | `typescript-tailwind/index.html` | The typed, interactive catalog — live search, category filters, star reviews, stock badges, and an add-to-cart counter. |
| **About / profile** | `html-css/index.html` | Semantic HTML/CSS profile page with a contact form. |
| **JS: DOM & events** | `javascript/dom-events.html` | DOM manipulation and event-handling exercise. |
| **JS: array methods** | `javascript/array-methods.html` | `forEach` / `map` / `filter` / `reduce` exercise. |

The pages link to each other, so you can navigate the "store" like a real site
(Home → Catalog → About).

## Folder structure

```
Frontend/
├── home/                # Store landing page (Tailwind via CDN, no build)
│   └── index.html
├── html-css/            # Semantic profile / About page + contact form
│   ├── index.html
│   └── styles.css
├── javascript/          # Vanilla JS exercises (runnable in the browser)
│   ├── dom-events.html      # DOM manipulation & event handling
│   ├── dom-events.js
│   ├── array-methods.html   # forEach / map / filter / reduce
│   └── array-methods.js
├── typescript-tailwind/ # Typed, interactive product catalog
│   ├── src/
│   │   ├── types.ts         # interfaces, type aliases, union types
│   │   ├── data.ts          # array of typed Product objects (the store's stock)
│   │   ├── main.ts          # render + live search + filters + add-to-cart
│   │   └── input.css        # Tailwind entry (@import "tailwindcss")
│   ├── dist/                # compiled JS + output.css (generated)
│   ├── index.html
│   ├── tsconfig.json
│   └── package.json
├── screenshots/         # profile (desktop + mobile) + catalog
└── README.md
```

## 1. `home/` — store landing page

A RevoFashion-inspired landing page with a hero, "Shop by Category" tiles
(Electronics / Kitchen / Books / Sports), a featured-products grid, and a
trust/promise band. Uses the Tailwind Play CDN, so **no build step is needed**.

**How to run:** open `home/index.html` directly in a browser.

## 2. `typescript-tailwind/` — typed interactive product catalog

The centerpiece. The store's stock is typed in TypeScript and rendered as
Tailwind-styled cards with product images, then made interactive:

- **live search** — filters by name, description, category, or tag as you type
- **category filter chips** — All / Electronics / Kitchen / Books / Sports
- **star reviews** — a star row plus rating and review count per product
- **stock badges** — green "in stock" vs red "out of stock" (an out-of-stock
  item disables its button)
- **add-to-cart counter** — clicking updates per-product quantity and the
  header shows total items and total price

TypeScript highlights (`src/types.ts`):
- **interfaces** — `Product`, `ProductMeta`
- **type aliases** — `Category`, `Rating`, `ProductList`, `CartState`
- **union types** — `Category` (literal union) and `Availability`
  (`in-stock` with a quantity **or** `out-of-stock`)
- **nested objects & typed arrays** — `Product.meta`, `Product.tags`,
  and `ProductList = Product[]`

Tailwind highlights: utility-first classes, typography utilities, a mobile-first
responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), and typed data
mapped to Tailwind class strings (e.g. the in-stock badge turns green, the
out-of-stock badge turns red and the button is disabled).

### Setup & build

```bash
cd typescript-tailwind
npm install

# compile TypeScript (uses tsconfig.json)
npm run build:ts        # or: npx tsc

# build the Tailwind stylesheet
npm run build:css       # or: npx @tailwindcss/cli -i ./src/input.css -o ./dist/output.css

# or do both at once
npm run build
```

While developing, watch for changes in two terminals:

```bash
npm run watch:ts
npm run watch:css
```

**How to run:** after building, open `typescript-tailwind/index.html`. Type in
the search box, tap a category chip, and click **Add to cart** to watch the
header update.

> Requirements: Node.js 18+ and npm. Built with TypeScript 5 and Tailwind CSS 4.

## 3. `html-css/` — About / profile page

A profile page built with semantic HTML5 elements (`header`, `nav`, `main`,
`section`, `article`, `footer`, `figure`) plus a contact form with associated
`<label>`s and appropriate input types (`text`, `email`, `tel`, `select`,
`textarea`).

CSS highlights:
- **box model** — deliberate margin, border, padding, and content
- **Flexbox** — header, hero, projects, and footer
- **CSS Grid** — the skills section and the contact form (two-dimensional layout)
- **responsive breakpoint** — a `@media (max-width: 768px)` query that collapses
  the grids to a single column on mobile

**How to run:** open `html-css/index.html` directly in a browser. To check the
mobile layout, open devtools (`F12`), toggle the device toolbar
(`Ctrl/Cmd+Shift+M`), and pick a phone width like 375px.

## 4. `javascript/` — vanilla JS exercises

### `dom-events.html` / `dom-events.js`
DOM manipulation and event handling with no framework: select/update elements,
toggle a class, a click counter, create/remove list items, and `click`/`submit`
handlers with `preventDefault()`.

### `array-methods.html` / `array-methods.js`
Array processing over product-like data using `forEach`, `map`, `filter`, and
`reduce` (including a chained `filter → map → reduce`). Renders to the page and
logs to the console. Also runs under Node: `node javascript/array-methods.js`.

## Easiest way to preview everything

Opening the files directly works for the home, profile, and JS pages. The typed
catalog uses ES modules, which some browsers restrict on `file://`, so a tiny
local server is the smoothest option for the whole store:

```bash
# from the Frontend/ root — pick whichever you have
npx serve .
# or
python -m http.server 8000
```

Then browse to the printed URL (e.g. `http://localhost:8000/home/index.html`).

## Works offline (local images + local Tailwind)

RevOnest is fully self-contained — every image and stylesheet is committed to
the repo, so the store renders with **no internet connection**.

- Product images live in `typescript-tailwind/images/` and are referenced by
  local paths in `src/data.ts` (e.g. `./images/wireless-mouse.jpg`).
- Home page images (hero + category tiles) live in `home/images/`.
- The home page loads a **compiled** Tailwind stylesheet (`home/dist/output.css`)
  instead of the Tailwind CDN, so it stays styled offline too.

### Re-downloading / changing the images

The images were fetched from [Unsplash](https://unsplash.com) (free to use)
with a helper script. To re-download them (this step needs internet):

```powershell
# from the Frontend/ root, on Windows PowerShell
./scripts/download-images.ps1
```

The script maps a descriptive filename to each Unsplash photo id and saves the
files into `typescript-tailwind/images/` and `home/images/`. To swap an image,
edit the id in the script (or just drop your own `.jpg` in the folder using the
same filename), then re-run it. Content sourced from Unsplash; filenames and
references were added for this project.

### Rebuilding the stylesheets

If you change any markup or the typed data, rebuild so the compiled output stays
in sync:

```bash
cd typescript-tailwind
npm install          # first time only
npm run build        # compiles TS + catalog CSS + home CSS
```

`npm run build` runs three steps: `build:ts` (TypeScript → `dist/`),
`build:css` (catalog Tailwind → `typescript-tailwind/dist/output.css`), and
`build:home` (home Tailwind → `home/dist/output.css`).

## Screenshots

See the `screenshots/` folder for:
- profile page at a **desktop** width
- profile page at a **mobile** width
- the typed product catalog showing **live search** and Tailwind styling

## Commit history

The repository is committed incrementally across each area
(HTML/CSS → JavaScript → TypeScript → Tailwind → store theme) to show progress.
