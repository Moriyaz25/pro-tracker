"use client";

import { useEffect, useState } from "react";
import { HiOutlineCalendarDays, HiOutlineMapPin } from "react-icons/hi2";
import RouteGuard from "@/components/RouteGuard";
import BottomNav from "@/components/pro/BottomNav";
import Card from "@/components/ui/Card";
import { listDutySessions } from "@/lib/dataClient";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    listDutySessions().then((items) => { if (active) setSessions(items); }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <RouteGuard role="pro">
      <div className="app-pro-screen min-h-dvh bg-[#f5f8fc] px-4 pb-32 pt-7 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-5"><p className="text-sm font-semibold text-brand-600">Your activity</p><h1 className="font-display text-3xl font-bold text-slate-900">Duty history</h1><p className="mt-1 text-sm text-slate-500">Past sessions shown in Indian Standard Time.</p></div>
          <div className="space-y-3">
            {loading && [1,2,3].map((item) => <div key={item} className="skeleton h-28 rounded-2xl" />)}
            {error && <Card className="border-rose-200 bg-rose-50 text-sm text-rose-600">{error}</Card>}
            {sessions.map((session) => (
              <Card key={session.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-slate-900"><HiOutlineCalendarDays className="text-brand-500" /> {new Date(session.startedAt).toLocaleDateString("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" })}</p>
                    <p className="mt-1 text-xs text-slate-400">Started {new Date(session.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${session.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{session.status}</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-500"><HiOutlineMapPin /> {session.totalVisits} visits · {Number(session.totalDistanceKm || 0).toFixed(1)} km travelled</p>
              </Card>
            ))}
            {!loading && !error && !sessions.length && <Card className="py-10 text-center text-sm text-slate-500">No duty sessions recorded yet.</Card>}
          </div>
        </div>
        <BottomNav />
      </div>
    </RouteGuard>
  );
}
