/* =====================================================================
   Array Processing exercise (vanilla JS)
   Demonstrates forEach, map, filter, and reduce over an array of
   product-like objects — the same shape we later type in TypeScript.
   Runnable in the browser (writes to #output) or with Node.
   ===================================================================== */

"use strict";

// Array of product objects to iterate, transform, and aggregate.
const products = [
  { id: 1, name: "Wireless Mouse", price: 25, category: "Accessories", inStock: true },
  { id: 2, name: "Mechanical Keyboard", price: 89, category: "Accessories", inStock: true },
  { id: 3, name: "27\" Monitor", price: 320, category: "Displays", inStock: false },
  { id: 4, name: "USB-C Hub", price: 45, category: "Accessories", inStock: true },
  { id: 5, name: "Laptop Stand", price: 60, category: "Furniture", inStock: false },
  { id: 6, name: "Webcam 1080p", price: 70, category: "Displays", inStock: true },
];

const lines = [];
function log(label, value) {
  const text = `${label}: ${typeof value === "string" ? value : JSON.stringify(value, null, 2)}`;
  lines.push(text);
  console.log(text);
}

/* ---------- forEach: iterate (side effects, no return) ---------- */
const names = [];
products.forEach((product) => {
  names.push(product.name);
});
log("forEach → all product names", names);

/* ---------- map: transform each item into a new array ---------- */
// Apply a 10% discount and produce a new shape.
const discounted = products.map((product) => ({
  name: product.name,
  original: product.price,
  discounted: Math.round(product.price * 0.9 * 100) / 100,
}));
log("map → 10% discounted prices", discounted);

/* ---------- filter: keep only items matching a condition ---------- */
const affordableInStock = products.filter(
  (product) => product.inStock && product.price < 100
);
log("filter → in stock and under $100", affordableInStock.map((p) => p.name));

/* ---------- reduce: aggregate into a single value ---------- */
// 1) total value of all products
const totalValue = products.reduce((sum, product) => sum + product.price, 0);
log("reduce → total catalog value ($)", totalValue);

// 2) count products per category (reduce into an object)
const countByCategory = products.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {});
log("reduce → count per category", countByCategory);

/* ---------- Combined: chain filter + map + reduce ---------- */
const inStockTotal = products
  .filter((product) => product.inStock)
  .map((product) => product.price)
  .reduce((sum, price) => sum + price, 0);
log("filter+map+reduce → total value of in-stock items ($)", inStockTotal);

// Render to the page if running in a browser.
if (typeof document !== "undefined") {
  const output = document.getElementById("output");
  if (output) output.textContent = lines.join("\n\n");
}
