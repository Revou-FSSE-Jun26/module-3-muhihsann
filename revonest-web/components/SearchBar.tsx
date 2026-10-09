"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  /** Controlled value from a parent (e.g. live-filter use). */
  value?: string;
  /** Fires on every keystroke — enables live filtering. */
  onChange?: (value: string) => void;
  /** When true, pressing Enter navigates to /products?search=<query>. */
  navigateOnEnter?: boolean;
  placeholder?: string;
}

/**
 * Controlled search input.
 * - Always calls onChange on every keystroke (live search).
 * - If navigateOnEnter is set, pressing Enter pushes to
 *   /products?search=<query> so the query lives in the URL.
 */
export default function SearchBar({
  value,
  onChange,
  navigateOnEnter = false,
  placeholder = "Search products...",
}: SearchBarProps) {
  const router = useRouter();
  // Support both controlled (value provided) and uncontrolled usage.
  const [internal, setInternal] = useState("");
  const current = value ?? internal;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (navigateOnEnter && event.key === "Enter") {
      const query = current.trim();
      router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    }
  }

  return (
    <label className="block">
      <span className="sr-only">Search products</span>
      <input
        type="search"
        value={current}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
      />
    </label>
  );
}
