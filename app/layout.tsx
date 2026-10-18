import type { Metadata, Viewport } from "next";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script-loaded",
});
const serif = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif-loaded",
});

export const metadata: Metadata = {
  title: "Juliet & Christopher | RSVP",
  description:
    "Kindly respond to the wedding invitation of Juliet John & Christopher Okafor, 23rd December 2026.",
};

export const viewport: Viewport = {
  themeColor: "#fbf6ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${script.variable} ${serif.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
