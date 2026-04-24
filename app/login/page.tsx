import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[url('/landing-final.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/35" />
      <div className="relative z-10 flex min-h-screen flex-col items-center text-center text-cream">
        <div className="pt-[7vh] drop-shadow-2xl">
          <h1 className="wordmark text-[clamp(3.5rem,9vw,8rem)] leading-none text-[#3d2e1f]">ROOTS</h1>
          <p className="mt-5 font-display text-[clamp(1rem,2vw,1.45rem)] uppercase tracking-[.35em] text-[#4a3020]">
            Every family has a story<br />welcome to ours.
          </p>
        </div>
        <div className="mt-auto mb-[27vh]">
          <LoginForm />
          <p className="hand mt-5 text-2xl text-cream/90 drop-shadow-lg">private family website</p>
        </div>
      </div>
    </main>
  );
}
