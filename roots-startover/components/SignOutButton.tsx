"use client";

export function SignOutButton() {
  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  }

  return <button onClick={signOut} className="hand text-2xl text-sepia hover:text-bark">sign out</button>;
}
