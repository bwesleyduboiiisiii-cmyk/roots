import { cookies } from "next/headers";
import { decodeSession, SESSION_COOKIE_NAME } from "./auth";
import { AuthSession } from "./types";

/**
 * Read the current session from cookies in a server component.
 * Returns null if not signed in.
 */
export function getSession(): AuthSession | null {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return decodeSession(value);
}

/**
 * Get the session and verify it matches the requested family slug.
 * Returns null if mismatched, otherwise returns the session.
 */
export function getSessionForSlug(slug: string): AuthSession | null {
  const session = getSession();
  if (!session) return null;
  if (session.family_slug !== slug) return null;
  return session;
}
