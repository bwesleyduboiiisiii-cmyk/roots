import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { encodeSession, SESSION_COOKIE_NAME, slugify } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { familyName, yourName, password } = await request.json();

    // Basic validation
    if (typeof familyName !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const trimmedName = familyName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return NextResponse.json(
        { error: "Family name must be between 2 and 80 characters" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (password.length > 200) {
      return NextResponse.json({ error: "Password too long" }, { status: 400 });
    }

    const slug = slugify(trimmedName);
    if (slug.length < 2) {
      return NextResponse.json(
        { error: "Family name must contain letters or numbers" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if slug is taken
    const { data: existing } = await supabase
      .from("families")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "A family with that name already exists. Try adding your last name or year." },
        { status: 409 }
      );
    }

    // Hash password using Supabase's pgcrypto function
    const { data: hashResult, error: hashError } = await supabase.rpc("hash_password", {
      password,
    });

    if (hashError || !hashResult) {
      console.error("Hash error:", hashError);
      return NextResponse.json({ error: "Could not secure password" }, { status: 500 });
    }

    // Create family
    const { data: family, error: insertError } = await supabase
      .from("families")
      .insert({
        name: trimmedName,
        slug,
        password_hash: hashResult,
        created_by_name: yourName?.trim() || null,
      })
      .select("id, name, slug")
      .single();

    if (insertError || !family) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Could not create family" }, { status: 500 });
    }

    // Optionally create the first person (the registrant) on the tree
    if (yourName?.trim()) {
      const [first, ...rest] = yourName.trim().split(/\s+/);
      await supabase.from("people").insert({
        family_id: family.id,
        first_name: first,
        last_name: rest.join(" ") || null,
        generation: 0,
        sort_order: 0,
      });
    }

    // Sign them in
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
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
