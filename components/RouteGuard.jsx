"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// Wrap any protected page: <RouteGuard role="admin"> ... </RouteGuard>
// role can be "admin", "pro", or omitted to just require any signed-in user.
export default function RouteGuard({ role, children }) {
  const { user, authLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/pro");
    }
  }, [user, authLoading, role, router]);

  if (authLoading || !user || (role && user.role !== role)) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-brand-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  return children;
}
