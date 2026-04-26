"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Person, Relationship } from "@/lib/types";
import { useMemo, useState } from "react";

type Props = {
  people: Person[];
  relationships: Relationship[];
};

const NODE_W = 160;
const NODE_H = 80;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 140;

export default function FamilyTree({ people, relationships }: Props) {
  const [selected, setSelected] = useState<Person | null>(null);

  // Group people by generation and compute coordinates
  const layout = useMemo(() => {
    if (people.length === 0) return { nodes: [], edges: [], width: 800, height: 400 };

    // Sort each generation by sort_order
    const byGen = new Map<number, Person[]>();
    for (const p of people) {
      const list = byGen.get(p.generation) ?? [];
      list.push(p);
      byGen.set(p.generation, list);
    }
    byGen.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));

    const generations = [...byGen.keys()].sort((a, b) => a - b);
    const maxRowCount = Math.max(...[...byGen.values()].map((g) => g.length));
    const canvasWidth = Math.max(800, maxRowCount * (NODE_W + HORIZONTAL_GAP) + HORIZONTAL_GAP);

    const coords = new Map<string, { x: number; y: number }>();
    generations.forEach((gen, genIdx) => {
      const row = byGen.get(gen)!;
      const rowWidth = row.length * NODE_W + (row.length - 1) * HORIZONTAL_GAP;
      const startX = (canvasWidth - rowWidth) / 2;
      row.forEach((p, i) => {
        coords.set(p.id, {
          x: startX + i * (NODE_W + HORIZONTAL_GAP),
          y: 40 + genIdx * (NODE_H + VERTICAL_GAP),
        });
      });
    });

    // Build edges
    const edges: Array<{ type: "parent" | "spouse"; from: string; to: string }> = [];
    for (const r of relationships) {
      if (r.relationship_type === "parent") {
        // person_id is parent, related_person_id is child
        edges.push({ type: "parent", from: r.person_id, to: r.related_person_id });
      } else if (r.relationship_type === "spouse") {
        // Only one direction — avoid double-drawing
        if (r.person_id < r.related_person_id) {
          edges.push({ type: "spouse", from: r.person_id, to: r.related_person_id });
        }
      }
    }

    const height = generations.length * (NODE_H + VERTICAL_GAP) + 80;

    return {
      nodes: people.map((p) => ({ person: p, ...(coords.get(p.id) || { x: 0, y: 0 }) })),
      edges: edges
        .map((e) => ({
          ...e,
          from: coords.get(e.from),
          to: coords.get(e.to),
        }))
        .filter((e) => e.from && e.to) as Array<{
        type: "parent" | "spouse";
        from: { x: number; y: number };
        to: { x: number; y: number };
      }>,
      width: canvasWidth,
      height,
    };
  }, [people, relationships]);

  if (people.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="handwritten text-sepia" style={{ fontSize: "1.6rem" }}>
          No one's on the tree yet.
        </p>
        <p className="text-sepia/70 text-sm mt-2">
          Add family members in your Supabase dashboard → people table.
        </p>
      </div>
    );
  }

  return (
    <>
      <TransformWrapper
        initialScale={1}
        minScale={0.4}
        maxScale={2.5}
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "75vh" }}
          contentStyle={{ width: layout.width, height: layout.height }}
        >
          <div
            className="relative"
            style={{ width: layout.width, height: layout.height }}
          >
            {/* Connector lines */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={layout.width}
              height={layout.height}
            >
              {layout.edges.map((e, i) => {
                if (e.type === "spouse") {
                  // Horizontal line between two nodes in the same row
                  const y = e.from.y + NODE_H / 2;
                  return (
                    <line
                      key={`s-${i}`}
                      x1={e.from.x + NODE_W}
                      y1={y}
                      x2={e.to.x}
                      y2={y}
                      stroke="#8b6f47"
                      strokeWidth={2}
                    />
                  );
                }
                // Parent -> child: L-shape
                const x1 = e.from.x + NODE_W / 2;
                const y1 = e.from.y + NODE_H;
                const x2 = e.to.x + NODE_W / 2;
                const y2 = e.to.y;
                const midY = (y1 + y2) / 2;
                return (
                  <polyline
                    key={`p-${i}`}
                    points={`${x1},${y1} ${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                    fill="none"
                    stroke="#8b6f47"
                    strokeWidth={1.5}
                    opacity={0.7}
                  />
                );
              })}
            </svg>

            {/* Person nodes */}
            {layout.nodes.map(({ person, x, y }) => (
              <button
                key={person.id}
                onClick={() => setSelected(person)}
                className="tree-node absolute"
                style={{
                  left: x,
                  top: y,
                  width: NODE_W,
                  height: NODE_H,
                }}
              >
                <div className="font-serif text-sm font-semibold text-ink truncate">
                  {person.first_name} {person.last_name}
                </div>
                {person.nickname && (
                  <div className="handwritten text-sepia" style={{ fontSize: "1rem" }}>
                    "{person.nickname}"
                  </div>
                )}
                <div className="text-xs text-sepia/80 mt-1">
                  {formatDates(person.birth_date, person.death_date)}
                </div>
              </button>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {selected && (
        <PersonModal person={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function formatDates(birth: string | null, death: string | null): string {
  const b = birth ? new Date(birth).getFullYear() : "?";
  if (!death) return birth ? `b. ${b}` : "";
  const d = new Date(death).getFullYear();
  return `${b} – ${d}`;
}

function PersonModal({ person, onClose }: { person: Person; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="polaroid max-w-md w-full"
        style={{ transform: "rotate(0deg)", padding: "20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl text-ink">
          {person.first_name} {person.last_name}
        </h2>
        {person.nickname && (
          <p className="handwritten text-sepia" style={{ fontSize: "1.3rem" }}>
            "{person.nickname}"
          </p>
        )}
        {person.maiden_name && (
          <p className="text-sm text-sepia">née {person.maiden_name}</p>
        )}
        <p className="text-sepia mt-2">
          {formatDates(person.birth_date, person.death_date)}
        </p>
        {person.bio && <p className="mt-3 text-ink/90 leading-relaxed">{person.bio}</p>}
        <a
          href={`/album?person=${person.id}`}
          className="inline-block mt-4 text-sepia underline hover:text-ink"
        >
          See their photos →
        </a>
        <button
          onClick={onClose}
          className="block mt-4 text-sm text-sepia/70 hover:text-sepia mx-auto"
        >
          close
        </button>
      </div>
    </div>
  );
}
