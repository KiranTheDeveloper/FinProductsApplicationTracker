import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinTrack — Financial Applications Tracker",
  description: "Track insurance, mutual funds, and IT returns applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`} style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
