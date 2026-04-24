import type { Photo } from "@/lib/types";

function rotationFor(photo: Photo) {
  if (typeof photo.rotation === "number") return photo.rotation;
  return ((photo.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 7) - 3);
}

export function Polaroid({ photo }: { photo: Photo }) {
  return (
    <article className="bg-cream p-[14px] pb-5 polaroid-shadow transition duration-200 hover:z-10 hover:rotate-0 hover:scale-[1.03]" style={{ transform: `rotate(${rotationFor(photo)}deg)` }}>
      <img src={photo.image_url} alt={photo.caption ?? "Family photo"} className="aspect-square w-full rounded-sm object-cover" />
      <p className="hand min-h-[52px] pt-3 text-center text-3xl leading-7 text-ink">{photo.caption || "untitled memory"}</p>
      <p className="hand text-center text-xl text-sepia">{photo.taken_date ?? ""}{photo.uploaded_by ? ` · ${photo.uploaded_by}` : ""}</p>
    </article>
  );
}
