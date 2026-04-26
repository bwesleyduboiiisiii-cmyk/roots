"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Person, Relationship } from "@/lib/types";
import {
  layoutPeople,
  getConnectionPath,
  getRenderableConnections,
  PositionedPerson,
} from "@/lib/tree-layout";
import treeBackground from "../public/tree-background.png";

type Props = {
  people: Person[];
  relationships: Relationship[];
  familySlug: string;
  familyId: string;
};

export default function FamilyTreeCanvas({
  people,
  relationships,
  familySlug,
  familyId,
}: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan and zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // UI state
  const [selected, setSelected] = useState<Person | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [search, setSearch] = useState("");

  // Layout calculation
  const positioned = useMemo(() => layoutPeople(people), [people]);
  const connections = useMemo(
    () => getRenderableConnections(relationships),
    [relationships]
  );
  const positionMap = useMemo(() => {
    const m = new Map<string, PositionedPerson>();
    positioned.forEach((p) => m.set(p.person.id, p));
    return m;
  }, [positioned]);

  // Filtered people for search
  const searchMatches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return people.filter((p) => {
      const full = `${p.first_name} ${p.last_name ?? ""} ${p.nickname ?? ""}`.toLowerCase();
      return full.includes(q);
    });
  }, [people, search]);

  // Pan handlers
  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-interactive]")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }
  function handleMouseUp() {
    setIsDragging(false);
  }

  // Touch handlers (basic)
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y };
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    setPan({
      x: dragStart.current.panX + (t.clientX - dragStart.current.x),
      y: dragStart.current.panY + (t.clientY - dragStart.current.y),
    });
  }
  function handleTouchEnd() {
    setIsDragging(false);
  }

  // Wheel zoom
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(2.5, Math.max(0.4, s + delta)));
  }

  // Focus on Me - reset pan/zoom to center
  function focusOnMe() {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }

  // Focus on a specific person (used by search)
  function focusOnPerson(personId: string) {
    const p = positionMap.get(personId);
    if (!p || !containerRef.current) return;
    setScale(1.3);
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    // Position person at center of screen
    setPan({
      x: w / 2 - p.x * w * 1.3,
      y: h / 2 - p.y * h * 1.3,
    });
    setSearch("");
    setSelected(people.find((pp) => pp.id === personId) || null);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        height: "calc(100vh - 80px)",
        background:
          "radial-gradient(ellipse at center, #1a0f08 0%, #0a0604 100%)",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* The pannable/zoomable canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <div
          className="relative"
          style={{
            height: "100%",
            aspectRatio: "1024 / 1536",
            maxHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Layer 1: Background image */}
          <Image
            src={treeBackground}
            alt="Family tree background"
            fill
            priority
            placeholder="blur"
            className="object-contain pointer-events-none"
            sizes="100vh"
          />

          {/* Ground line indicator (subtle horizon) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "5%",
              right: "5%",
              top: "50%",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(217, 183, 105, 0.25), transparent)",
            }}
          />

          {/* Layer 2: SVG connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            {connections.map((c, i) => {
              const from = positionMap.get(c.fromId);
              const to = positionMap.get(c.toId);
              if (!from || !to) return null;
              return (
                <path
                  key={i}
                  d={getConnectionPath(from, to, c.type)}
                  fill="none"
                  stroke={c.type === "spouse" ? "#d9b769" : "#8b6f47"}
                  strokeWidth={c.type === "spouse" ? 0.003 : 0.0025}
                  strokeOpacity={0.7}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Layer 3: Person nodes */}
          {positioned.map(({ person, x, y }) => {
            const isMe = person.generation === 0 && person.sort_order === 0;
            return (
              <button
                key={person.id}
                data-interactive
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(person);
                }}
                className="absolute group"
                style={{
                  left: `${x * 100}%`,
                  top: `${y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-cream font-serif transition-all group-hover:scale-110"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: isMe
                      ? "linear-gradient(135deg, #d9b769 0%, #8b6f47 100%)"
                      : "linear-gradient(135deg, #5c3d28 0%, #3d2816 100%)",
                    border: isMe ? "3px solid #f4e4a8" : "2px solid #8b6f47",
                    boxShadow: isMe
                      ? "0 4px 16px rgba(217, 183, 105, 0.5), 0 0 24px rgba(217, 183, 105, 0.3)"
                      : "0 4px 12px rgba(0,0,0,0.5)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: isMe ? "#2b2b2b" : "#fdfcf7",
                  }}
                >
                  {person.first_name[0]}
                  {person.last_name?.[0] ?? ""}
                </div>
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-1 text-center whitespace-nowrap pointer-events-none"
                  style={{
                    top: "100%",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.75rem",
                    color: "#f4e4a8",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                    fontWeight: 500,
                  }}
                >
                  {person.first_name}
                </div>
              </button>
            );
          })}

          {/* Empty state when no people */}
          {positioned.length === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: "1.5rem",
                    color: "#d9b769",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}
                >
                  Your tree awaits
                </p>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "1.3rem",
                    color: "#a8895a",
                    textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  Tap the + below to plant the first person
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layer 4: Floating UI controls */}

      {/* Top: Search */}
      <div
        data-interactive
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
        style={{ width: "min(360px, 80vw)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search family members..."
          className="w-full px-4 py-2 rounded-full text-sm"
          style={{
            background: "rgba(45, 30, 20, 0.85)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(217, 183, 105, 0.4)",
            color: "#f4e4a8",
            fontFamily: "'Playfair Display', serif",
          }}
        />
        {searchMatches.length > 0 && (
          <div
            className="mt-1 rounded-lg overflow-hidden"
            style={{
              background: "rgba(45, 30, 20, 0.95)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(217, 183, 105, 0.3)",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {searchMatches.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => focusOnPerson(p.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-amber-900/40 transition-colors"
                style={{
                  color: "#f4e4a8",
                  fontFamily: "'Playfair Display', serif",
                  borderBottom: "1px solid rgba(217, 183, 105, 0.1)",
                }}
              >
                {p.first_name} {p.last_name}
                {p.birth_date && (
                  <span className="text-xs opacity-60 ml-2">
                    b. {new Date(p.birth_date).getFullYear()}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side: zoom controls */}
      <div
        data-interactive
        className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ControlButton onClick={() => setScale((s) => Math.min(2.5, s + 0.2))} aria="Zoom in">
          +
        </ControlButton>
        <ControlButton onClick={() => setScale((s) => Math.max(0.4, s - 0.2))} aria="Zoom out">
          −
        </ControlButton>
        <ControlButton onClick={focusOnMe} aria="Focus on me" small>
          ⌂
        </ControlButton>
      </div>

      {/* Bottom right: Add Person (the prominent action) */}
      <div
        data-interactive
        className="absolute bottom-6 right-6 z-20"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowAddPerson(true)}
          className="rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
          style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #d9b769 0%, #8b6f47 100%)",
            border: "2px solid #f4e4a8",
            color: "#2b2b2b",
            fontSize: "2rem",
            fontWeight: 300,
            boxShadow: "0 6px 20px rgba(217, 183, 105, 0.5)",
          }}
        >
          +
        </button>
        <p
          className="text-center mt-1"
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "0.9rem",
            color: "#d9b769",
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          add person
        </p>
      </div>

      {/* Bottom left: Generation legend */}
      <div
        className="absolute bottom-6 left-6 z-20 pointer-events-none"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "1rem",
          color: "rgba(217, 183, 105, 0.7)",
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        ↑ branches: descendants<br />
        ↓ roots: ancestors
      </div>

      {/* Person detail modal */}
      {selected && (
        <PersonModal
          person={selected}
          onClose={() => setSelected(null)}
          familySlug={familySlug}
        />
      )}

      {/* Add Person modal */}
      {showAddPerson && (
        <AddPersonModal
          familyId={familyId}
          onClose={() => setShowAddPerson(false)}
          onAdded={() => {
            setShowAddPerson(false);
            router.refresh();
          }}
          existingPeople={people}
        />
      )}
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  aria,
  small,
}: {
  children: React.ReactNode;
  onClick: () => void;
  aria: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{
        width: "44px",
        height: "44px",
        background: "rgba(45, 30, 20, 0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(217, 183, 105, 0.4)",
        color: "#f4e4a8",
        fontSize: small ? "1.2rem" : "1.5rem",
        fontFamily: "'Playfair Display', serif",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function PersonModal({
  person,
  onClose,
  familySlug,
}: {
  person: Person;
  onClose: () => void;
  familySlug: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(to bottom, #fdfcf7, #f4ede0)",
          border: "1px solid rgba(139, 111, 71, 0.3)",
        }}
      >
        <h2 className="font-serif text-2xl text-ink">
          {person.first_name} {person.last_name}
        </h2>
        {person.nickname && (
          <p className="handwritten text-sepia mt-1" style={{ fontSize: "1.2rem" }}>
            "{person.nickname}"
          </p>
        )}
        {person.maiden_name && (
          <p className="text-sm text-sepia">née {person.maiden_name}</p>
        )}
        <p className="text-sepia mt-2">
          {formatDates(person.birth_date, person.death_date)}
        </p>
        {person.bio && (
          <p className="mt-3 text-ink/90 leading-relaxed">{person.bio}</p>
        )}
        <a
          href={`/${familySlug}/album?person=${person.id}`}
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

function AddPersonModal({
  familyId,
  onClose,
  onAdded,
  existingPeople,
}: {
  familyId: string;
  onClose: () => void;
  onAdded: () => void;
  existingPeople: Person[];
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [generation, setGeneration] = useState("0");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();

      const gen = parseInt(generation, 10);
      const sameGenCount = existingPeople.filter((p) => p.generation === gen).length;

      const { error: insertError } = await supabase.from("people").insert({
        family_id: familyId,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        nickname: nickname.trim() || null,
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        generation: gen,
        sort_order: sameGenCount,
        bio: bio.trim() || null,
      });

      if (insertError) throw insertError;

      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not add person");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(to bottom, #fdfcf7, #f4ede0)",
          border: "1px solid rgba(139, 111, 71, 0.3)",
        }}
      >
        <h2 className="font-serif text-2xl text-ink mb-1">Add to the tree</h2>
        <p className="handwritten text-sepia mb-4" style={{ fontSize: "1.1rem" }}>
          plant a new branch
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name *"
              required
              autoFocus
              className="px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink"
            />
          </div>

          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder='Nickname (e.g. "Buddy")'
            className="w-full px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Birth year"
              min="1700"
              max="2100"
              className="px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink"
            />
            <select
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              className="px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink"
            >
              <option value="3">Great-grandchild (↑↑↑)</option>
              <option value="2">Grandchild (↑↑)</option>
              <option value="1">Child (↑)</option>
              <option value="0">Me / sibling (—)</option>
              <option value="-1">Parent (↓)</option>
              <option value="-2">Grandparent (↓↓)</option>
              <option value="-3">Great-grandparent (↓↓↓)</option>
              <option value="-4">Great-great-grandparent (↓↓↓↓)</option>
            </select>
          </div>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short story or memory (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink resize-none"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 border border-sepia/40 text-sepia rounded hover:bg-sepia/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !firstName.trim()}
              className="flex-1 py-2 bg-sepia text-white rounded hover:bg-ink disabled:opacity-50 font-serif tracking-wider"
            >
              {loading ? "Planting..." : "PLANT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDates(birth: string | null, death: string | null): string {
  const b = birth ? new Date(birth).getFullYear() : "?";
  if (!death) return birth ? `b. ${b}` : "";
  const d = new Date(death).getFullYear();
  return `${b} – ${d}`;
}
