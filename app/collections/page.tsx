"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WorkItem {
  id?: string;
  src: string;
  title: string;
  year?: string;
  cat: string;
  tall?: boolean;
}

function isCategoryMatch(itemCat: string, targetCat: string): boolean {
  if (!itemCat || !targetCat) return false;
  if (targetCat.toLowerCase() === "all") return true;
  const a = itemCat.toLowerCase().trim();
  const b = targetCat.toLowerCase().trim();
  if (a === b) return true;
  const cleanA = a.replace(/\s*(shooting|shoot)\s*/g, "");
  const cleanB = b.replace(/\s*(shooting|shoot)\s*/g, "");
  return cleanA === cleanB;
}

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "Wedding": "Sacred ceremonies and timeless traditions captured with grace",
  "Pre-Wedding": "Romantic love stories and scenic memories before the big day",
  "Engagement": "A promise of forever captured in authentic, timeless frames",
  "Engagement shoot": "A promise of forever captured in authentic, timeless frames",
  "Profile shoot": "Professional portraits crafted to showcase your unique identity and presence",
  "Maternity Shoot": "Celebrating the divine miracle and tender beauty of motherhood",
  "Baby Shoot": "Gentle, tender portraits celebrating the innocence of new life",
  "Baby Shooting": "Gentle, tender portraits celebrating the innocence of new life",
  "Fashion Shoot": "Where haute couture meets expressive visual storytelling",
  "Modeling": "Editorial precision and dramatic lighting crafting iconic imagery",
  "Sreemantham": "Traditional blessings and sacred heritage honoring new beginnings",
};

function formatCategoryTitle(cat: string): string {
  if (!cat) return "";
  const lower = cat.trim().toLowerCase();
  if (lower === "engagement shoot") return "Engagement shoot";
  if (lower === "profile shoot") return "Profile shoot";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function getCollectionDesc(cat: string): string {
  if (DEFAULT_DESCRIPTIONS[cat]) return DEFAULT_DESCRIPTIONS[cat];
  const found = Object.keys(DEFAULT_DESCRIPTIONS).find((k) => isCategoryMatch(k, cat));
  if (found) return DEFAULT_DESCRIPTIONS[found];
  return `Curated visual narrative celebrating the artistry and authentic moments of ${cat}`;
}

const INITIAL_CATEGORIES = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Maternity Shoot",
  "Baby Shoot",
  "Fashion Shoot",
  "Modeling",
  "Sreemantham",
];

// ── Static cover image overrides per category ──────────────────────────────
const COVER_OVERRIDES: Record<string, string> = {
  "Engagement": "/assets/engagement/DSC01531.jpg.jpeg",
  "Engagement shoot": "/assets/engagement/DSC01531.jpg.jpeg",
  "Pre-Wedding": "/assets/pre-wedding/SSS01607.JPG.jpeg",
  "Pre-wedding shooting": "/assets/pre-wedding/SSS01607.JPG.jpeg",
  "Pre-wedding shoot": "/assets/pre-wedding/SSS01607.JPG.jpeg",
};

export default function Collections() {
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [modal, setModal] = useState<{ title: string; images: string[]; index: number } | null>(null);

  // Fetch portfolio data from server (same data source as Work page)
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.works && Array.isArray(data.works)) {
            setWorks(data.works);
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio in Collections:", err);
      }
    }
    loadPortfolio();
  }, []);

  useScrollReveal([categories, works]);

  // Build dynamic collections from categories and uploaded works
  const collections = categories.map((cat) => {
    const formattedTitle = formatCategoryTitle(cat);
    const catWorks = works.filter((w) => isCategoryMatch(w.cat, cat));
    const rawImages = catWorks.map((w) => w.src);
    // Use a static cover override if defined, otherwise fall back to first image
    const coverOverrideKey = Object.keys(COVER_OVERRIDES).find((k) => isCategoryMatch(k, cat));
    const cover = coverOverrideKey ? COVER_OVERRIDES[coverOverrideKey] : (rawImages[0] || "/assets/wedding/DSC07642.JPG.jpeg");

    // Ensure the cover image is the 1st image in the array
    const images = rawImages.length > 0
      ? (rawImages.includes(cover) ? [cover, ...rawImages.filter((img) => img !== cover)] : [cover, ...rawImages])
      : [cover];

    return {
      title: formattedTitle,
      desc: getCollectionDesc(cat),
      cover,
      images,
      hasImages: images.length > 0,
    };
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!modal) return;
      if (e.key === "Escape") {
        setModal(null);
      } else if (e.key === "ArrowLeft") {
        setModal((prev) =>
          prev
            ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }
            : null
        );
      } else if (e.key === "ArrowRight") {
        setModal((prev) =>
          prev
            ? { ...prev, index: (prev.index + 1) % prev.images.length }
            : null
        );
      }
    },
    [modal]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-sm tracking-widest uppercase mb-3">Explore</p>
          <h1 className="font-display text-foreground text-4xl md:text-6xl">Our Collections</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((c, i) => (
            <button
              key={c.title}
              onClick={() => {
                if (c.images.length > 0) {
                  setModal({ title: c.title, images: c.images, index: 0 });
                }
              }}
              className="reveal image-zoom group relative aspect-[3/4] text-left w-full rounded-sm overflow-hidden border border-border/40 focus:outline-none bg-muted/20"
              style={{ transitionDelay: `${(i % 8) * 0.08}s` }}
            >
              {c.hasImages ? (
                <Image
                  src={c.cover}
                  alt={c.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  loading={i < 4 ? "eager" : "lazy"}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0e0e11] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#d4af37]/40 mb-3">
                    ✦
                  </div>
                  <span className="text-white/40 text-xs uppercase tracking-widest font-mono">No Images</span>
                </div>
              )}
              <div className="gallery-overlay flex-col items-start justify-end p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent translate-y-0 opacity-90 group-hover:opacity-100 transition-all duration-500">
                <span className="text-xs uppercase tracking-widest text-primary font-medium mb-1">
                  {c.images.length > 0
                    ? `${c.images.length} ${c.images.length === 1 ? "Photo" : "Photos"}`
                    : "0 Photos"}
                </span>
                <h3 className="font-display text-2xl text-white">{c.title}</h3>
                <p className="text-white/80 text-sm mt-1 line-clamp-2">{c.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal/Lightbox */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setModal(null)}
        >
          {/* Header Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-foreground z-10">
            <div className="flex items-center gap-3">
              <span className="font-display text-lg tracking-wide">{modal.title}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded border border-border">
                {modal.index + 1} / {modal.images.length}
              </span>
            </div>
            <button
              className="text-foreground text-3xl hover:text-primary transition-colors focus:outline-none p-2"
              onClick={() => setModal(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>
          </div>

          {/* Navigation Prev Button */}
          {modal.images.length > 1 && (
            <button
              className="absolute left-4 md:left-8 text-foreground text-4xl hover:text-primary transition-colors focus:outline-none z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setModal({ ...modal, index: (modal.index - 1 + modal.images.length) % modal.images.length });
              }}
              aria-label="Previous Image"
            >
              ‹
            </button>
          )}

          {/* Current Image - use regular img in lightbox for uncropped full display */}
          <img
            src={modal.images[modal.index]}
            alt={`${modal.title} ${modal.index + 1}`}
            className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-sm select-none"
            onClick={(e) => e.stopPropagation()}
            loading="eager"
          />

          {/* Navigation Next Button */}
          {modal.images.length > 1 && (
            <button
              className="absolute right-4 md:right-8 text-foreground text-4xl hover:text-primary transition-colors focus:outline-none z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setModal({ ...modal, index: (modal.index + 1) % modal.images.length });
              }}
              aria-label="Next Image"
            >
              ›
            </button>
          )}

          {/* Indicator Dots */}
          {modal.images.length > 1 && (
            <div className="absolute bottom-6 flex flex-wrap justify-center max-w-[90vw] gap-2 px-4 z-10">
              {modal.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ ...modal, index: i });
                  }}
                  aria-label={`Jump to image ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === modal.index ? "bg-primary scale-125" : "bg-foreground/30 hover:bg-foreground/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
