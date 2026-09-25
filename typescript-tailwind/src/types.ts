/* =====================================================================
   RevOnest product data model
   Demonstrates:
   - interfaces
   - type aliases
   - union types (a value that can take more than one shape/state)
   - nested objects and arrays of typed objects
   ===================================================================== */

// Union type: a category can only be one of these literal values.
export type Category = "Electronics" | "Kitchen" | "Books" | "Sports";

// Union type modelling stock as more than one shape/state:
// either "in-stock" with a quantity, or "out-of-stock".
export type Availability =
  | { state: "in-stock"; quantity: number }
  | { state: "out-of-stock" };

// Type alias for a rating (number, 0-5 by convention).
export type Rating = number;

// Nested object typed with its own interface.
export interface ProductMeta {
  brand: string;
  reviews: number; // number of customer reviews
}

// Main interface modelling a product-like object (mirrors the DB seed).
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Category;
  rating: Rating;
  availability: Availability; // union-typed field
  image: string; // product image URL
  meta: ProductMeta; // nested object
  tags: string[]; // typed array of strings
}

// Type alias for an array of typed product objects.
export type ProductList = Product[];

// State for the interactive add-to-cart counter: productId -> quantity.
export type CartState = Record<number, number>;
