import { create } from "zustand";

// Tracks the PRO's current duty session and the visits logged within it.
export const useDutyStore = create((set, get) => ({
  session: null, // { id, startedAt, startLocation, status, ... }
  visits: [],

  setSession: (session) => set({ session }),
  setVisits: (visits) => set({ visits }),
  addVisitLocal: (visit) => set({ visits: [...get().visits, visit] }),

  isOnDuty: () => get().session?.status === "active",
}));
