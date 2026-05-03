"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import homeImage from "../public/home.png";

type Props = {
  familyName: string;
  familySlug: string;
};

export default function HubOverlay({ familyName, familySlug }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/");
    router.refresh();
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
            src={homeImage}
            alt={`ROOTS — ${familyName}`}
            priority
            placeholder="blur"
            fill
            className="object-contain"
            sizes="(max-aspect-ratio: 1024/1536) 100vw, 66vh"
          />

          {/* Family name overlay — sits directly above the ROOTS title,
              hugging it like a "by" or family identifier line. */}
          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              left: "25%",
              top: "13%",
              width: "50%",
              height: "5%",
            }}
          >
            <p
              className="text-center"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 1.8vh, 1.5rem)",
                color: "#d9b769",
                textShadow: "0 2px 8px rgba(0,0,0,0.85), 0 0 16px rgba(0,0,0,0.6)",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              {familyName}
            </p>
          </div>

          {/* Click zone over LEFT "EXPLORE" button (Family Tree) */}
          <button
            onClick={() => router.push(`/${familySlug}/tree`)}
            aria-label="Explore the family tree"
            className="absolute cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full"
            style={{
              left: "12%",
              top: "68.5%",
              width: "33%",
              height: "4.5%",
              background: "transparent",
              border: "none",
              animation: "pulseGlow 2.5s ease-in-out infinite",
            }}
          />

          {/* Click zone over RIGHT "EXPLORE" button (Photo Album) */}
          <button
            onClick={() => router.push(`/${familySlug}/album`)}
            aria-label="Explore the photo album"
            className="absolute cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full"
            style={{
              left: "54.5%",
              top: "68.5%",
              width: "33%",
              height: "4.5%",
              background: "transparent",
              border: "none",
              animation: "pulseGlow 2.5s ease-in-out infinite",
              animationDelay: "1.25s",
            }}
          />

          {/* Click zone over SIGN OUT pill (top right) */}
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="absolute cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full"
            style={{
              right: "5%",
              top: "3%",
              width: "17.5%",
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
    </main>
  );
}
