import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProvider } from "@/contexts/app-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Accord — Design Your Ideal Day",
  description:
    "Track how closely your real life matches the routine you want to live. Build better habits with alignment tracking, smart insights, and progress analytics.",
  keywords: ["routine tracker", "habit tracker", "daily schedule", "alignment", "productivity"],
  openGraph: {
    title: "Accord — Design Your Ideal Day",
    description: "Track how closely your real life matches the routine you want to live.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider>
          <AppProvider>{children}</AppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

