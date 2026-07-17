"use client";

import { useEffect } from "react";
import { subscribeToAuth } from "@/lib/authClient";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const unsub = subscribeToAuth((profile) => {
      if (profile) setUser(profile);
      else clearUser();
    });
    return () => unsub();
  }, [setUser, clearUser]);

  return children;
}
