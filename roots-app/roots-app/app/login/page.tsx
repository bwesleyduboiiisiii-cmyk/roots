"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("That's not quite right. Try again?");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="polaroid max-w-sm w-full" style={{ transform: "rotate(-1deg)", padding: "24px 24px 32px" }}>
        <h1 className="font-serif text-5xl text-center mb-2 text-ink tracking-widest">ROOTS</h1>
        <p className="handwritten text-center mb-6" style={{ fontSize: "1.2rem" }}>
          welcome home
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Family password"
            autoFocus
            className="w-full px-4 py-3 border border-sepia/40 rounded bg-white/70 focus:outline-none focus:border-sepia"
          />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sepia text-white rounded hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "Opening..." : "Come on in"}
          </button>
        </form>
      </div>
    </main>
  );
}
