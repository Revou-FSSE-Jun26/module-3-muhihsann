import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a RevOnest account.",
};

export default function RegisterPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Join Rev<span className="font-semibold text-amber-600">Onest</span> to start shopping.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-amber-700 hover:underline">
            Log in
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
