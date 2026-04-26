import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
<<<<<<< HEAD
import FamilyTreeCanvas from "@/components/FamilyTreeCanvas";
=======
import FamilyTree from "@/components/FamilyTree";
>>>>>>> e9617660311df9e4e832a1d3b4439b610f18d4c8
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
<<<<<<< HEAD
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
=======
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href={`/${session.family_slug}/hub`} className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl text-ink text-center">
          {session.family_name} — Tree
        </h1>
        <Link href={`/${session.family_slug}/album`} className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
>>>>>>> e9617660311df9e4e832a1d3b4439b610f18d4c8
          album →
        </Link>
      </header>

      {errorMessage ? (
<<<<<<< HEAD
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
=======
        <div className="max-w-xl mx-auto polaroid p-6" style={{ transform: "rotate(0deg)" }}>
          <h3 className="font-serif text-xl mb-2">Can't reach the tree</h3>
          <p className="text-sm text-ink/80">{errorMessage}</p>
        </div>
      ) : (
        <>
          <p className="text-center text-sepia/70 text-sm mb-4">
            Drag to pan · scroll or pinch to zoom · tap a person to see their story
          </p>
          <div className="max-w-6xl mx-auto bg-white/30 rounded-lg border border-sepia/20 overflow-hidden">
            <FamilyTree people={people} relationships={relationships} />
          </div>
        </>
>>>>>>> e9617660311df9e4e832a1d3b4439b610f18d4c8
      )}
    </main>
  );
}
