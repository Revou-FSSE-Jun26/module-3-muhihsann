"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Wraps pages meant only for logged-out visitors (/login, /register).
 * Anyone already logged in is sent away: admins to /dashboard, everyone else
 * to /. These match where LoginForm/RegisterForm send users after signing in,
 * so the two redirects never fight each other.
 *
 * While the session is still loading (server render + first client paint) the
 * page renders normally, so logged-out visitors see no flicker.
 */
export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(user.role === "admin" ? "/dashboard" : "/");
  }, [loading, user, router]);

  // Logged in: render nothing while the redirect happens.
  if (!loading && user) return null;

  return <>{children}</>;
}
