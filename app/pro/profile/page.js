"use client";

import RouteGuard from "@/components/RouteGuard";
import BottomNav from "@/components/pro/BottomNav";
import Card from "@/components/ui/Card";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  return (
    <RouteGuard role="pro">
      <div className="app-pro-screen min-h-dvh bg-[#f5f8fc] px-4 pb-32 pt-7 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-5"><p className="text-sm font-semibold text-brand-600">Account details</p><h1 className="font-display text-3xl font-bold text-slate-900">Profile</h1></div>
          <Card className="overflow-hidden !p-0">
            <div className="bg-gradient-to-br from-brand-700 to-brand-500 p-6 text-white"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/20">{user?.name?.charAt(0) || "P"}</div><h2 className="text-xl font-bold">{user?.name}</h2><p className="text-sm text-blue-100">{user?.designation || "PRO"}</p></div>
            <dl className="divide-y divide-slate-100 p-5 text-sm">
              <div className="py-3 first:pt-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Employee ID</dt><dd className="mt-1 font-semibold text-slate-800">{user?.employeeId}</dd></div>
              <div className="py-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned area</dt><dd className="mt-1 font-semibold text-slate-800">{user?.assignedArea || "Not assigned"}</dd></div>
              <div className="py-3 last:pb-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</dt><dd className="mt-1 font-semibold text-slate-800">{user?.phone || user?.email || "Not provided"}</dd></div>
            </dl>
          </Card>
        </div>
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
