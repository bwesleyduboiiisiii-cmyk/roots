import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Polaroid from "@/components/Polaroid";
import PhotoUploader from "@/components/PhotoUploader";
import { getSessionForSlug } from "@/lib/session";
import { Photo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const session = getSessionForSlug(params.slug);
  if (!session) redirect("/");

  let list: Photo[] = [];
  let errorMessage: string | null = null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("family_id", session.family_id)
      .order("created_at", { ascending: false });

    if (error) errorMessage = `Database error: ${error.message}`;
    else list = (data ?? []) as Photo[];
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
        <Link href={`/${session.family_slug}/hub`} className="font-serif text-lg tracking-widest text-ink hover:text-sepia">
          ROOTS
        </Link>
        <h1 className="font-serif text-2xl md:text-3xl text-ink text-center">
          {session.family_name} — Album
        </h1>
        <Link href={`/${session.family_slug}/tree`} className="handwritten text-sepia hover:text-ink" style={{ fontSize: "1.3rem" }}>
          tree →
        </Link>
      </header>

      {errorMessage ? (
        <div className="max-w-xl mx-auto polaroid p-6" style={{ transform: "rotate(0deg)" }}>
          <h3 className="font-serif text-xl mb-2">Can't reach the album</h3>
          <p className="text-sm text-ink/80">{errorMessage}</p>
        </div>
      ) : (
        <>
          <section className="max-w-6xl mx-auto mb-12">
            <PhotoUploader familyId={session.family_id} />
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
