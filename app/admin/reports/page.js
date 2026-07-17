"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineBuildingOffice2, HiOutlineChartBar, HiOutlineUserGroup } from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import AdminShell from "@/components/admin/AdminShell";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { subscribeRecentVisits } from "@/lib/dataClient";

const categoryLabels = { existing: "Existing Client", new_lead: "New Lead", follow_up: "Follow-up", visited_only: "Visited" };

export default function ReportsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeRecentVisits((items) => { setVisits(items); setLoading(false); }, 200), []);

  const employees = useMemo(() => new Set(visits.map((visit) => visit.employeeId)).size, [visits]);
  const leads = visits.filter((visit) => visit.category === "new_lead").length;

  return (
    <RouteGuard role="admin">
      <AdminShell>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6"><p className="text-sm font-semibold text-brand-600">Performance overview</p><h1 className="font-display text-3xl font-bold text-slate-900">Activity reports</h1><p className="mt-1 text-sm text-slate-500">Latest verified field visits, shown in Indian Standard Time.</p></div>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard icon={HiOutlineBuildingOffice2} label="Recorded Visits" value={visits.length} />
            <StatCard icon={HiOutlineUserGroup} label="Active PROs" value={employees} tint="green" />
            <StatCard icon={HiOutlineChartBar} label="New Leads" value={leads} tint="amber" />
          </div>
          <Card className="overflow-hidden !p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-display font-bold text-slate-900">Recent visit log</h2><p className="text-xs text-slate-500">Automatically refreshed every 5 seconds</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span></div>
            {loading ? <div className="space-y-2 p-5">{[1,2,3,4].map((item) => <div key={item} className="skeleton h-12 rounded-xl" />)}</div> : visits.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Date & time</th><th className="px-5 py-3">Hospital</th><th className="px-5 py-3">PRO</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Location</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((visit) => <tr key={visit.id} className="hover:bg-slate-50/70"><td className="whitespace-nowrap px-5 py-3 text-slate-500">{new Date(visit.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td><td className="px-5 py-3 font-semibold text-slate-800">{visit.hospitalName}</td><td className="px-5 py-3 text-slate-600">{visit.employeeName}</td><td className="px-5 py-3"><span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{categoryLabels[visit.category] || visit.category}</span></td><td className="max-w-56 truncate px-5 py-3 text-slate-500">{visit.location?.address || "GPS captured"}</td></tr>)}
                  </tbody>
                </table>
              </div>
            ) : <div className="p-10 text-center text-sm text-slate-500">No visits have been recorded yet.</div>}
          </Card>
        </div>
      </AdminShell>
    </RouteGuard>
  );
}
