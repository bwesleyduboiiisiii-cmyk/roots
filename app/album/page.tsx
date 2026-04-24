import { createClient } from "@/lib/supabase-server";
import Polaroid from "@/components/Polaroid";
import PhotoUploader from "@/components/PhotoUploader";
import Link from "next/link";
import { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  let list: Photo[] = [];
  let errorMessage: string | null = null;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      errorMessage = "Supabase isn't configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables.";
    } else {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        errorMessage = `Supabase error: ${error.message}. Did you run schema.sql in the SQL editor?`;
      } else {
        list = (data ?? []) as Photo[];
      }
    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : "Unknown error fetching photos";
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
        <Link href="/hub" className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">The Album</h1>
        <Link href="/tree" className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          tree →
        </Link>
      </header>

      {errorMessage ? (
        <div className="max-w-xl mx-auto polaroid p-6" style={{ transform: "rotate(0deg)" }}>
          <h3 className="font-serif text-xl mb-2">Can't reach the album</h3>
          <p className="text-sm text-ink/80 mb-3">{errorMessage}</p>
          <p className="text-xs text-sepia">
            Check the README for setup steps, or look at Vercel → Logs for the full error.
          </p>
        </div>
      ) : (
        <>
          <section className="max-w-6xl mx-auto mb-12">
            <PhotoUploader />
          </section>

          {list.length === 0 ? (
            <div className="text-center py-20">
              <p className="handwritten text-sepia" style={{ fontSize: "1.6rem" }}>
                No memories yet. Be the first to pin one.
              </p>
            </div>
          ) : (
            <section
              className="max-w-6xl mx-auto grid gap-10 justify-items-center"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {list.map((photo) => (
                <Polaroid key={photo.id} photo={photo} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
