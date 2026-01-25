import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBA Tracker & Predictor",
  description: "AI-powered NBA game predictions and player statistics tracking",
};

import Navbar from "@/components/Navbar";

import { TrackingProvider } from "@/lib/hooks/useTracking";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        <TrackingProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <footer className="border-t border-border/40 py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by{" "}
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  Cocots
                </a>
                . The source code is available on GitHub.
              </p>
            </div>
          </footer>
        </TrackingProvider>
      </body>
    </html>
  );
}
