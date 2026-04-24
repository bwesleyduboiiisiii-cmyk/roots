import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };

  if (!process.env.FAMILY_PASSWORD || !process.env.AUTH_SECRET) {
    return NextResponse.json({ ok: false, error: "Auth env vars are missing." }, { status: 500 });
  }

  if (password !== process.env.FAMILY_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Wrong family password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("family_auth", process.env.AUTH_SECRET, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("family_auth", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
