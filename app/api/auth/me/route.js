import { NextResponse } from "next/server";
import { currentUser, publicUser } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function GET() {
  try {
    return NextResponse.json({ user: publicUser(await currentUser()) });
  } catch (error) {
    return jsonError(error);
  }
}

