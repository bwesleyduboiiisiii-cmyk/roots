"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen paper-bg grid place-items-center p-6">
      <section className="bg-cream polaroid-shadow max-w-md rotate-[-1deg] rounded-xl p-8 text-center">
        <h1 className="font-display text-3xl text-bark">Something went sideways</h1>
        <p className="hand mt-3 text-2xl text-sepia">The family tree hit a snag.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-bark px-6 py-3 font-black text-cream">Try again</button>
      </section>
    </main>
  );
}
