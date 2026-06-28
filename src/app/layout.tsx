import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CVForge AI — Forge Your Future. One CV at a Time.",
  description:
    "AI-powered CV builder with Europass, ATS-optimized, and modern templates. Multi-language support. Cover letters, LinkedIn import, ATS scoring, and interview prep — all in one place.",
  keywords: [
    "CV builder",
    "resume optimizer",
    "AI resume",
    "Europass CV",
    "ATS friendly CV",
    "cover letter AI",
    "LinkedIn import",
    "CVForge",
  ],
  authors: [{ name: "CVForge AI" }],
  openGraph: {
    title: "CVForge AI — Forge Your Future",
    description: "AI-powered CV builder with multi-language support and premium templates.",
    siteName: "CVForge AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CVForge AI",
    description: "Forge Your Future. One CV at a Time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
