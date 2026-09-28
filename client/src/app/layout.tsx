import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Vocalytics AI - Enterprise Vocal Performance Analytics & Coaching",
  description:
    "Production-grade SaaS platform for singers: Librosa audio DSP pitch tracking, vibrato analysis, progress tracking, and AI pedagogical vocal coaching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-neon-cyan selection:text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
