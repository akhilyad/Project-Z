import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Just test if Prisma can connect
    const count = await prisma.user.count();
    return NextResponse.json({ ok: true, userCount: count });
  } catch (error: unknown) {
    // Log the full error including cause for debugging
    const err = error as { message?: string; cause?: unknown };
    console.error("Health check error:", JSON.stringify({
      message: err.message,
      cause: err.cause ? String(err.cause) : undefined,
      full: String(error),
    }, null, 2));
    return NextResponse.json(
      { ok: false, error: err.message, cause: String(err.cause || "") },
      { status: 500 }
    );
  }
}
