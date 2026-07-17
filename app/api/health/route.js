import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET() {
  try {
    await query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503 });
  }
}
