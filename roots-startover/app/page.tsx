import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase-server";

async function getStats() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { people: 0, generations: 0, photos: 0 };
  try {
    const supabase = createClient();
    const [{ count: people }, { data }, { count: photos }] = await Promise.all([
      supabase.from("people").select("id", { count: "exact", head: true }),
      supabase.from("people").select("generation"),
      supabase.from("photos").select("id", { count: "exact", head: true })
    ]);
    const gens = new Set((data ?? []).map((p) => p.generation));
    return { people: people ?? 0, generations: gens.size, photos: photos ?? 0 };
  } catch {
    return { people: 0, generations: 0, photos: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();
  return (
    <main className="min-h-screen paper-bg p-4 sm:p-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl bg-cream/85 px-5 py-4 shadow-lg backdrop-blur">
        <span className="wordmark text-2xl text-bark">ROOTS</span>
        <SignOutButton />
      </nav>
      <section className="mx-auto max-w-6xl py-14 text-center">
        <h1 className="font-display text-5xl text-bark sm:text-7xl">The <em>Family</em> family</h1>
        <p className="hand mt-3 text-3xl text-sepia">{stats.people} people · {stats.generations} generations · {stats.photos} memories</p>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <Link href="/tree" className="group rotate-[-1deg] rounded-lg bg-cream p-4 polaroid-shadow transition hover:rotate-0 hover:scale-[1.02]">
            <div className="grid h-72 place-items-center rounded bg-[linear-gradient(#d4e4d8_0_42%,#6b8e4e_42%_50%,#5c4530_50%)] text-7xl">🌳</div>
            <h2 className="mt-5 font-display text-3xl text-bark">The Family Tree</h2>
            <p className="hand text-2xl text-sepia">climb branches and descend into roots</p>
          </Link>
          <Link href="/album" className="group rotate-[1.5deg] rounded-lg bg-cream p-4 polaroid-shadow transition hover:rotate-0 hover:scale-[1.02]">
            <div className="grid h-72 place-items-center rounded bg-[linear-gradient(135deg,#d7a9a8,#d9a441)] text-7xl">▧</div>
            <h2 className="mt-5 font-display text-3xl text-bark">The Photo Album</h2>
            <p className="hand text-2xl text-sepia">polaroid memories with handwritten captions</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
