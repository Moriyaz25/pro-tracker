"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone } from "react-icons/hi2";
import toast from "react-hot-toast";
import { getEmployee, resetEmployeePassword, setEmployeeStatus, subscribeLatestSession, subscribeVisitsForSession } from "@/lib/dataClient";
import RouteGuard from "@/components/RouteGuard";
import AdminShell from "@/components/admin/AdminShell";
import Card from "@/components/ui/Card";
import Timeline from "@/components/admin/Timeline";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";

export default function EmployeeDetailPage() {
  return (
    <RouteGuard role="admin">
      <AdminShell>
        <EmployeeDetail />
      </AdminShell>
    </RouteGuard>
  );
}

function EmployeeDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingAction, setSavingAction] = useState(null);

  async function changeStatus() {
    const nextStatus = profile.status === "active" ? "inactive" : "active";
    setSavingAction("status");
    try {
      setProfile(await setEmployeeStatus(id, nextStatus));
      toast.success(`Account ${nextStatus === "active" ? "activated" : "deactivated"}.`);
    } catch (requestError) { toast.error(requestError.message); }
    finally { setSavingAction(null); }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setSavingAction("password");
    try {
      await resetEmployeePassword(id, newPassword);
      setNewPassword("");
      toast.success("Password reset. Existing sessions were signed out.");
    } catch (requestError) { toast.error(requestError.message); }
    finally { setSavingAction(null); }
  }

  useEffect(() => {
    let active = true;
    getEmployee(id).then((employee) => active && setProfile(employee)).catch((requestError) => active && setError(requestError.message));
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    return subscribeLatestSession(id, setSession);
  }, [id]);

  useEffect(() => {
    if (!session) return;
    return subscribeVisitsForSession(session.id, setVisits);
  }, [session]);

  const currentLocation = visits.at(-1)?.location || session?.currentLocation || session?.startLocation;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/employees" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-700"><HiOutlineArrowLeft size={17} /> Back to employees</Link>
      {error && <Card className="mb-5 border-rose-200 bg-rose-50 text-sm text-rose-600">{error}</Card>}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-5 text-white shadow-xl shadow-brand-500/15 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/20">
          {(profile?.name || "?").charAt(0)}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{profile?.name || "Loading employee..."}</h1>
          <p className="text-sm text-blue-100">{profile?.employeeId} · {profile?.designation || "PRO"}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100">{profile?.assignedArea && <span className="flex items-center gap-1"><HiOutlineMapPin />{profile.assignedArea}</span>}{profile?.phone && <span className="flex items-center gap-1"><HiOutlinePhone />{profile.phone}</span>}{profile?.email && <span className="flex items-center gap-1"><HiOutlineEnvelope />{profile.email}</span>}</div>
        </div>
        {profile && <span className={`sm:ml-auto rounded-full px-3 py-1 text-xs font-bold uppercase ${profile.status === "active" ? "bg-emerald-400/20 text-emerald-100" : "bg-white/10 text-white/70"}`}>{profile.status}</span>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display font-bold text-slate-900">Latest duty timeline</h2>
          {session ? <Timeline session={session} visits={visits} /> : (
            <p className="text-sm text-brand-400">No duty session recorded yet.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4"><h2 className="font-display font-bold text-slate-900">Latest PRO location</h2><p className="text-xs text-slate-500">Most recently captured GPS point</p></div>
          {currentLocation ? <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm"><HiOutlineMapPin size={22} /></span><p className="text-sm font-semibold leading-6 text-slate-800">{currentLocation.address || "GPS location captured"}</p><p className="mt-2 font-mono text-xs text-slate-500">{Number(currentLocation.latitude).toFixed(6)}, {Number(currentLocation.longitude).toFixed(6)}</p>{currentLocation.capturedAt && <p className="mt-2 text-xs text-slate-400">Captured {new Date(currentLocation.capturedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</p>}</div> : <p className="py-8 text-center text-sm text-slate-500">No location captured yet.</p>}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 font-display font-bold text-slate-900">Visit photos</h2>
        {visits.length === 0 ? (
          <p className="text-sm text-brand-400">No visits recorded in this session.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {visits.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {v.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photoUrl} alt={v.hospitalName} className="h-28 w-full object-cover" />
                )}
                <div className="p-2.5"><p className="truncate text-xs font-semibold text-slate-800">{v.hospitalName}</p><p className="mt-0.5 text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</p></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {profile && <Card className="mt-6">
        <div className="mb-4"><h2 className="font-display font-bold text-slate-900">Account controls</h2><p className="text-sm text-slate-500">Status changes and password resets take effect immediately.</p></div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-800">Account status</p><p className="mb-4 mt-1 text-xs leading-5 text-slate-500">Inactive employees cannot sign in. Their existing sessions are revoked.</p><Button type="button" variant={profile.status === "active" ? "danger" : "outline"} loading={savingAction === "status"} onClick={changeStatus}>{profile.status === "active" ? "Deactivate account" : "Activate account"}</Button></div>
          <form onSubmit={resetPassword} className="rounded-2xl border border-slate-200 p-4"><PasswordInput label="Set new password" autoComplete="new-password" minLength={6} required placeholder="Minimum 6 characters" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><Button type="submit" className="mt-4 w-full" loading={savingAction === "password"}>Reset password</Button></form>
        </div>
      </Card>}
    </div>
  );
}
