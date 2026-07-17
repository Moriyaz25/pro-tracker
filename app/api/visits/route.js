import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/server/auth";
import { pool, ensureSchema, query } from "@/lib/server/db";
import { jsonError, visitRow } from "@/lib/server/http";

export async function GET(request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
    const values = [];
    const conditions = [];
    if (sessionId) {
      values.push(sessionId);
      conditions.push(`session_id = $${values.length}`);
    }
    if (user.role === "pro") {
      values.push(user.id);
      conditions.push(`employee_id = $${values.length}`);
    }
    values.push(limit);
    const result = await query(
      `SELECT * FROM visits ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY created_at ${sessionId ? "ASC" : "DESC"} LIMIT $${values.length}`,
      values
    );
    return NextResponse.json({ visits: result.rows.map(visitRow) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  let client;
  try {
    const user = await requireUser("pro");
    const data = await request.json();
    if (!data.sessionId || !data.hospitalName?.trim() || !data.photoUrl || !data.location) {
      return NextResponse.json({ error: "Session, hospital, photo, and location are required." }, { status: 400 });
    }
    await ensureSchema();
    client = await pool.connect();
    await client.query("BEGIN");
    const session = await client.query(
      "SELECT * FROM duty_sessions WHERE id = $1 AND employee_id = $2 AND status = 'active' FOR UPDATE",
      [data.sessionId, user.id]
    );
    if (!session.rowCount) throw Object.assign(new Error("Active duty session not found."), { status: 409 });
    const id = randomUUID();
    await client.query(
      `INSERT INTO visits
       (id, session_id, employee_id, employee_name, hospital_name, doctor_name, department,
        contact_number, remarks, category, photo_url, location, device, distance_from_previous_km)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [id, data.sessionId, user.id, user.name, data.hospitalName.trim(), data.doctorName || null,
       data.department || null, data.contactNumber || null, data.remarks || null, data.category,
       data.photoUrl, data.location, data.device || null, Number(data.distanceFromPreviousKm) || 0]
    );
    await client.query(
      "UPDATE duty_sessions SET total_visits = total_visits + 1, total_distance_km = total_distance_km + $1 WHERE id = $2",
      [Number(data.distanceFromPreviousKm) || 0, data.sessionId]
    );
    await client.query("COMMIT");
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    return jsonError(error);
  } finally {
    client?.release();
  }
}

