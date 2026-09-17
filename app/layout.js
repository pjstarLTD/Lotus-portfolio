import { Bodoni_Moda, Cinzel_Decorative, Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const majestic = Cinzel_Decorative({
  variable: "--font-majestic",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const elegance = Bodoni_Moda({
  variable: "--font-elegance",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const vintageVibe = Cormorant_Garamond({
  variable: "--font-vintage-vibe",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "LOTUS | Film & Visual Stories",
  description: "Cinematic videography for people, places, and ideas that deserve to be remembered.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${majestic.variable} ${elegance.variable} ${vintageVibe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
