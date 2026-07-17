import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, sessionRow } from "@/lib/server/http";

export async function GET(request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId");
    const active = url.searchParams.get("active") === "true";
    const all = url.searchParams.get("all") === "true";
    if (user.role === "pro" && employeeId && employeeId !== user.id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
    const conditions = [];
    const values = [];
    if (employeeId || user.role === "pro") {
      values.push(employeeId || user.id);
      conditions.push(`employee_id = $${values.length}`);
    }
    if (active) conditions.push("status = 'active'");
    const result = await query(
      `SELECT ds.*,
         COALESCE((SELECT v.location FROM visits v WHERE v.session_id = ds.id ORDER BY v.created_at DESC LIMIT 1), ds.start_location) AS current_location
       FROM duty_sessions ds ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY started_at DESC ${employeeId || (user.role === "pro" && !all) ? "LIMIT 1" : ""}`,
      values
    );
    return NextResponse.json({ sessions: result.rows.map(sessionRow) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser("pro");
    const { location, selfieUrl } = await request.json();
    if (!location?.latitude || !location?.longitude) {
      return NextResponse.json({ error: "A valid location is required." }, { status: 400 });
    }
    const id = randomUUID();
    const result = await query(
      `INSERT INTO duty_sessions (id, employee_id, employee_name, start_location, start_selfie_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, user.id, user.name, location, selfieUrl || null]
    );
    return NextResponse.json({ session: sessionRow(result.rows[0]) }, { status: 201 });
  } catch (error) {
    if (error.code === "23505") error = Object.assign(new Error("You already have an active duty session."), { status: 409 });
    return jsonError(error);
  }
}
