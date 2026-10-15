import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your RevOnest account.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-500">
          Log in to your Rev<span className="font-semibold text-amber-600">Onest</span> account.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-amber-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-4 text-center text-sm text-stone-500 hover:text-amber-700"
      >
        ← Back to store
      </Link>
    </section>
  );
}
