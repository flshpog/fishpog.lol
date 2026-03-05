import type { Metadata } from "next";
import "./globals.css";
import { LayoutShell } from "./LayoutShell";

export const metadata: Metadata = {
  title: "Your Horizon",
  description:
    "All-in-one Animal Crossing: New Horizons companion. Track your museum, collections, turnip prices, villagers, weather, and more.",
  metadataBase: new URL("https://fishpog.lol/yourhorizon"),
  openGraph: {
    title: "Your Horizon",
    description:
      "All-in-one Animal Crossing: New Horizons companion. Track your museum, collections, turnip prices, villagers, weather, and more.",
    siteName: "Your Horizon",
    type: "website",
    url: "https://fishpog.lol/yourhorizon",
  },
  twitter: {
    card: "summary",
    title: "Your Horizon",
    description:
      "All-in-one Animal Crossing: New Horizons companion. Track your museum, collections, turnip prices, villagers, weather, and more.",
  },
  other: {
    "theme-color": "#68b87a",
  },
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
