import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import FamilyTreeCanvas from "@/components/FamilyTreeCanvas";
import { getSessionForSlug } from "@/lib/session";
import { Person, Relationship } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TreePage({ params }: { params: { slug: string } }) {
  const session = getSessionForSlug(params.slug);
  if (!session) redirect("/");

  let people: Person[] = [];
  let relationships: Relationship[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = createClient();
    const [peopleRes, relsRes] = await Promise.all([
      supabase
        .from("people")
        .select("*")
        .eq("family_id", session.family_id)
        .order("generation")
        .order("sort_order"),
      supabase
        .from("relationships")
        .select("*")
        .eq("family_id", session.family_id),
    ]);

    if (peopleRes.error) errorMessage = `Database error: ${peopleRes.error.message}`;
    else if (relsRes.error) errorMessage = `Database error: ${relsRes.error.message}`;
    else {
      people = (peopleRes.data ?? []) as Person[];
      relationships = (relsRes.data ?? []) as Relationship[];
    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="min-h-screen" style={{ background: "#0a0604" }}>
      {/* Compact header bar */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(45, 30, 20, 0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(217, 183, 105, 0.2)",
        }}
      >
        <Link
          href={`/${session.family_slug}/hub`}
          className="font-serif tracking-widest hover:text-cream transition-colors"
          style={{ color: "#d9b769", fontSize: "1rem" }}
        >
          ROOTS
        </Link>
        <h1
          className="font-serif italic text-center"
          style={{ color: "#f4e4a8", fontSize: "1.1rem" }}
        >
          {session.family_name}
        </h1>
        <Link
          href={`/${session.family_slug}/album`}
          className="handwritten transition-colors"
          style={{ color: "#d9b769", fontSize: "1.2rem" }}
        >
          album →
        </Link>
      </header>

      {errorMessage ? (
        <div className="max-w-xl mx-auto p-6 mt-8 polaroid" style={{ transform: "rotate(0deg)" }}>
          <h3 className="font-serif text-xl mb-2 text-ink">Can't reach the tree</h3>
          <p className="text-sm text-ink/80">{errorMessage}</p>
        </div>
      ) : (
        <FamilyTreeCanvas
          people={people}
          relationships={relationships}
          familySlug={session.family_slug}
          familyId={session.family_id}
        />
      )}
    </main>
  );
}
