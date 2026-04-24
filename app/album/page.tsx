import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { Photo } from "@/lib/types";
import { PhotoUploader } from "@/components/PhotoUploader";
import { Polaroid } from "@/components/Polaroid";

async function getPhotos() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { photos: [] as Photo[], error: "Supabase isn't configured yet." };
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("photos").select("*").order("created_at", { ascending: false });
    if (error) return { photos: [] as Photo[], error: error.message.includes("does not exist") ? "Did you run supabase/schema.sql?" : error.message };
    return { photos: (data ?? []) as Photo[], error: null };
  } catch {
    return { photos: [] as Photo[], error: "Supabase could not be reached." };
  }
}

export default async function AlbumPage() {
  const { photos, error } = await getPhotos();
  return (
    <main className="min-h-screen paper-bg p-4 sm:p-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl bg-cream/85 px-5 py-4 shadow-lg backdrop-blur">
        <Link href="/" className="wordmark text-2xl text-bark">ROOTS</Link>
        <span className="font-display text-xl font-bold text-bark">The Photo Album</span>
        <Link href="/" className="hand text-2xl text-sepia">home</Link>
      </nav>
      <section className="mx-auto max-w-6xl py-10">
        {error && <div className="mx-auto mb-6 max-w-xl rounded-2xl bg-cream p-4 text-center font-bold text-bark shadow">{error}</div>}
        <PhotoUploader />
        {photos.length === 0 ? <p className="hand text-center text-3xl text-sepia">No memories yet. Pin the first one.</p> : <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-10">{photos.map((photo) => <Polaroid key={photo.id} photo={photo} />)}</div>}
      </section>
    </main>
  );
}
