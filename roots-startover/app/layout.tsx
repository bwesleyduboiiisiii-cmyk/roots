import type { Metadata } from "next";
import { Caveat, Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700", "900"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "ROOTS",
  description: "A private family tree and memory album."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${caveat.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
