import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  weight: ["400", "500", "600"],
});

const description =
  "Ask anything and get an interactive answer instead of text: maps, photos, charts, drawings and working tools, built with OpenUI.";

export const metadata: Metadata = {
  // Link previews need absolute URLs. The public page is openui.com/demo/intelligent-ui, which
  // the docs app proxies to this deployment, so opengraph-image.png resolves there too.
  metadataBase: new URL("https://www.openui.com"),
  title: "Open Intelligent UI",
  description,
  openGraph: { title: "Open Intelligent UI", description, siteName: "OpenUI", type: "website" },
  twitter: { card: "summary_large_image", title: "Open Intelligent UI", description },
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
