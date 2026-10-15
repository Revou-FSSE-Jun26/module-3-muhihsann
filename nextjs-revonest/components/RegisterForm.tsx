"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirm: string;
}

interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function validate(data: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!data.username.trim()) {
    errors.username = "Username is required.";
  } else if (data.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

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

  if (data.confirm !== data.password) {
    errors.confirm = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (Object.keys(errors).length > 0) setErrors(validate(next));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Registering also logs the user in. New accounts are customers.
      const user = await register(form.username, form.email, form.password);
      router.push(user.role === "admin" ? "/dashboard" : "/");
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-rose-400 focus:ring-rose-200"
        : "border-stone-300 focus:border-amber-500 focus:ring-amber-200"
    }`;

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

      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-semibold text-stone-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          aria-invalid={!!errors.username}
          className={fieldClass(!!errors.username)}
          placeholder="yourname"
        />
        {errors.username && (
          <p className="mt-1 text-xs font-medium text-rose-600">{errors.username}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-stone-700">
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
          className={fieldClass(!!errors.email)}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-stone-700">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          hasError={!!errors.password}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p className="mt-1 text-xs font-medium text-rose-600">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-semibold text-stone-700">
          Confirm password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          hasError={!!errors.confirm}
          placeholder="Re-enter your password"
        />
        {errors.confirm && (
          <p className="mt-1 text-xs font-medium text-rose-600">{errors.confirm}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
