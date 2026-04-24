"use client";

import Image from "next/image";
import { Photo } from "@/lib/types";

type Props = {
  photo: Photo;
  onClick?: () => void;
};

export default function Polaroid({ photo, onClick }: Props) {
  // Use photo's saved rotation (or derive one from its id so it stays stable across renders)
  const rotation = photo.rotation ?? deriveRotation(photo.id);

  const takenYear = photo.taken_date
    ? new Date(photo.taken_date).getFullYear()
    : null;

  return (
    <div
      onClick={onClick}
      className="polaroid cursor-pointer relative"
      style={{
        transform: `rotate(${rotation}deg)`,
        width: "100%",
        maxWidth: "280px",
      }}
    >
      <div className="relative w-full aspect-square bg-neutral-200 overflow-hidden">
        <Image
          src={photo.image_url}
          alt={photo.caption || "Family photo"}
          fill
          sizes="(max-width: 640px) 90vw, 280px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="pt-3 pb-5 px-1 min-h-[72px]">
        <p className="handwritten text-center leading-tight">
          {photo.caption || <span className="text-sepia/40">(no caption)</span>}
        </p>
        {(photo.uploaded_by || takenYear) && (
          <p className="handwritten text-center text-sepia/70 mt-1" style={{ fontSize: "0.95rem" }}>
            {[takenYear, photo.uploaded_by].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

// Stable pseudo-random rotation from an id, so photos don't jump around between renders
function deriveRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
  // map to -3..3 degrees
  return ((Math.abs(hash) % 61) - 30) / 10;
}
