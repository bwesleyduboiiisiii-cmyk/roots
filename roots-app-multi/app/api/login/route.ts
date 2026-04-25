import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { encodeSession, SESSION_COOKIE_NAME, slugify } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { familyName, password } = await request.json();

    if (typeof familyName !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slug = slugify(familyName.trim());
    if (!slug) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    const supabase = createClient();

    const { data: family, error } = await supabase
      .from("families")
      .select("id, name, slug, password_hash")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !family) {
      return NextResponse.json({ error: "Family not found" }, { status: 404 });
    }

    // Verify password
    const { data: ok, error: verifyError } = await supabase.rpc("verify_password", {
      password,
      hash: family.password_hash,
    });

    if (verifyError) {
      console.error("Verify error:", verifyError);
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    if (!ok) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    const session = encodeSession({
      family_id: family.id,
      family_slug: family.slug,
      family_name: family.name,
    });

    const response = NextResponse.json({ ok: true, slug: family.slug });
    response.cookies.set(SESSION_COOKIE_NAME, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
