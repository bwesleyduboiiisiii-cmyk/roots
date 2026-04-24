"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import landingImage from "../public/landing.png";

export default function LandingPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<"enter" | "register">("enter");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/hub");
      router.refresh();
    } else {
      setError("That's not quite right. Try again?");
      setLoading(false);
    }
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-black">
      <div className="relative w-full min-h-screen">
        <Image
          src={landingImage}
          alt="ROOTS — where every family takes root"
          priority
          placeholder="blur"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Invisible click zone over the "ENTER OUR FAMILY" button in the image.
            The button in the source image sits roughly at 30%-70% horizontal, 66%-73% vertical. */}
        <button
          onClick={() => { setShowLogin(true); setMode("enter"); }}
          aria-label="Enter our family"
          className="absolute cursor-pointer hover:scale-105 transition-transform duration-200 rounded-xl"
          style={{
            left: "30%",
            top: "66%",
            width: "40%",
            height: "7%",
            background: "transparent",
            border: "none",
          }}
        />

        {/* Invisible click zone over the "FAMILY LOGIN" pill in the top-right */}
        <button
          onClick={() => { setShowLogin(true); setMode("enter"); }}
          aria-label="Family login"
          className="absolute cursor-pointer rounded-full"
          style={{
            right: "3%",
            top: "2.5%",
            width: "14%",
            height: "3.5%",
            background: "transparent",
            border: "none",
          }}
        />
      </div>

      {/* Login modal */}
      {showLogin && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogin(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full rounded-2xl shadow-2xl p-8"
            style={{
              background: "linear-gradient(to bottom, #fdfcf7 0%, #f4ede0 100%)",
              border: "1px solid rgba(139, 111, 71, 0.2)",
            }}
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-4 text-2xl text-sepia/60 hover:text-sepia"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="font-serif text-3xl text-center text-ink mb-1">
              {mode === "enter" ? "Welcome home" : "Plant your tree"}
            </h2>
            <p className="handwritten text-center text-sepia mb-6" style={{ fontSize: "1.2rem" }}>
              {mode === "enter" ? "enter your family" : "start a new family"}
            </p>

            <div className="flex border-b border-sepia/20 mb-5">
              <button
                onClick={() => setMode("enter")}
                className={`flex-1 py-2 text-sm transition-colors ${
                  mode === "enter"
                    ? "text-ink font-semibold border-b-2 border-sepia -mb-px"
                    : "text-sepia/70"
                }`}
              >
                Enter family
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm transition-colors ${
                  mode === "register"
                    ? "text-ink font-semibold border-b-2 border-sepia -mb-px"
                    : "text-sepia/70"
                }`}
              >
                New family
              </button>
            </div>

            {mode === "enter" ? (
              <form onSubmit={handleEnter} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Family password"
                  autoFocus
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-sepia text-white rounded-lg hover:bg-ink transition-colors disabled:opacity-50 font-serif tracking-wider"
                >
                  {loading ? "Opening..." : "COME INSIDE"}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your family's name (e.g. 'The Smiths')"
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="password"
                  placeholder="Choose a family password"
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <button
                  type="button"
                  onClick={() => alert("Registration flow coming soon. For now, ask the family admin for the password.")}
                  className="w-full py-3 bg-sepia text-white rounded-lg hover:bg-ink transition-colors font-serif tracking-wider"
                >
                  PLANT THE SEED
                </button>
                <p className="text-xs text-center text-sepia/70 mt-2">
                  You'll be the first person on the tree
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
