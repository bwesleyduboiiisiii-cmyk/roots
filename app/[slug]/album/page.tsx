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
    <main
      className="min-h-screen p-6 md:p-10 relative"
      style={{
        background:
          "radial-gradient(ellipse at center top, #3d2816 0%, #1a0f08 60%, #0a0604 100%)",
      }}
    >
      {/* Subtle dirt texture overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(217, 183, 105, 0.08) 1px, transparent 1px), radial-gradient(rgba(139, 111, 71, 0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      />

      <div className="relative">
        <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between">
          <Link
            href={`/${session.family_slug}/hub`}
            className="font-serif text-lg tracking-widest transition-colors"
            style={{ color: "#d9b769" }}
          >
            ROOTS
          </Link>
          <h1
            className="font-serif text-2xl md:text-3xl text-center"
            style={{
              color: "#f4e4a8",
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            {session.family_name} — Album
          </h1>
          <Link
            href={`/${session.family_slug}/tree`}
            className="handwritten transition-colors"
            style={{ fontSize: "1.3rem", color: "#d9b769" }}
          >
            tree →
          </Link>
        </header>

        {errorMessage ? (
          <div className="max-w-xl mx-auto polaroid p-6" style={{ transform: "rotate(0deg)" }}>
            <h3 className="font-serif text-xl mb-2 text-ink">Can't reach the album</h3>
            <p className="text-sm text-ink/80">{errorMessage}</p>
          </div>
        ) : (
          <>
            <section className="max-w-6xl mx-auto mb-12">
              <PhotoUploader familyId={session.family_id} />
            </section>

            {list.length === 0 ? (
              <div className="text-center py-20">
                <p
                  className="handwritten"
                  style={{
                    fontSize: "1.6rem",
                    color: "#d9b769",
                    textShadow: "0 2px 6px rgba(0,0,0,0.7)",
                  }}
                >
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
      </div>
    </main>
  );
}
