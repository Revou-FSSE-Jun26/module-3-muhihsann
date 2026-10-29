"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/lib/types";

interface RouteGuardProps {
  children: React.ReactNode;
  /** If set, only users with this role may view the children. */
  requireRole?: Role;
  /** Where to send unauthorized users (default "/"). */
  redirectTo?: string;
}

/**
 * Client-side guard. Waits for auth to hydrate, then:
 *  - redirects logged-out users to /login
 *  - redirects users without the required role to redirectTo (default "/")
 * While redirecting (or before hydration) it renders nothing to avoid a flash
 * of protected content.
 */
export default function RouteGuard({
  children,
  requireRole,
  redirectTo = "/",
}: RouteGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const allowed =
    !loading && user !== null && (!requireRole || user.role === requireRole);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (requireRole && user.role !== requireRole) {
      router.replace(redirectTo);
    }
  }, [loading, user, requireRole, redirectTo, router]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-stone-500">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
