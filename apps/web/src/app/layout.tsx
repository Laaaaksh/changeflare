import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Changeflare",
  description: "A self-hosted, embeddable changelog widget — the free alternative to Beamer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
