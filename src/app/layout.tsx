import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Variable Inter (no fixed weights), so the theme's in-between weights
// (440, 560, 640) render as set.
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Intelligent UI",
  description: "16 Intelligent UI use cases, from trip plans to games, as generative UI built on OpenUI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
