"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Person } from "@/lib/types";
import { TreeScene } from "./TreeScene";
import { PersonNode } from "./PersonNode";

const GRASS_Y = 1450;
const STEP = 350;

function nodePosition(person: Person, people: Person[]) {
  const same = people.filter((p) => p.generation === person.generation).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const idx = Math.max(0, same.findIndex((p) => p.id === person.id));
  const gap = Math.min(175, 700 / Math.max(1, same.length));
  return { x: 450 + (idx - (same.length - 1) / 2) * gap, y: GRASS_Y - person.generation * STEP };
}

export function FamilyTree({ people }: { people: Person[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<Person | null>(null);
  const displayPeople = useMemo(() => people, [people]);

  useEffect(() => {
    ref.current?.scrollTo({ top: 1010 });
  }, []);

  return (
    <>
      <div ref={ref} className="h-[calc(100vh-112px)] overflow-auto bg-skyTop">
        <div className="relative h-[2800px] min-w-[900px]">
          <TreeScene />
          {displayPeople.map((person) => {
            const pos = nodePosition(person, displayPeople);
            return <div key={person.id} style={{ left: pos.x, top: pos.y }} className="absolute"><PersonNode person={person} onSelect={setSelected} /></div>;
          })}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <section onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-cream p-8 shadow-2xl">
            <button onClick={() => setSelected(null)} className="float-right rounded-full bg-paper px-3 py-1 text-xl">×</button>
            <h2 className="font-display text-3xl text-bark">{selected.first_name} {selected.last_name}</h2>
            <p className="hand text-2xl text-sepia">{selected.birth_date ?? ""}{selected.death_date ? ` - ${selected.death_date}` : ""}</p>
            {selected.maiden_name && <p className="mt-3 text-sm text-sepia">Maiden name: {selected.maiden_name}</p>}
            <p className="mt-4 leading-7">{selected.bio || "No bio yet."}</p>
            <a href={`/album?person=${selected.id}`} className="mt-6 inline-block rounded-full bg-grass px-5 py-3 font-black text-cream">View their photos</a>
          </section>
        </div>
      )}
    </>
  );
}
