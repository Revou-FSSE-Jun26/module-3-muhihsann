/**
 * Standalone in-memory mock of the Flask API for E2E tests.
 *
 * Playwright starts this on PORT (default 5055) and the app is launched with
 * NEXT_PUBLIC_API_BASE_URL pointing at it, so BOTH server-side (SSR) and
 * client-side fetches are served deterministic data with no real network or
 * database involved. State resets every time the server starts.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_PORT ?? 5055);

function freshState() {
  return {
    users: [
      { id: 1, username: "admin", email: "admin@revonest.com", role: "admin", password: "Admin123" },
      { id: 2, username: "okejohn", email: "okejohn@email.com", role: "customer", password: "Password123" },
    ],
    categories: [
      { id: 1, name: "Electronics", description: "Phones, laptops, and accessories" },
      { id: 2, name: "Books", description: "Fiction and non-fiction" },
    ],
    products: [
      { id: 1, name: "Wireless Mouse", description: "Ergonomic mouse", price: 20, stock_quantity: 150, category_id: 1 },
      { id: 2, name: "Mechanical Keyboard", description: "Clicky keys", price: 90, stock_quantity: 80, category_id: 1 },
    ],
    orders: [],
    nextProductId: 3,
    nextCategoryId: 3,
    nextOrderId: 1,
  };
}

const state = freshState();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function send(res, status, body) {
  res.writeHead(status, CORS);
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") return send(res, 204);

  const body = method === "POST" || method === "PUT" ? await readBody(req) : {};

  // ---- Auth ----
  if (path === "/auth/login" && method === "POST") {
    const u = state.users.find((x) => x.email === body.email && x.password === body.password_hash);
    if (!u) return send(res, 401, { error: "Invalid email or password" });
    const { password, ...safe } = u;
    void password;
    return send(res, 200, { message: "Login successful", user: safe });
  }
  if (path === "/users" && method === "POST") {
    const u = { id: state.users.length + 1, username: body.username, email: body.email, role: "customer", password: body.password_hash };
    state.users.push(u);
    const { password, ...safe } = u;
    void password;
    return send(res, 201, safe);
  }

  // ---- Products ----
  if (path === "/products" && method === "GET") return send(res, 200, state.products);
  if (path === "/products" && method === "POST") {
    const p = { id: state.nextProductId++, name: body.name, description: body.description ?? "", price: Math.round(body.price), stock_quantity: body.stock_quantity ?? 0, category_id: body.category_id };
    state.products.push(p);
    return send(res, 201, p);
  }
  const pm = path.match(/^\/products\/(\d+)$/);
  if (pm) {
    const id = Number(pm[1]);
    const idx = state.products.findIndex((p) => p.id === id);
    if (method === "GET") return idx === -1 ? send(res, 404, { error: "Product not found" }) : send(res, 200, state.products[idx]);
    if (method === "PUT") {
      if (idx === -1) return send(res, 404, { error: "Product not found" });
      state.products[idx] = { ...state.products[idx], ...body, price: Math.round(body.price ?? state.products[idx].price) };
      return send(res, 200, state.products[idx]);
    }
    if (method === "DELETE") {
      if (idx === -1) return send(res, 404, { error: "Product not found" });
      state.products.splice(idx, 1);
      return send(res, 200, { message: "Product deleted successfully" });
    }
  }

  // ---- Categories ----
  if (path === "/categories" && method === "GET") return send(res, 200, state.categories);
  if (path === "/categories" && method === "POST") {
    if (state.categories.some((c) => c.name === body.name)) return send(res, 409, { error: "Category name already exists" });
    const c = { id: state.nextCategoryId++, name: body.name, description: body.description };
    state.categories.push(c);
    return send(res, 201, c);
  }
  const cm = path.match(/^\/categories\/(\d+)$/);
  if (cm) {
    const id = Number(cm[1]);
    const idx = state.categories.findIndex((c) => c.id === id);
    if (method === "PUT") {
      if (idx === -1) return send(res, 404, { error: "Category not found" });
      state.categories[idx] = { ...state.categories[idx], ...body };
      return send(res, 200, state.categories[idx]);
    }
    if (method === "DELETE") {
      if (idx === -1) return send(res, 404, { error: "Category not found" });
      state.categories.splice(idx, 1);
      return send(res, 200, { message: "Category deleted successfully" });
    }
  }

  // ---- Orders ----
  if (path === "/orders" && method === "GET") {
    const userId = url.searchParams.get("user_id");
    const list = userId ? state.orders.filter((o) => o.user_id === Number(userId)) : state.orders;
    return send(res, 200, list);
  }
  if (path === "/orders" && method === "POST") {
    let total = 0;
    const items = (body.items ?? []).map((it) => {
      const p = state.products.find((pp) => pp.id === it.product_id);
      total += (p?.price ?? 0) * it.quantity;
      return { product_id: it.product_id, product_name: p?.name, quantity: it.quantity, unit_price: p?.price ?? 0 };
    });
    const o = { id: state.nextOrderId++, user_id: body.user_id, status: "pending", total_amount: total, order_date: new Date().toISOString(), items };
    state.orders.push(o);
    return send(res, 201, o);
  }
  const om = path.match(/^\/orders\/(\d+)$/);
  if (om) {
    const id = Number(om[1]);
    const idx = state.orders.findIndex((o) => o.id === id);
    if (method === "GET") return idx === -1 ? send(res, 404, { error: "Order not found" }) : send(res, 200, state.orders[idx]);
    if (method === "DELETE") {
      if (idx === -1) return send(res, 404, { error: "Order not found" });
      if (state.orders[idx].status !== "pending") return send(res, 409, { error: "Only pending orders can be deleted" });
      state.orders.splice(idx, 1);
      return send(res, 200, { message: "Order deleted successfully" });
    }
  }

  return send(res, 404, { error: `Unhandled ${method} ${path}` });
});

server.listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT}`);
});
