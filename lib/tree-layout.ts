import { Person, Relationship } from "./types";

/**
 * Position calculation for the layered tree page.
 *
 * Convention:
 *  - x, y are normalized 0–1 coordinates within the background image area
 *  - generation 0 (Me) sits at the trunk position (centered, just above ground)
 *  - generation -1, -2, ... (ancestors) descend into the roots below
 *  - generation 1, 2, ... (descendants) ascend into the branches above
 */

export type PositionedPerson = {
  person: Person;
  x: number; // 0..1
  y: number; // 0..1
};

const TRUNK_X = 0.5;
const GROUND_Y = 0.5; // horizon line in the image

// Vertical spacing per generation (as fraction of canvas height)
const GEN_SPACING = 0.13;

// Horizontal spacing per sibling (as fraction of canvas width)
const SIBLING_SPACING = 0.18;

export function layoutPeople(people: Person[]): PositionedPerson[] {
  if (people.length === 0) return [];

  // Group by generation
  const byGen = new Map<number, Person[]>();
  for (const p of people) {
    const list = byGen.get(p.generation) ?? [];
    list.push(p);
    byGen.set(p.generation, list);
  }
  // Sort each generation by sort_order
  byGen.forEach((list) => list.sort((a, b) => a.sort_order - b.sort_order));

  const positioned: PositionedPerson[] = [];

  byGen.forEach((row, gen) => {
    // y position: generation 0 sits at GROUND_Y, ancestors below, descendants above
    // Lower generation number = older = closer to roots = higher y value (down)
    // Higher generation number = younger = closer to branches = lower y value (up)
    const y = GROUND_Y - gen * GEN_SPACING;

    const rowWidth = (row.length - 1) * SIBLING_SPACING;
    const startX = TRUNK_X - rowWidth / 2;

    row.forEach((person, i) => {
      positioned.push({
        person,
        x: startX + i * SIBLING_SPACING,
        y,
      });
    });
  });

  return positioned;
}

/**
 * Get the connection line between two people, in normalized coords.
 */
export function getConnectionPath(
  fromPos: PositionedPerson,
  toPos: PositionedPerson,
  type: "parent" | "spouse"
): string {
  const fx = fromPos.x;
  const fy = fromPos.y;
  const tx = toPos.x;
  const ty = toPos.y;

  if (type === "spouse") {
    // Straight horizontal line
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }

  // Parent -> child: gentle curved L-shape
  const midY = (fy + ty) / 2;
  return `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
}

/**
 * Filter relationships down to renderable connections, deduplicated.
 */
export function getRenderableConnections(
  relationships: Relationship[]
): Array<{ fromId: string; toId: string; type: "parent" | "spouse" }> {
  const result: Array<{ fromId: string; toId: string; type: "parent" | "spouse" }> = [];
  const seenSpouse = new Set<string>();

  for (const r of relationships) {
    if (r.relationship_type === "parent") {
      result.push({ fromId: r.person_id, toId: r.related_person_id, type: "parent" });
    } else if (r.relationship_type === "spouse") {
      const key = [r.person_id, r.related_person_id].sort().join("-");
      if (!seenSpouse.has(key)) {
        seenSpouse.add(key);
        result.push({ fromId: r.person_id, toId: r.related_person_id, type: "spouse" });
      }
    }
  }
  return result;
}
