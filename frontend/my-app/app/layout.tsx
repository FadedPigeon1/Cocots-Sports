import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocots Sports - NBA Predictions",
  description: "AI-powered NBA game predictions and tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Cocots Sports. Powered by AI & NBA
            Stats.
          </p>
        </footer>
      </body>
    </html>
  );
}
