import { createClient } from "@/lib/supabase-server";
import Polaroid from "@/components/Polaroid";
import PhotoUploader from "@/components/PhotoUploader";
import Link from "next/link";
import { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  const supabase = createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  const list: Photo[] = photos ?? [];

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">The Album</h1>
        <Link href="/tree" className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          tree →
        </Link>
      </header>

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
    </main>
  );
}
