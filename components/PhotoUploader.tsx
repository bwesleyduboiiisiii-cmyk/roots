"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Props = { familyId: string };

export default function PhotoUploader({ familyId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [takenDate, setTakenDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      setError("That photo is over 10MB — try a smaller one?");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      // 1. Upload to Supabase Storage, namespaced by family_id
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${familyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("family-photos")
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from("family-photos")
        .getPublicUrl(filename);

      // 3. Insert row in photos table with family_id
      const { error: dbError } = await supabase.from("photos").insert({
        family_id: familyId,
        image_url: urlData.publicUrl,
        caption: caption || null,
        uploaded_by: uploadedBy || null,
        taken_date: takenDate || null,
        rotation: Math.floor(Math.random() * 7) - 3,
      });

      if (dbError) throw dbError;

      // Reset and refresh
      setFile(null);
      setPreview(null);
      setCaption("");
      setTakenDate("");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="polaroid mx-auto max-w-md" style={{ transform: "rotate(0deg)", padding: "20px" }}>
      <h3 className="handwritten text-center mb-3" style={{ fontSize: "1.6rem" }}>
        Pin a memory
      </h3>

      {!preview ? (
        <label className="block border-2 border-dashed border-sepia/40 rounded p-8 text-center cursor-pointer hover:bg-sepia/5">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sepia">Tap to choose a photo</p>
          <p className="text-xs text-sepia/60 mt-1">JPG, PNG, or HEIC · up to 10MB</p>
        </label>
      ) : (
        <>
          <div className="w-full aspect-square bg-neutral-200 overflow-hidden mb-3">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          </div>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (e.g. Mom's 5th birthday)"
            maxLength={120}
            className="w-full handwritten text-center border-b border-sepia/30 bg-transparent focus:outline-none focus:border-sepia py-1 mb-2"
          />

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              placeholder="Your name"
              className="flex-1 text-sm border border-sepia/30 rounded px-2 py-1 bg-white/70"
            />
            <input
              type="date"
              value={takenDate}
              onChange={(e) => setTakenDate(e.target.value)}
              className="text-sm border border-sepia/30 rounded px-2 py-1 bg-white/70"
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center mb-2">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setCaption("");
                if (fileInput.current) fileInput.current.value = "";
              }}
              disabled={uploading}
              className="flex-1 py-2 border border-sepia/40 text-sepia rounded hover:bg-sepia/10"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2 bg-sepia text-white rounded hover:bg-ink disabled:opacity-50"
            >
              {uploading ? "Pinning..." : "Pin it"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
