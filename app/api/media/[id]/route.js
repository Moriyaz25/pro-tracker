import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { jsonError } from "@/lib/server/http";

export async function GET(_request, { params }) {
  try {
    await requireUser();
    const { id } = await params;
    const result = await query("SELECT content_type, data FROM media WHERE id = $1", [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    return new NextResponse(result.rows[0].data, {
      headers: { "Content-Type": result.rows[0].content_type, "Cache-Control": "private, max-age=86400" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

