import { createClient } from "@/lib/supabase-server";
import FamilyTree from "@/components/FamilyTree";
import Link from "next/link";
import { Person, Relationship } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TreePage() {
  const supabase = createClient();

  const [{ data: people }, { data: relationships }] = await Promise.all([
    supabase.from("people").select("*").order("generation").order("sort_order"),
    supabase.from("relationships").select("*"),
  ]);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">The Family Tree</h1>
        <Link href="/album" className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          album →
        </Link>
      </header>

      <p className="text-center text-sepia/70 text-sm mb-4">
        Drag to pan · scroll or pinch to zoom · tap a person to see their story
      </p>

      <div className="max-w-6xl mx-auto bg-white/30 rounded-lg border border-sepia/20 overflow-hidden">
        <FamilyTree
          people={(people ?? []) as Person[]}
          relationships={(relationships ?? []) as Relationship[]}
        />
      </div>
    </main>
  );
}
