import Link from "next/link";
import { FamilyTree } from "@/components/FamilyTree";
import { createClient } from "@/lib/supabase-server";
import type { Person } from "@/lib/types";

const samplePeople: Person[] = [
  { id: "1", first_name: "You", last_name: "", maiden_name: null, nickname: null, birth_date: null, death_date: null, bio: "Add your family in Supabase to replace this sample.", profile_photo_url: null, generation: 0, sort_order: 0, created_at: null },
  { id: "2", first_name: "Parent", last_name: "", maiden_name: null, nickname: null, birth_date: null, death_date: null, bio: "Ancestors live in the roots below the grass line.", profile_photo_url: null, generation: -1, sort_order: 0, created_at: null },
  { id: "3", first_name: "Child", last_name: "", maiden_name: null, nickname: null, birth_date: null, death_date: null, bio: "Descendants climb into the branches above.", profile_photo_url: null, generation: 1, sort_order: 0, created_at: null }
];

async function getPeople() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { people: samplePeople, error: "Supabase isn't configured yet." };
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("people").select("*").order("generation", { ascending: false }).order("sort_order", { ascending: true });
    if (error) return { people: samplePeople, error: error.message.includes("does not exist") ? "Did you run supabase/schema.sql?" : error.message };
    return { people: (data ?? samplePeople) as Person[], error: null };
  } catch {
    return { people: samplePeople, error: "Supabase could not be reached." };
  }
}

export default async function TreePage() {
  const { people, error } = await getPeople();
  return (
    <main className="min-h-screen bg-skyTop">
      <nav className="sticky top-0 z-40 grid grid-cols-3 items-center bg-cream/90 px-5 py-4 shadow-md backdrop-blur">
        <Link href="/" className="wordmark text-bark">ROOTS</Link>
        <span className="text-center font-display text-xl font-bold text-bark">The Family Tree</span>
        <Link href="/" className="hand text-right text-2xl text-sepia">home</Link>
      </nav>
      {error && <div className="mx-auto my-3 max-w-xl rounded-2xl bg-cream p-4 text-center font-bold text-bark shadow">{error}</div>}
      <p className="bg-cream/70 px-3 py-2 text-center text-sm font-bold text-bark">↑ scroll up to climb into branches (younger) · scroll down to descend into roots (older) ↓</p>
      <FamilyTree people={people} />
    </main>
  );
}
