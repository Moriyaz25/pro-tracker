import { NextResponse } from "next/server";
import { destroySession } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

