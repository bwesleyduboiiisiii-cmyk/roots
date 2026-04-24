import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROOTS",
  description: "Where our family takes root — tree and memories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
