"use client";

import { useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  hasError?: boolean;
}

/**
 * Password field with a show/hide toggle. Reused by the login and register
 * forms so the behaviour and styling stay consistent.
 */
export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "••••••••",
  hasError = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={hasError}
        className={`w-full rounded-lg border px-3 py-2 pr-16 text-sm shadow-sm focus:outline-none focus:ring-2 ${
          hasError
            ? "border-rose-400 focus:ring-rose-200"
            : "border-stone-300 focus:border-amber-500 focus:ring-amber-200"
        }`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-amber-700 hover:text-amber-800"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
