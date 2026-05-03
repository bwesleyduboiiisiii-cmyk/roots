"use client";

import { useState, useRef, useMemo } from "react";
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

// The canvas is 2x the viewport height — gives room to scroll up into "branches" (sky)
// and down into "deeper roots" (soil) even though the image stays the same.
const CANVAS_VH = 200; // 200vh tall

export default function FamilyTreeCanvas({
  people,
  relationships,
  familySlug,
  familyId,
}: Props) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pan and zoom state (horizontal pan only — vertical handled by browser scroll)
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, panX: 0 });

  // Person interactions
  const [selected, setSelected] = useState<Person | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [search, setSearch] = useState("");

  // Relationship-builder mode
  const [connectMode, setConnectMode] = useState<{
    fromId: string;
    fromName: string;
  } | null>(null);

  // Layout
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

  const searchMatches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return people.filter((p) => {
      const full = `${p.first_name} ${p.last_name ?? ""} ${p.nickname ?? ""}`.toLowerCase();
      return full.includes(q);
    });
  }, [people, search]);

  // Horizontal pan
  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-interactive]")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, panX };
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPanX(dragStart.current.panX + (e.clientX - dragStart.current.x));
  }
  function handleMouseUp() {
    setIsDragging(false);
  }
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    if ((e.target as HTMLElement).closest("[data-interactive]")) return;
    const t = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: t.clientX, panX };
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    setPanX(dragStart.current.panX + (t.clientX - dragStart.current.x));
  }
  function handleTouchEnd() {
    setIsDragging(false);
  }

  function handleWheel(e: React.WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+wheel = zoom (don't preventDefault so cmd+zoom still works on browser)
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(2.5, Math.max(0.4, s + delta)));
    }
    // Otherwise: native vertical scroll handles it
  }

  function focusOnMe() {
    setScale(1);
    setPanX(0);
    if (scrollContainerRef.current) {
      // Scroll to roughly the middle (where Me sits)
      const el = scrollContainerRef.current;
      el.scrollTo({
        top: (el.scrollHeight - el.clientHeight) / 2,
        behavior: "smooth",
      });
    }
  }

  function focusOnPerson(personId: string) {
    const p = positionMap.get(personId);
    if (!p || !scrollContainerRef.current) return;
    setScale(1.1);
    setPanX(0);
    const el = scrollContainerRef.current;
    // Person's y is 0..1 within canvas — scroll to position them in the middle of viewport
    const targetTop = p.y * el.scrollHeight - el.clientHeight / 2;
    el.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    setSearch("");
    setSelected(people.find((pp) => pp.id === personId) || null);
  }

  function handlePersonClick(person: Person) {
    if (connectMode) {
      // We're in connection-building mode — second click sets up the relationship
      if (connectMode.fromId === person.id) {
        // clicked same person, cancel
        setConnectMode(null);
        return;
      }
      // Open the relationship-type chooser
      setSelected(null);
      setRelationshipChooser({
        fromId: connectMode.fromId,
        fromName: connectMode.fromName,
        toId: person.id,
        toName: `${person.first_name} ${person.last_name ?? ""}`.trim(),
      });
      setConnectMode(null);
      return;
    }
    setSelected(person);
  }

  // Relationship chooser modal state
  const [relationshipChooser, setRelationshipChooser] = useState<{
    fromId: string;
    fromName: string;
    toId: string;
    toName: string;
  } | null>(null);

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* FIXED BACKGROUND LAYER — stays put while content scrolls over it */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a0f08 0%, #0a0604 100%)",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            height: "100%",
            aspectRatio: "1672 / 941",
            maxWidth: "100vw",
          }}
        >
          <Image
            src={treeBackground}
            alt="Family tree background"
            fill
            priority
            placeholder="blur"
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Subtle horizon line — also fixed since it relates to the image */}
        <div
          className="absolute"
          style={{
            left: "10%",
            right: "10%",
            top: "50%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(217, 183, 105, 0.3), transparent)",
          }}
        />
      </div>

      {/* SCROLLABLE FOREGROUND LAYER — people + SVG connections scroll over the fixed background */}
      <div
        ref={scrollContainerRef}
        className="relative w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          cursor: isDragging ? "grabbing" : connectMode ? "crosshair" : "grab",
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
        {/* Tall canvas - 2x viewport height. Only people + connections live here. */}
        <div
          className="relative w-full"
          style={{
            height: `${CANVAS_VH}vh`,
            transform: `translateX(${panX}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >

          {/* SVG connections — covers entire tall canvas */}
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
                  stroke={c.type === "spouse" ? "#d9b769" : "#a87f4a"}
                  strokeWidth={c.type === "spouse" ? 0.004 : 0.003}
                  strokeOpacity={0.85}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Person nodes positioned in normalized 0..1 space */}
          {positioned.map(({ person, x, y }) => {
            const isMe = person.generation === 0 && person.sort_order === 0;
            const isConnectSource = connectMode?.fromId === person.id;
            return (
              <button
                key={person.id}
                data-interactive
                onClick={(e) => {
                  e.stopPropagation();
                  handlePersonClick(person);
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
                  className="rounded-full flex items-center justify-center font-serif transition-all group-hover:scale-110 overflow-hidden"
                  style={{
                    width: "56px",
                    height: "56px",
                    background: person.profile_photo_url
                      ? "#3d2816"
                      : isMe
                      ? "linear-gradient(135deg, #d9b769 0%, #8b6f47 100%)"
                      : "linear-gradient(135deg, #5c3d28 0%, #3d2816 100%)",
                    border: isConnectSource
                      ? "3px solid #f4e4a8"
                      : isMe
                      ? "3px solid #f4e4a8"
                      : "2px solid #8b6f47",
                    boxShadow: isConnectSource
                      ? "0 0 0 4px rgba(244, 228, 168, 0.5), 0 0 24px rgba(217, 183, 105, 0.6)"
                      : isMe
                      ? "0 4px 16px rgba(217, 183, 105, 0.5), 0 0 24px rgba(217, 183, 105, 0.3)"
                      : "0 4px 12px rgba(0,0,0,0.5)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: isMe ? "#2b2b2b" : "#fdfcf7",
                  }}
                >
                  {person.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.profile_photo_url}
                      alt={person.first_name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <>
                      {person.first_name[0]}
                      {person.last_name?.[0] ?? ""}
                    </>
                  )}
                </div>
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-1 text-center whitespace-nowrap pointer-events-none"
                  style={{
                    top: "100%",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.75rem",
                    color: "#f4e4a8",
                    textShadow: "0 1px 4px rgba(0,0,0,0.95)",
                    fontWeight: 500,
                  }}
                >
                  {person.first_name}
                </div>
              </button>
            );
          })}

          {/* Empty state */}
          {positioned.length === 0 && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center"
            >
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
          )}
        </div>
      </div>

      {/* Floating UI - all OUTSIDE the scroll container, so they stay fixed */}

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
            background: "rgba(45, 30, 20, 0.9)",
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
              background: "rgba(45, 30, 20, 0.96)",
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

      {/* Connect-mode indicator */}
      {connectMode && (
        <div
          data-interactive
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full"
          style={{
            background: "rgba(217, 183, 105, 0.95)",
            color: "#2b2b2b",
            fontFamily: "'Playfair Display', serif",
            fontSize: "0.85rem",
            border: "1px solid rgba(244, 228, 168, 1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          Connect <strong>{connectMode.fromName}</strong> to who?
          <button
            onClick={() => setConnectMode(null)}
            className="ml-3 underline"
            style={{ color: "#5c3d28", fontStyle: "italic" }}
          >
            cancel
          </button>
        </div>
      )}

      {/* Right side: zoom + focus */}
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

      {/* Bottom right: Add Person */}
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

      {/* Bottom left legend */}
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

      {/* Modals */}
      {selected && !connectMode && (
        <PersonModal
          person={selected}
          familyId={familyId}
          familySlug={familySlug}
          allPeople={people}
          onClose={() => setSelected(null)}
          onStartConnect={(p) => {
            setSelected(null);
            setConnectMode({
              fromId: p.id,
              fromName: `${p.first_name} ${p.last_name ?? ""}`.trim(),
            });
          }}
          onChange={() => router.refresh()}
        />
      )}

      {showAddPerson && (
        <AddPersonModal
          familyId={familyId}
          existingPeople={people}
          onClose={() => setShowAddPerson(false)}
          onAdded={() => {
            setShowAddPerson(false);
            router.refresh();
          }}
        />
      )}

      {relationshipChooser && (
        <RelationshipChooserModal
          familyId={familyId}
          fromId={relationshipChooser.fromId}
          fromName={relationshipChooser.fromName}
          toId={relationshipChooser.toId}
          toName={relationshipChooser.toName}
          onClose={() => setRelationshipChooser(null)}
          onSaved={() => {
            setRelationshipChooser(null);
            router.refresh();
          }}
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
        background: "rgba(45, 30, 20, 0.9)",
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

// ===== PersonModal — shows person details + actions =====
function PersonModal({
  person,
  familyId,
  familySlug,
  allPeople,
  onClose,
  onStartConnect,
  onChange,
}: {
  person: Person;
  familyId: string;
  familySlug: string;
  allPeople: Person[];
  onClose: () => void;
  onStartConnect: (p: Person) => void;
  onChange: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setPhotoError("");

    try {
      const { uploadPersonPhoto } = await import("@/lib/upload-photo");
      const result = await uploadPersonPhoto(file, familyId);

      if (!result.ok) {
        setPhotoError(result.error);
        setPhotoUploading(false);
        return;
      }

      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();
      const { error } = await supabase
        .from("people")
        .update({ profile_photo_url: result.url })
        .eq("id", person.id);

      if (error) {
        setPhotoError(error.message);
        setPhotoUploading(false);
        return;
      }

      onChange();
      onClose();
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
      setPhotoUploading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { createClient } = await import("@/lib/supabase-browser");
    const supabase = createClient();
    await supabase.from("relationships").delete().or(
      `person_id.eq.${person.id},related_person_id.eq.${person.id}`
    );
    await supabase.from("people").delete().eq("id", person.id);
    onClose();
    onChange();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(to bottom, #fdfcf7, #f4ede0)",
          border: "1px solid rgba(139, 111, 71, 0.3)",
        }}
      >
        {/* Photo at top */}
        <div className="flex justify-center mb-4">
          <div
            className="relative rounded-full overflow-hidden"
            style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #5c3d28, #3d2816)",
              border: "3px solid #8b6f47",
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            }}
          >
            {person.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.profile_photo_url}
                alt={person.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cream font-serif text-3xl">
                {person.first_name[0]}
                {person.last_name?.[0] ?? ""}
              </div>
            )}
          </div>
        </div>

        {/* Change photo button */}
        <div className="text-center mb-4">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={photoUploading}
            className="text-xs text-sepia hover:text-ink underline disabled:opacity-50"
          >
            {photoUploading
              ? "Uploading..."
              : person.profile_photo_url
              ? "change photo"
              : "+ add photo"}
          </button>
          {photoError && <p className="text-red-600 text-xs mt-1">{photoError}</p>}
        </div>

        <h2 className="font-serif text-2xl text-ink text-center">
          {person.first_name} {person.last_name}
        </h2>
        {person.nickname && (
          <p className="handwritten text-sepia mt-1 text-center" style={{ fontSize: "1.2rem" }}>
            "{person.nickname}"
          </p>
        )}
        {person.maiden_name && (
          <p className="text-sm text-sepia text-center">née {person.maiden_name}</p>
        )}
        <p className="text-sepia mt-2 text-center">
          {formatDates(person.birth_date, person.death_date)}
        </p>
        {person.bio && <p className="mt-3 text-ink/90 leading-relaxed">{person.bio}</p>}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onStartConnect(person)}
            className="py-2 bg-sepia text-white rounded font-serif text-sm tracking-wide hover:bg-ink"
          >
            Connect to...
          </button>
          <a
            href={`/${familySlug}/album?person=${person.id}`}
            className="py-2 border border-sepia/40 text-sepia rounded text-sm text-center hover:bg-sepia/10 flex items-center justify-center"
          >
            See photos
          </a>
        </div>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-3 text-xs text-red-700/70 hover:text-red-700 underline block mx-auto"
          >
            Remove from tree
          </button>
        ) : (
          <div className="mt-3 text-center">
            <p className="text-xs text-red-800 mb-2">Remove permanently? Their connections will also be deleted.</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-3 py-1 border border-sepia/40 rounded text-sepia"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs px-3 py-1 bg-red-700 text-white rounded disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Yes, remove"}
              </button>
            </div>
          </div>
        )}

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

// ===== AddPersonModal — adds person + optional immediate relationship =====
function AddPersonModal({
  familyId,
  existingPeople,
  onClose,
  onAdded,
}: {
  familyId: string;
  existingPeople: Person[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [generation, setGeneration] = useState("0");
  const [bio, setBio] = useState("");
  const [autoSibling, setAutoSibling] = useState(false);

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Optional relationship
  const [relPersonId, setRelPersonId] = useState("");
  const [relType, setRelType] = useState<"" | "child-of" | "parent-of" | "spouse-of">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setError("Photo must be under 8MB");
      return;
    }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    setError("");
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();

      // Step 1: upload photo if one was picked
      let photoUrl: string | null = null;
      if (photoFile) {
        const { uploadPersonPhoto } = await import("@/lib/upload-photo");
        const result = await uploadPersonPhoto(photoFile, familyId);
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        photoUrl = result.url;
      }

      const gen = parseInt(generation, 10);
      const sameGenCount = existingPeople.filter((p) => p.generation === gen).length;

      const { data: newPerson, error: insertError } = await supabase
        .from("people")
        .insert({
          family_id: familyId,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          nickname: nickname.trim() || null,
          birth_date: birthYear ? `${birthYear}-01-01` : null,
          generation: gen,
          sort_order: sameGenCount,
          bio: bio.trim() || null,
          profile_photo_url: photoUrl,
        })
        .select("id")
        .single();

      if (insertError || !newPerson) throw insertError ?? new Error("Insert failed");

      const newId = newPerson.id;
      const relationshipsToInsert: Array<{
        family_id: string;
        person_id: string;
        related_person_id: string;
        relationship_type: "parent" | "spouse" | "sibling";
      }> = [];

      // Explicit relationship picked in form
      if (relType && relPersonId) {
        if (relType === "child-of") {
          relationshipsToInsert.push({
            family_id: familyId,
            person_id: relPersonId,
            related_person_id: newId,
            relationship_type: "parent",
          });
        } else if (relType === "parent-of") {
          relationshipsToInsert.push({
            family_id: familyId,
            person_id: newId,
            related_person_id: relPersonId,
            relationship_type: "parent",
          });
        } else if (relType === "spouse-of") {
          relationshipsToInsert.push({
            family_id: familyId,
            person_id: newId,
            related_person_id: relPersonId,
            relationship_type: "spouse",
          });
          relationshipsToInsert.push({
            family_id: familyId,
            person_id: relPersonId,
            related_person_id: newId,
            relationship_type: "spouse",
          });
        }
      }

      // Auto-connect siblings (opt-in)
      if (autoSibling) {
        const sameGen = existingPeople.filter((p) => p.generation === gen);
        for (const s of sameGen) {
          relationshipsToInsert.push({
            family_id: familyId,
            person_id: newId,
            related_person_id: s.id,
            relationship_type: "sibling",
          });
        }
      }

      if (relationshipsToInsert.length > 0) {
        await supabase.from("relationships").insert(relationshipsToInsert);
      }

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
        className="max-w-md w-full rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
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
          {/* Photo upload at top */}
          <div className="flex items-center gap-3 pb-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="rounded-full overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
              style={{
                width: "72px",
                height: "72px",
                background: photoPreview
                  ? "transparent"
                  : "linear-gradient(135deg, #f4ede0, #e8dcc4)",
                border: "2px dashed rgba(139, 111, 71, 0.4)",
              }}
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-sepia/60">+</span>
              )}
            </button>
            <div className="text-xs text-sepia">
              {photoPreview ? (
                <>
                  <p className="font-semibold text-ink">Photo selected</p>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="underline mt-1"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold text-ink">Add a photo (optional)</p>
                  <p className="opacity-70">JPG or PNG · up to 8MB</p>
                </>
              )}
            </div>
          </div>

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
            rows={2}
            className="w-full px-3 py-2 border border-sepia/30 rounded bg-white/80 text-ink resize-none"
          />

          {/* Optional relationship section */}
          {existingPeople.length > 0 && (
            <div className="border-t border-sepia/20 pt-3 space-y-2">
              <p className="text-xs text-sepia uppercase tracking-wide">Connect to existing person (optional)</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value as typeof relType)}
                  className="px-2 py-2 text-sm border border-sepia/30 rounded bg-white/80 text-ink"
                >
                  <option value="">No relationship</option>
                  <option value="child-of">is child of</option>
                  <option value="parent-of">is parent of</option>
                  <option value="spouse-of">is spouse of</option>
                </select>
                <select
                  value={relPersonId}
                  onChange={(e) => setRelPersonId(e.target.value)}
                  disabled={!relType}
                  className="px-2 py-2 text-sm border border-sepia/30 rounded bg-white/80 text-ink disabled:opacity-50"
                >
                  <option value="">— pick person —</option>
                  {existingPeople.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name ?? ""}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-sepia mt-2">
                <input
                  type="checkbox"
                  checked={autoSibling}
                  onChange={(e) => setAutoSibling(e.target.checked)}
                />
                Auto-connect as sibling to everyone in this generation
              </label>
            </div>
          )}

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

// ===== RelationshipChooserModal — appears when click-to-connect picks two people =====
function RelationshipChooserModal({
  familyId,
  fromId,
  fromName,
  toId,
  toName,
  onClose,
  onSaved,
}: {
  familyId: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(type: "parent" | "child" | "spouse" | "sibling") {
    setSaving(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();

      const inserts: Array<{
        family_id: string;
        person_id: string;
        related_person_id: string;
        relationship_type: "parent" | "spouse" | "sibling";
      }> = [];

      if (type === "parent") {
        // fromId is parent of toId
        inserts.push({
          family_id: familyId,
          person_id: fromId,
          related_person_id: toId,
          relationship_type: "parent",
        });
      } else if (type === "child") {
        // fromId is child of toId → toId is parent of fromId
        inserts.push({
          family_id: familyId,
          person_id: toId,
          related_person_id: fromId,
          relationship_type: "parent",
        });
      } else if (type === "spouse") {
        inserts.push(
          {
            family_id: familyId,
            person_id: fromId,
            related_person_id: toId,
            relationship_type: "spouse",
          },
          {
            family_id: familyId,
            person_id: toId,
            related_person_id: fromId,
            relationship_type: "spouse",
          }
        );
      } else if (type === "sibling") {
        inserts.push(
          {
            family_id: familyId,
            person_id: fromId,
            related_person_id: toId,
            relationship_type: "sibling",
          },
          {
            family_id: familyId,
            person_id: toId,
            related_person_id: fromId,
            relationship_type: "sibling",
          }
        );
      }

      const { error: insertError } = await supabase.from("relationships").insert(inserts);
      if (insertError) throw insertError;
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
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
        className="max-w-sm w-full rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(to bottom, #fdfcf7, #f4ede0)",
          border: "1px solid rgba(139, 111, 71, 0.3)",
        }}
      >
        <h2 className="font-serif text-xl text-ink text-center">Define relationship</h2>
        <p className="text-center text-sepia mt-1 mb-5">
          <strong>{fromName}</strong> is the <em>__</em> of <strong>{toName}</strong>
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => save("parent")}
            disabled={saving}
            className="py-3 bg-sepia text-white rounded font-serif tracking-wide hover:bg-ink disabled:opacity-50"
          >
            Parent
          </button>
          <button
            onClick={() => save("child")}
            disabled={saving}
            className="py-3 bg-sepia text-white rounded font-serif tracking-wide hover:bg-ink disabled:opacity-50"
          >
            Child
          </button>
          <button
            onClick={() => save("spouse")}
            disabled={saving}
            className="py-3 bg-sepia text-white rounded font-serif tracking-wide hover:bg-ink disabled:opacity-50"
          >
            Spouse
          </button>
          <button
            onClick={() => save("sibling")}
            disabled={saving}
            className="py-3 bg-sepia text-white rounded font-serif tracking-wide hover:bg-ink disabled:opacity-50"
          >
            Sibling
          </button>
        </div>

        {error && <p className="text-red-600 text-sm text-center mt-3">{error}</p>}

        <button
          onClick={onClose}
          className="block mt-4 text-sm text-sepia/70 hover:text-sepia mx-auto"
        >
          cancel
        </button>
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
