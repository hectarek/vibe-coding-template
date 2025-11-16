import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/src/shared/utils/seo";
import { Providers } from "./_providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO-optimized metadata
export const metadata: Metadata = generateSEOMetadata({
  title: "Vibe Coding Template",
  description:
    "A production-ready Next.js template with Clean Architecture, TypeScript, and best practices built-in",
  keywords: [
    "Next.js",
    "TypeScript",
    "Clean Architecture",
    "Template",
    "Drizzle ORM",
    "Bun",
  ],
  type: "website",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
