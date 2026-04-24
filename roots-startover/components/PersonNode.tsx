"use client";

import type { Person } from "@/lib/types";

export function PersonNode({ person, onSelect }: { person: Person; onSelect: (person: Person) => void }) {
  const initial = person.first_name.slice(0, 1).toUpperCase();
  const variant = person.generation > 0 ? "border-grass bg-green-100 text-grassDark" : person.generation < 0 ? "border-soilTop bg-soilMid text-cream" : "border-bark bg-cream text-bark";
  return (
    <button onClick={() => onSelect(person)} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center">
      <div className={`mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full border-4 shadow-lg ${variant}`}>
        {person.profile_photo_url ? <img src={person.profile_photo_url} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-2xl font-bold">{initial}</span>}
      </div>
      <div className={person.generation < 0 ? "mt-1 font-display text-sm font-bold text-cream drop-shadow" : "mt-1 font-display text-sm font-bold text-ink drop-shadow"}>{person.first_name}</div>
      <div className={person.generation < 0 ? "hand text-lg text-cream/90 drop-shadow" : "hand text-lg text-sepia"}>{person.birth_date?.slice(0,4) ?? ""}{person.death_date ? `-${person.death_date.slice(0,4)}` : ""}</div>
    </button>
  );
}
