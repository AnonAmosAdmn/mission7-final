import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PrivyProvider from "./components/PrivyProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dark Dungeon",
  description: "Procedurally generated dungeon crawler game with blockchain integration",
  openGraph: {
    title: "Dark Dungeon",
    description: "Procedurally generated dungeon crawler game with blockchain integration",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Dark Dungeon - Procedurally generated dungeon crawler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dark Dungeon",
    description: "Procedurally generated dungeon crawler game with blockchain integration",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}