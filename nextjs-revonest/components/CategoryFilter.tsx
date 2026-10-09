"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import type { Category } from "@/lib/types";

interface CategoryFilterProps {
  value: number | "all";
  onChange: (categoryId: number | "all") => void;
}

/**
 * Dropdown that fetches GET /categories on mount and reports the selected
 * category id back to the parent (which refetches products by category).
 */
export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch(() => {
        // Non-fatal: leave the dropdown with just "All" if categories fail.
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-stone-600">Category</span>
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
