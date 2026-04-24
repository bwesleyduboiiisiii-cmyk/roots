import { createClient } from "@/lib/supabase-server";
import FamilyTree from "@/components/FamilyTree";
import Link from "next/link";
import { Person, Relationship } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TreePage() {
  let people: Person[] = [];
  let relationships: Relationship[] = [];
  let errorMessage: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      errorMessage = "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables.";
    } else {
      const supabase = createClient();
      const [peopleRes, relsRes] = await Promise.all([
        supabase.from("people").select("*").order("generation").order("sort_order"),
        supabase.from("relationships").select("*"),
      ]);

      if (peopleRes.error) {
        errorMessage = `Supabase error: ${peopleRes.error.message}. Did you run schema.sql in the SQL editor?`;
      } else if (relsRes.error) {
        errorMessage = `Supabase error: ${relsRes.error.message}. Did you run schema.sql in the SQL editor?`;
      } else {
        people = (peopleRes.data ?? []) as Person[];
        relationships = (relsRes.data ?? []) as Relationship[];
      }
    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : "Unknown error fetching tree";
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/hub" className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">The Family Tree</h1>
        <Link href="/album" className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          album →
        </Link>
      </header>

      {errorMessage ? (
        <div className="max-w-xl mx-auto polaroid p-6" style={{ transform: "rotate(0deg)" }}>
          <h3 className="font-serif text-xl mb-2">Can't reach the tree</h3>
          <p className="text-sm text-ink/80 mb-3">{errorMessage}</p>
          <p className="text-xs text-sepia">
            Check the README for setup steps, or look at Vercel → Logs for the full error.
          </p>
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
