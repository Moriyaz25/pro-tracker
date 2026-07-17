"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineSignal,
  HiOutlineStar,
} from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import AdminShell from "@/components/admin/AdminShell";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { subscribeAllActiveSessions, subscribeRecentVisits } from "@/lib/dataClient";

export default function AdminDashboardPage() {
  return (
    <RouteGuard role="admin">
      <AdminShell>
        <Dashboard />
      </AdminShell>
    </RouteGuard>
  );
}

function Dashboard() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = subscribeAllActiveSessions(setActiveSessions);
    const unsub2 = subscribeRecentVisits((items) => {
      setRecentVisits(items);
      setLoading(false);
    }, 50);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const todayVisits = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return recentVisits.filter((v) => {
      const t = v.createdAt ? new Date(v.createdAt) : null;
      return t && t >= start;
    });
  }, [recentVisits]);

  const newLeads = todayVisits.filter((v) => v.category === "new_lead").length;
  const followUps = todayVisits.filter((v) => v.category === "follow_up").length;

  return (
    <div className="mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-brand-600">Operations overview</p><h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Real-time view of today&apos;s field activity across India.</p></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live · IST</div>
      </motion.div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={HiOutlineUserGroup} label="Employees Working" value={activeSessions.length} tint="green" />
        <StatCard icon={HiOutlineBuildingOffice2} label="Today's Visits" value={todayVisits.length} tint="brand" />
        <StatCard icon={HiOutlineStar} label="New Leads" value={newLeads} tint="amber" />
        <StatCard icon={HiOutlineSignal} label="Follow-Ups" value={followUps} tint="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4"><h2 className="font-display font-bold text-slate-900">PRO locations</h2><p className="text-xs text-slate-500">Latest captured location for employees currently on duty</p></div>
          {activeSessions.length ? <ul className="max-h-[360px] space-y-3 overflow-y-auto pr-1">{activeSessions.map((session) => <li key={session.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-800">{session.employeeName}</p><span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />On duty</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{session.currentLocation?.address || (session.currentLocation ? `${Number(session.currentLocation.latitude).toFixed(5)}, ${Number(session.currentLocation.longitude).toFixed(5)}` : "Location unavailable")}</p><p className="mt-1 text-[11px] text-slate-400">Started {new Date(session.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</p></li>)}</ul> : <div className="py-10 text-center"><p className="text-sm font-semibold text-slate-600">No PRO is currently on duty</p><p className="mt-1 text-xs text-slate-400">Locations appear after an employee starts duty.</p></div>}
        </Card>

        <Card>
          <div className="mb-4"><h2 className="font-display font-bold text-slate-900">Recent activity</h2><p className="text-xs text-slate-500">Latest field submissions</p></div>
          {loading ? <div className="space-y-3">{[1,2,3,4,5].map((item) => <div key={item} className="skeleton h-12 rounded-xl" />)}</div> : recentVisits.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
              {recentVisits.slice(0, 12).map((v) => (
                <li key={v.id} className="flex items-start gap-3 border-b border-brand-50 pb-3 last:border-0">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-900">{v.hospitalName}</p>
                    <p className="text-xs text-slate-400">{v.employeeName} · {new Date(v.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-300">
        <HiOutlineBuildingOffice2 size={26} />
      </div>
      <p className="text-sm font-medium text-brand-700">No visits yet today</p>
      <p className="text-xs text-brand-400">Field activity will appear here in real time.</p>
    </div>
  );
}
