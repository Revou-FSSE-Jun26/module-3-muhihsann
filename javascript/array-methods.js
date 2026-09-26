/* =====================================================================
   Array Processing exercise (vanilla JS)
   Demonstrates forEach, map, filter, and reduce over the RevOnest
   catalog — the same products (and shape) used in the TypeScript +
   Tailwind catalog. Runnable in the browser (writes to #output) or Node.
   ===================================================================== */

"use strict";

// The RevOnest catalog: the same products shown on the catalog page,
// simplified to the fields this exercise needs.
const products = [
  { id: 1, name: "Wireless Mouse", price: 20, category: "Electronics", inStock: true },
  { id: 2, name: "Mechanical Keyboard", price: 90, category: "Electronics", inStock: true },
  { id: 3, name: "Noise-Cancelling Headphones", price: 180, category: "Electronics", inStock: true },
  { id: 4, name: "Stainless Steel Pan", price: 35, category: "Kitchen", inStock: true },
  { id: 5, name: "Espresso Machine", price: 199, category: "Kitchen", inStock: true },
  { id: 6, name: "Atomic Habits", price: 17, category: "Books", inStock: true },
  { id: 7, name: "The Midnight Library", price: 19, category: "Books", inStock: false },
  { id: 8, name: "Running Shoes", price: 75, category: "Sports", inStock: true },
  { id: 9, name: "Yoga Mat", price: 25, category: "Sports", inStock: false },
];

const lines = [];
function log(label, value) {
  const text = `${label}: ${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`;
  lines.push(text);
  console.log(text);
}

/* ---------- forEach: iterate (side effects, no return) ---------- */
// Build a plain list of every product name in the catalog.
const names = [];
products.forEach((product) => {
  names.push(product.name);
});
log("forEach → every product in the catalog", names);

/* ---------- map: transform each item into a new array ---------- */
// Put every product on a 10% sale and produce a new shape.
const onSale = products.map((product) => ({
  name: product.name,
  wasPrice: product.price,
  salePrice: Math.round(product.price * 0.9 * 100) / 100,
}));
log("map → 10% off sale prices", onSale);

/* ---------- filter: keep only items matching a condition ---------- */
// Products a shopper can actually buy right now for under $100.
const affordableInStock = products.filter(
  (product) => product.inStock && product.price < 100
);
log("filter → in stock and under $100", affordableInStock.map((p) => p.name));

/* ---------- reduce: aggregate into a single value ---------- */
// 1) total value of all catalog inventory
const catalogValue = products.reduce((sum, product) => sum + product.price, 0);
log("reduce → total catalog value ($)", catalogValue);

// 2) how many products sit in each department (reduce into an object)
const countByCategory = products.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {});
log("reduce → products per department", countByCategory);

/* ---------- Combined: chain filter + map + reduce ---------- */
// Total price of everything currently in stock.
const inStockTotal = products
  .filter((product) => product.inStock)
  .map((product) => product.price)
  .reduce((sum, price) => sum + price, 0);
log("filter+map+reduce → value of in-stock items ($)", inStockTotal);

// Render to the page if running in a browser.
if (typeof document !== "undefined") {
  const output = document.getElementById("output");
  if (output) output.textContent = lines.join("\n\n");
}
