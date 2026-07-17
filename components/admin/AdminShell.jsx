"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineDocumentChartBar,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaHospitalUser } from "react-icons/fa6";
import { signOut } from "@/lib/authClient";
import { useAuthStore } from "@/store/useAuthStore";

const links = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { href: "/admin/employees", label: "Employees", icon: HiOutlineUsers },
  { href: "/admin/reports", label: "Reports", icon: HiOutlineDocumentChartBar },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-dvh bg-[#f5f8fc] md:flex">
      {/* Mobile top bar */}
      <header className="app-mobile-header sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <FaHospitalUser className="text-brand-600" size={20} />
          <span className="font-display font-bold text-brand-900">PRO Tracker</span>
        </div>
        <button aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50">
          <HiOutlineBars3 size={24} />
        </button>
      </header>

      {/* Sidebar (desktop) / drawer (mobile) */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform md:sticky md:top-0 md:h-dvh md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><FaHospitalUser size={20} /></span>
            <div><span className="block font-display font-bold text-brand-900">Hospital PRO</span><span className="block text-[11px] text-slate-400">Admin Console</span></div>
          </div>
          <button aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg p-2 text-brand-400 hover:bg-slate-100 md:hidden">
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition",
                  active ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{user?.name?.charAt(0) || "A"}</span>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Administrator"}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div>
          </div>
          <button onClick={() => signOut()} className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">Sign out</button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
