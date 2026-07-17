import { create } from "zustand";

// Holds the signed-in user's profile (role: "admin" | "pro").
// Populated by AuthProvider from the server-side PostgreSQL session.
export const useAuthStore = create((set) => ({
  user: null,
  authLoading: true,
  setUser: (user) => set({ user, authLoading: false }),
  clearUser: () => set({ user: null, authLoading: false }),
}));
