import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "./LayoutShell";

export const metadata: Metadata = {
  title: "Your Horizon - ACNH Companion",
  description:
    "A comprehensive Animal Crossing: New Horizons companion tool. Track collections, manage villagers, predict turnip prices, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
