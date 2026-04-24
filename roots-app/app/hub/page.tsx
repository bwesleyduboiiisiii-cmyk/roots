import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function HubPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="font-serif text-6xl md:text-7xl text-ink mb-3 tracking-widest">ROOTS</h1>
        <p className="handwritten text-sepia" style={{ fontSize: "1.6rem" }}>
          where we come from, what we remember
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full">
        <Link href="/tree" className="polaroid block" style={{ transform: "rotate(-2deg)" }}>
          <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-sepia" fill="currentColor">
              <circle cx="50" cy="20" r="8" />
              <circle cx="25" cy="50" r="8" />
              <circle cx="75" cy="50" r="8" />
              <circle cx="15" cy="80" r="6" />
              <circle cx="35" cy="80" r="6" />
              <circle cx="65" cy="80" r="6" />
              <circle cx="85" cy="80" r="6" />
              <line x1="50" y1="28" x2="25" y2="42" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50" y1="28" x2="75" y2="42" stroke="currentColor" strokeWidth="1.5" />
              <line x1="25" y1="58" x2="15" y2="74" stroke="currentColor" strokeWidth="1" />
              <line x1="25" y1="58" x2="35" y2="74" stroke="currentColor" strokeWidth="1" />
              <line x1="75" y1="58" x2="65" y2="74" stroke="currentColor" strokeWidth="1" />
              <line x1="75" y1="58" x2="85" y2="74" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <p className="handwritten text-center py-3">The Family Tree</p>
        </Link>

        <Link href="/album" className="polaroid block" style={{ transform: "rotate(2deg)" }}>
          <div className="aspect-square bg-gradient-to-br from-rose-100 to-amber-200 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-sepia" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="20" y="25" width="60" height="55" rx="2" />
              <rect x="25" y="30" width="50" height="38" />
              <circle cx="40" cy="45" r="4" fill="currentColor" />
              <polyline points="25,68 40,55 55,62 75,45 75,68" />
            </svg>
          </div>
          <p className="handwritten text-center py-3">The Photo Album</p>
        </Link>
      </div>

      <SignOutButton />
    </main>
  );
}
