"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  HiCheckBadge,
  HiOutlineEnvelope,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { FaHospitalUser } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { loginAsAdmin, loginWithEmployeeId } from "@/lib/authClient";

const benefits = [
  { icon: HiOutlineMapPin, text: "Live India-wide field visit tracking" },
  { icon: HiOutlineShieldCheck, text: "Secure photo and GPS verification" },
  { icon: HiCheckBadge, text: "Simple PRO and admin workflows" },
];

export default function LoginPage() {
  const [mode, setMode] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: "", email: "", password: "" });
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const profile = mode === "pro"
        ? await loginWithEmployeeId(form.id.trim(), form.password)
        : await loginAsAdmin(form.email.trim(), form.password);
      toast.success(`Welcome back, ${profile.name || "there"}!`);
      router.replace(profile.role === "admin" ? "/admin" : "/pro");
    } catch (error) {
      toast.error(error.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-login-shell relative min-h-dvh overflow-hidden bg-slate-950 px-4 py-6 sm:px-6 lg:flex lg:items-center lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(25,118,210,0.45),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(16,185,129,0.22),transparent_30%)]" />
      <div className="app-login-card relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30 lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <FaHospitalUser size={23} />
              </div>
              <div>
                <p className="font-display text-lg font-bold">Hospital PRO</p>
                <p className="text-xs text-blue-100">Field Operations Platform</p>
              </div>
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Built for teams across India</p>
            <h1 className="max-w-md font-display text-4xl font-bold leading-tight">Every hospital visit, verified and visible.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">Track duty, capture live GPS and photos, and give administrators a clear real-time view of field activity.</p>
          </div>
          <div className="space-y-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Icon size={18} /></span>
                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center bg-slate-50 p-5 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7 lg:hidden">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25">
                <FaHospitalUser size={25} />
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Hospital PRO Tracker</h1>
              <p className="mt-1 text-sm text-slate-500">Secure field operations across India.</p>
            </div>
            <div className="mb-7 hidden lg:block">
              <p className="text-sm font-semibold text-brand-600">Welcome back</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-slate-900">Sign in to continue</h2>
              <p className="mt-2 text-sm text-slate-500">Use the account type assigned to you.</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1" role="tablist" aria-label="Account type">
              {["pro", "admin"].map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={mode === item}
                  onClick={() => setMode(item)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === item ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {item === "pro" ? "PRO Login" : "Admin Login"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === "pro" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === "pro" ? (
                  <div className="relative">
                    <HiOutlineIdentification className="pointer-events-none absolute left-3.5 top-[42px] text-slate-400" size={19} />
                    <Input label="Employee ID or Email" autoComplete="username" placeholder="e.g. PRO1001 or name@company.com" className="has-leading-icon" required value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
                  </div>
                ) : (
                  <div className="relative">
                    <HiOutlineEnvelope className="pointer-events-none absolute left-3.5 top-[42px] text-slate-400" size={19} />
                    <Input label="Admin Email" type="email" autoComplete="username" placeholder="admin@hospitalpro.com" className="has-leading-icon" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                )}
                <PasswordInput autoComplete="current-password" placeholder="Enter your password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <Button type="submit" loading={loading} className="mt-2 w-full">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.form>
            </AnimatePresence>
            <p className="mt-6 text-center text-xs leading-5 text-slate-500">Forgot your password? Contact your administrator for a secure reset.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
