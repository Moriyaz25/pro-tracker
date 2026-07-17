"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiOutlineClock, HiOutlineUser } from "react-icons/hi2";
import clsx from "clsx";
import { motion } from "framer-motion";

const items = [
  { href: "/pro", label: "Home", icon: HiHome },
  { href: "/pro/history", label: "History", icon: HiOutlineClock },
  { href: "/pro/profile", label: "Profile", icon: HiOutlineUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-md items-center justify-around rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-xl shadow-slate-900/10 backdrop-blur-xl">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/pro" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="relative flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-1.5"
          >
            {active && <motion.span layoutId="pro-bottom-nav-active" className="absolute inset-0 rounded-xl bg-brand-50" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <motion.span className="relative z-10" animate={{ y: active ? -1 : 0, scale: active ? 1.06 : 1 }} transition={{ duration: 0.18 }}><Icon size={22} className={clsx(active ? "text-brand-600" : "text-brand-300")} /></motion.span>
            <span
              className={clsx(
                "relative z-10 text-[11px] font-medium",
                active ? "text-brand-700" : "text-brand-300"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
