"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootPage() {
  const { user, authLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace("/login");
    else router.replace(user.role === "admin" ? "/admin" : "/pro");
  }, [user, authLoading, router]);

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-brand-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
    </div>
  );
}
