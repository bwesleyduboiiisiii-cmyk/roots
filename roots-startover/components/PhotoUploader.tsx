"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import { createClient } from "@/lib/supabase-browser";

export function PhotoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [takenDate, setTakenDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function normalize(input: File) {
    let working = input;
    if (input.type.includes("heic") || input.name.toLowerCase().endsWith(".heic")) {
      const blob = await heic2any({ blob: input, toType: "image/jpeg", quality: 0.9 });
      working = new File([Array.isArray(blob) ? blob[0] : blob], input.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
    }
    return imageCompression(working, { maxSizeMB: 1, maxWidthOrHeight: 1500, useWebWorker: true });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const compressed = await normalize(file);
      const ext = compressed.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("family-photos").upload(path, compressed, { contentType: compressed.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("family-photos").getPublicUrl(path);
      const rotation = Math.floor(Math.random() * 7) - 3;
      const { error: insertError } = await supabase.from("photos").insert({ image_url: data.publicUrl, caption, uploaded_by: uploadedBy, taken_date: takenDate || null, rotation });
      if (insertError) throw insertError;
      setMessage("Memory pinned.");
      setFile(null); setCaption(""); setUploadedBy(""); setTakenDate("");
      window.location.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mb-12 max-w-sm rotate-[-1deg] bg-cream p-4 pb-6 text-center polaroid-shadow">
      <label className="grid aspect-square cursor-pointer place-items-center rounded border-2 border-dashed border-sepia bg-paper text-6xl text-sepia">
        +
        <input type="file" accept="image/*,.heic" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <p className="hand mt-3 text-3xl text-bark">Pin a memory</p>
      {file && <p className="text-sm text-sepia">{file.name}</p>}
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="caption" className="hand mt-4 w-full border-b border-sepia bg-transparent px-2 py-2 text-center text-2xl outline-none" />
      <input value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} placeholder="your name" className="mt-3 w-full rounded-xl border border-sepia/30 bg-white/50 px-3 py-2" />
      <input type="date" value={takenDate} onChange={(e) => setTakenDate(e.target.value)} className="mt-3 w-full rounded-xl border border-sepia/30 bg-white/50 px-3 py-2" />
      <button disabled={!file || loading} className="mt-5 rounded-full bg-bark px-6 py-3 font-black text-cream disabled:opacity-50">{loading ? "Pinning..." : "Upload"}</button>
      {message && <p className="mt-3 text-sm font-bold text-bark">{message}</p>}
    </form>
  );
}
