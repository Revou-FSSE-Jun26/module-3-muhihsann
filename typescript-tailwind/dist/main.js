/* =====================================================================
   RevOnest — typed interactive product catalog
   - renders typed product data into Tailwind-styled cards with images
   - live search filters the list as you type
   - category filter chips
   - add-to-cart counter is an interactive state update
   - star reviews + stock badges
   This is the direct predecessor of the React ProductCard in Checkpoint 2.
   ===================================================================== */
import { products } from "./data.js";
/* ---------- Application state ---------- */
let searchTerm = "";
let activeCategory = "All";
const cart = {}; // productId -> quantity
const categories = [
    "All",
    "Electronics",
    "Kitchen",
    "Books",
    "Sports",
];
/* ---------- DOM references ---------- */
const grid = document.getElementById("catalog");
const searchInput = document.getElementById("search");
const emptyState = document.getElementById("empty");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const filterBar = document.getElementById("filters");
/* ---------- Helpers that map typed data -> Tailwind class strings ---------- */
// Conditional styling based on the union-typed availability field.
function badgeClasses(availability) {
    const base = "rounded-full px-2.5 py-1 text-xs font-semibold";
    return availability.state === "in-stock"
        ? `${base} bg-emerald-100 text-emerald-700`
        : `${base} bg-rose-100 text-rose-700`;
}
function badgeLabel(availability) {
    return availability.state === "in-stock"
        ? `In stock (${availability.quantity})`
        : "Out of stock";
}
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}
// Build a star row from a numeric rating.
function starRow(rating) {
    const rounded = Math.round(rating);
    const full = "★".repeat(rounded);
    const empty = "★".repeat(5 - rounded);
    return `<span class="text-amber-500">${full}</span><span class="text-stone-300">${empty}</span>`;
}
/* ---------- Card template ---------- */
function renderCard(product) {
    const inCart = cart[product.id] ?? 0;
    const soldOut = product.availability.state === "out-of-stock";
    return `
    <article class="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div class="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-700 backdrop-blur">
          ${product.category}
        </span>
        <span class="absolute right-3 top-3 ${badgeClasses(product.availability)}">${badgeLabel(product.availability)}</span>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <h3 class="text-lg font-bold text-stone-900">${product.name}</h3>
        <p class="mb-2 text-sm text-stone-500">${product.description}</p>
        <p class="mb-3 text-sm">
          ${starRow(product.rating)}
          <span class="ml-1 font-medium text-stone-600">${product.rating.toFixed(1)}</span>
          <span class="text-stone-400">(${product.meta.reviews} reviews)</span>
        </p>
        <div class="mb-4 flex flex-wrap gap-1.5">
          ${product.tags
        .map((tag) => `<span class="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">#${tag}</span>`)
        .join("")}
        </div>
        <div class="mt-auto flex items-center justify-between">
          <span class="text-xl font-extrabold text-stone-900">${formatPrice(product.price)}</span>
          <button
            data-id="${product.id}"
            class="add-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${soldOut
        ? "cursor-not-allowed bg-stone-300"
        : "bg-amber-600 hover:bg-amber-700 active:scale-95"}"
            ${soldOut ? "disabled" : ""}
          >
            ${inCart > 0 ? `In cart (${inCart})` : soldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  `;
}
/* ---------- Live search + category filter ---------- */
function getVisibleProducts() {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = term === "" ||
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term) ||
            product.tags.some((tag) => tag.toLowerCase().includes(term));
        return matchesCategory && matchesSearch;
    });
}
/* ---------- Render category filter chips ---------- */
function renderFilters() {
    filterBar.innerHTML = categories
        .map((category) => {
        const active = category === activeCategory;
        return `
        <button
          data-category="${category}"
          class="filter-btn rounded-full border px-4 py-1.5 text-sm font-medium transition ${active
            ? "border-amber-600 bg-amber-600 text-white"
            : "border-stone-300 bg-white text-stone-600 hover:border-amber-400 hover:text-amber-700"}"
        >${category}</button>`;
    })
        .join("");
    filterBar
        .querySelectorAll(".filter-btn")
        .forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category;
            render();
        });
    });
}
/* ---------- Render catalog ---------- */
function render() {
    renderFilters();
    const visible = getVisibleProducts();
    grid.innerHTML = visible.map(renderCard).join("");
    emptyState.classList.toggle("hidden", visible.length > 0);
    // reduce over the cart to get a total item count and total price
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        return product ? sum + product.price * qty : sum;
    }, 0);
    cartCount.textContent = String(totalItems);
    cartTotal.textContent = formatPrice(totalPrice);
    // (Re)attach click handlers to the freshly rendered add-to-cart buttons.
    grid.querySelectorAll(".add-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            cart[id] = (cart[id] ?? 0) + 1; // interactive state update
            render();
        });
    });
}
/* ---------- Wire up live search ---------- */
searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    render();
});
// Initial paint.
render();
