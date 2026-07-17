import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError, sessionRow } from "@/lib/server/http";

export async function POST(request, { params }) {
  try {
    const user = await requireUser("pro");
    const { id } = await params;
    const { location, selfieUrl } = await request.json();
    if (!location?.latitude || !location?.longitude) {
      return NextResponse.json({ error: "A valid live location is required." }, { status: 400 });
    }
    const result = await query(
      `UPDATE duty_sessions
       SET status = 'completed', ended_at = now(), end_location = $1, end_selfie_url = $2
       WHERE id = $3 AND employee_id = $4 AND status = 'active'
       RETURNING *`,
      [location, selfieUrl || null, id, user.id]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Active duty session not found." }, { status: 409 });
    }
    return NextResponse.json({ session: sessionRow(result.rows[0]) });
  } catch (error) {
    return jsonError(error);
  }
}

