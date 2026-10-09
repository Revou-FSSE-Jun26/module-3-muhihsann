import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** Extra classes merged onto the base card styling. */
  className?: string;
}

/**
 * Reusable bordered container. Wraps any content in the RevOnest card style
 * (white surface, stone border, rounded corners, subtle shadow).
 */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
