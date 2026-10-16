import type { Metadata } from "next";
import { Playfair_Display, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-display" 
});
const instrument = Instrument_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Sivaa Studio — Capturing Moments That Last Forever",
  description: "Premium photography studio in Chittoor, Andhra Pradesh. Weddings, portraits, events & nature photography.",
  authors: [{ name: "Sivaa Studio" }],
  openGraph: {
    title: "Sivaa Studio — Capturing Moments That Last Forever",
    description: "Premium photography studio in Chittoor, Andhra Pradesh. Weddings, portraits, events & nature photography.",
    type: "website",
  },
};

// eslint-disable-next-line react-refresh/only-export-components
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${instrument.variable} overflow-x-hidden max-w-full`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans overflow-x-hidden max-w-full w-full relative">
        <Navbar />
        <main className="overflow-x-hidden max-w-full w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
