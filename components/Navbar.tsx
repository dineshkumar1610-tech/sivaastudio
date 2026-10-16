"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoZoom, setLogoZoom] = useState(false);

  useEffect(() => {
    // Force dark mode permanently
    document.documentElement.classList.remove("light");
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeZoom = useCallback(() => setLogoZoom(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeZoom(); };
    if (logoZoom) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [logoZoom, closeZoom]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
            : "bg-gradient-to-b from-black/90 via-black/55 to-transparent pb-3"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
          <div className="flex items-center gap-2.5">
            {/* Logo — click to zoom */}
            <button
              onClick={() => setLogoZoom(true)}
              aria-label="View logo"
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/60 transition-transform duration-300 hover:scale-110"
            >
              <Image
                src="/assets/sivaa logo.png"
                alt="Sivaa Studio Logo"
                width={38}
                height={38}
                className="rounded-full object-cover"
              />
            </button>
            <Link href="/" className="font-display text-xl tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Sivaa Studio
            </Link>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  className={`nav-link-underline text-xs md:text-sm tracking-widest uppercase font-semibold pb-1 transition-all duration-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
                    pathname === l.to
                      ? "text-primary active font-bold drop-shadow-[0_0_12px_hsl(var(--primary))]"
                      : "text-white hover:text-primary hover:drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white flex flex-col gap-1.5 focus:outline-none p-1"
              aria-label="Menu"
            >
              <span className={`block w-6 h-[2px] bg-white transition-transform duration-300 ${mobileOpen ? "rotate-45 translate-y-[8px]" : ""}`} />
              <span className={`block w-6 h-[2px] bg-white transition-opacity duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-[2px] bg-white transition-transform duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[8px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden bg-background/98 backdrop-blur-xl overflow-hidden transition-all duration-500 ${
            mobileOpen ? "max-h-96 border-b border-border shadow-2xl" : "max-h-0"
          }`}
        >
          <ul className="flex flex-col px-6 py-6 gap-6">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  href={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm tracking-widest uppercase font-semibold transition-colors duration-200 block py-1.5 ${
                    pathname === l.to ? "text-primary font-bold" : "text-white/90 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logo Zoom Lightbox */}
      {logoZoom && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={closeZoom}
          style={{ animation: "logoFadeIn 0.25s ease forwards" }}
        >
          <div
            className="relative flex flex-col items-center max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "logoZoomIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <div className="ring-4 ring-primary/50 rounded-full shadow-2xl shadow-primary/40 p-2 bg-black/30 backdrop-blur-sm max-w-[75vw] max-h-[75vw]">
              <Image
                src="/assets/sivaa logo.png"
                alt="Sivaa Studio Logo Zoomed"
                width={300}
                height={300}
                className="rounded-full object-cover max-w-[70vw] max-h-[70vw]"
                style={{ animation: "spin-slow 26.7s linear infinite" }}
              />
            </div>
            <p className="text-center font-display text-white text-xl sm:text-2xl tracking-[0.3em] uppercase mt-6">
              Sivaa Studio
            </p>
            <p className="text-primary text-[11px] sm:text-xs tracking-widest uppercase mt-2 text-center">
              Your Story, Told Through Our Lens
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={closeZoom}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors duration-200"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes logoFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes logoZoomIn {
          from { transform: scale(0.3); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  );
}
