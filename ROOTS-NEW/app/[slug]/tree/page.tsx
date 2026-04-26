import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import FamilyTree from "@/components/FamilyTree";
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
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href={`/${session.family_slug}/hub`} className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl text-ink text-center">
          {session.family_name} — Tree
        </h1>
        <Link href={`/${session.family_slug}/album`} className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          album →
        </Link>
      </header>

      {errorMessage ? (
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
      )}
    </main>
  );
}
