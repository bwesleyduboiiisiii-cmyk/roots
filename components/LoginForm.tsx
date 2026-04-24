"use client";

import { useState } from "react";

export function LoginForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (!res.ok || !json.ok) {
      setError(json.error ?? "Could not enter the family site.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-[1.6rem] border border-[#9f7b4f]/60 bg-[#f4ede0] px-10 py-4 font-display text-2xl font-bold uppercase tracking-[.12em] text-[#3d2e1f] shadow-[0_12px_35px_rgba(0,0,0,.35),inset_0_0_0_2px_rgba(255,255,255,.35)] transition hover:-translate-y-1 hover:scale-[1.02]"
      >
        Enter Our Family
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-cream p-8 text-left text-ink shadow-2xl">
            <h2 className="font-display text-3xl text-bark">Enter family</h2>
            <p className="hand mt-1 text-2xl text-sepia">Type the shared family password.</p>
            <label className="mt-6 block text-sm font-black uppercase tracking-[.2em] text-sepia">Family password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="mt-2 w-full rounded-2xl border border-soilTop/30 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-grass/20"
            />
            {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 font-bold text-sepia">Cancel</button>
              <button disabled={loading} className="rounded-full bg-bark px-6 py-3 font-black text-cream disabled:opacity-60">
                {loading ? "Opening..." : "Come inside"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
