"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PasswordInput from "@/components/PasswordInput";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/toast";
import type { LoginFormState, LoginFormErrors } from "@/lib/types";

/**
 * Pure client-side validation (no API call yet).
 * Returns an errors object with a message per invalid field.
 */
export function validate(data: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One controlled-input handler for every field (text, password, checkbox).
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    const nextForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };
    setForm(nextForm);

    // Once errors have been surfaced (after a submit attempt), re-validate as
    // the user types so a red border/message clears the moment the field
    // becomes valid again — the error styling only ever reflects a real error.
    if (Object.keys(errors).length > 0) {
      setErrors(validate(nextForm));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      notify.success(`Welcome back, ${user.username}.`);
      // Role-based redirect: admins to the dashboard, customers to home.
      router.push(user.role === "admin" ? "/dashboard" : "/");
    } catch (err) {
      // Distinguish genuine bad credentials (API 401) from a failure to reach
      // the API at all (network error / CORS / server asleep).
      let msg: string;
      if (err instanceof ApiError && err.status === 401) {
        msg = "Invalid email or password. Please try again.";
      } else if (err instanceof ApiError) {
        msg = err.message;
      } else {
        msg =
          "Couldn't reach the server. It may be waking up — please try again in a moment.";
      }
      setFormError(msg);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
        >
          {formError}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-semibold text-stone-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={!!errors.email}
          className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-rose-400 focus:ring-rose-200"
              : "border-stone-300 focus:border-amber-500 focus:ring-amber-200"
          }`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs font-medium text-rose-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-stone-700"
          >
            Password
          </label>
          <a href="#" className="text-xs font-medium text-amber-700 hover:underline">
            Forgot password?
          </a>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          hasError={!!errors.password}
        />
        {errors.password && (
          <p className="mt-1 text-xs font-medium text-rose-600">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input
          name="remember"
          type="checkbox"
          checked={form.remember}
          onChange={handleChange}
          className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-200"
        />
        Remember me
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
