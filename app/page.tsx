"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import landingImage from "../public/landing.png";

export default function LandingPage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<"enter" | "register">("enter");

  // Login state
  const [loginFamily, setLoginFamily] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regFamily, setRegFamily] = useState("");
  const [regYourName, setRegYourName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyName: loginFamily, password: loginPassword }),
    });

    const data = await res.json();

    if (res.ok && data.slug) {
      router.push(`/${data.slug}/hub`);
      router.refresh();
    } else {
      setLoginError(data.error || "Couldn't sign in");
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirm) {
      setRegError("Passwords don't match");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }

    setRegLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyName: regFamily,
        yourName: regYourName,
        password: regPassword,
      }),
    });

    const data = await res.json();

    if (res.ok && data.slug) {
      router.push(`/${data.slug}/hub`);
      router.refresh();
    } else {
      setRegError(data.error || "Couldn't create family");
      setRegLoading(false);
    }
  }

  return (
    <main
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #2a1810 0%, #1a0f08 60%, #0a0604 100%)",
      }}
    >
      <div className="relative w-full min-h-screen flex items-center justify-center">
        <div
          className="relative"
          style={{
            height: "100vh",
            aspectRatio: "1024 / 1536",
            maxWidth: "100%",
          }}
        >
          <Image
            src={landingImage}
            alt="ROOTS — where every family takes root"
            priority
            placeholder="blur"
            fill
            className="object-contain"
            sizes="(max-aspect-ratio: 1024/1536) 100vw, 66vh"
          />

          <button
            onClick={() => { setShowLogin(true); setMode("enter"); }}
            aria-label="Enter our family"
            className="absolute cursor-pointer hover:scale-105 transition-transform duration-200 rounded-xl"
            style={{
              left: "29%",
              top: "59%",
              width: "42%",
              height: "7%",
              background: "transparent",
              border: "none",
              animation: "pulseGlow 2.5s ease-in-out infinite",
            }}
          />

          <button
            onClick={() => { setShowLogin(true); setMode("enter"); }}
            aria-label="Family login"
            className="absolute cursor-pointer rounded-full hover:scale-105 transition-transform"
            style={{
              right: "4%",
              top: "2%",
              width: "18%",
              height: "4%",
              background: "transparent",
              border: "none",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 220, 150, 0); }
          50% { box-shadow: 0 0 24px 6px rgba(255, 220, 150, 0.35); }
        }
      `}</style>

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
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="text"
                  value={loginFamily}
                  onChange={(e) => setLoginFamily(e.target.value)}
                  placeholder="Family name (e.g. The Smiths)"
                  autoFocus
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Family password"
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                {loginError && <p className="text-red-600 text-sm text-center">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-sepia text-white rounded-lg hover:bg-ink transition-colors disabled:opacity-50 font-serif tracking-wider"
                >
                  {loginLoading ? "Opening..." : "COME INSIDE"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  value={regFamily}
                  onChange={(e) => setRegFamily(e.target.value)}
                  placeholder="Your family's name (e.g. The Smiths)"
                  autoFocus
                  required
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="text"
                  value={regYourName}
                  onChange={(e) => setRegYourName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a family password (6+ chars)"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full px-4 py-3 border border-sepia/30 rounded-lg bg-white/80 focus:outline-none focus:border-sepia"
                />
                {regError && <p className="text-red-600 text-sm text-center">{regError}</p>}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-sepia text-white rounded-lg hover:bg-ink transition-colors disabled:opacity-50 font-serif tracking-wider"
                >
                  {regLoading ? "Planting..." : "PLANT THE SEED"}
                </button>
                <p className="text-xs text-center text-sepia/70 mt-2">
                  You'll be the first person on the tree
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
