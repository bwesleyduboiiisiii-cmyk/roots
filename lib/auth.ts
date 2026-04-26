import { createHmac, timingSafeEqual } from "crypto";
import { AuthSession } from "./types";

const COOKIE_NAME = "roots_session";

function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Encode a session as a signed cookie value: base64(json).signature
 */
export function encodeSession(session: AuthSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

/**
 * Decode and verify a signed cookie value. Returns null if invalid/tampered.
 */
export function decodeSession(cookieValue: string | undefined): AuthSession | null {
  if (!cookieValue) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;

  try {
    const expected = sign(payload);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json) as AuthSession;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

/**
 * Slug helper — convert "The DuBois Family" -> "the-dubois-family"
 * Lowercase, alphanumeric + hyphens only, max 40 chars.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
