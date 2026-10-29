"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { href: "/dashboard", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/orders", label: "Orders" },
];

interface DashboardShellProps {
  /** Heading of the current section, e.g. "Products". */
  title: string;
  description?: string;
  /** Optional action shown next to the heading (e.g. an "Add" button). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Shared frame for every admin page: the "Dashboard" heading, tabs to switch
 * between Products / Categories / Orders, and a section heading.
 */
export default function DashboardShell({
  title,
  description,
  action,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-stone-500">
        Welcome, {user?.username}. Manage the RevOnest store from here.
      </p>

      <nav aria-label="Dashboard sections" className="mt-6 border-b border-stone-200">
        <ul className="-mb-px flex gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block border-b-2 px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-amber-600 text-amber-700"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}
