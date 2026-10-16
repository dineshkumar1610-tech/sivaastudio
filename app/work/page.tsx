"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  ChevronDown,
  Trash2,
  Upload,
  Plus,
  Lock,
  Unlock,
  X,
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Sparkles,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { generateAiTitle } from "@/lib/aiTitle";

interface WorkItem {
  id?: string;
  src: string;
  title: string;
  year: string;
  cat: string;
  tall?: boolean;
}

// ── Category Matching Helper (handles variations like "Wedding" vs "Wedding Shooting") ────
function isCategoryMatch(itemCat: string, targetCat: string): boolean {
  if (!itemCat || !targetCat) return false;
  if (targetCat.toLowerCase() === "all") return true;
  const a = itemCat.toLowerCase().trim();
  const b = targetCat.toLowerCase().trim();
  if (a === b) return true;
  const cleanA = a.replace(/\s*(shooting|shoot)\s*/g, "");
  const cleanB = b.replace(/\s*(shooting|shoot)\s*/g, "");
  if (cleanA === cleanB) return true;
  if (
    (cleanA === "seemantham" && cleanB === "sreemantham") ||
    (cleanA === "sreemantham" && cleanB === "seemantham")
  ) {
    return true;
  }
  return false;
}

// ── AI-generated captions per category ──────────────────────────────────────
const AI_CAPTIONS: Record<string, string> = {
  "All":
    "Step into our complete visual archive — a timeless anthology of love, life, and luminous celebrations. Every frame here is crafted with intention, capturing the raw beauty of human connection across every milestone. Explore the full spectrum of our artistry.",
  "Baby Shoot":
    "Celebrate the pure miracle of new life through our soft, heartfelt baby portraits. We capture every delicate yawn, tiny curl, and tender moment in warm, dreamy tones. Each image is a keepsake your family will treasure for generations to come.",
  "Baby Shooting":
    "Celebrate the pure miracle of new life through our soft, heartfelt baby portraits. We capture every delicate yawn, tiny curl, and tender moment in warm, dreamy tones. Each image is a keepsake your family will treasure for generations to come.",
  "Engagement":
    "Two souls, one promise — our engagement sessions are crafted to celebrate the magic of your love story. From candid laughter to quiet, tender glances, we capture the joy of this beautiful beginning. Every frame is a chapter in your forever.",
  "Maternity Shoot":
    "Embrace the radiant grace of motherhood in our intimate maternity portraits. We celebrate the divine strength and soft beauty of every expecting mother with artistic, emotive imagery. These photographs preserve a sacred chapter that passes all too swiftly.",
  "Modeling":
    "Where editorial precision meets expressive artistry, our modeling portfolio pushes creative boundaries. We blend dramatic lighting, fashion-forward styling, and bold compositions to craft iconic images. Each session is a visual statement designed to captivate.",
  "Pre-Wedding":
    "Your love story deserves a prologue as beautiful as the wedding itself. Our pre-wedding sessions blend cinematic storytelling with breathtaking locations to create images full of genuine emotion. Relive the anticipation, the laughter, and the promise.",
  "Sreemantham":
    "Sreemantham is a sacred celebration of new life and maternal blessings, rich in culture and tradition. We document every ritual, every prayer, and every joyful moment with reverence and artistry. These images honour a heritage that connects generations.",
  "Seemantham":
    "Seemantham is a sacred celebration of new life and maternal blessings, rich in culture and tradition. We document every ritual, every prayer, and every joyful moment with reverence and artistry. These images honour a heritage that connects generations.",
  "Wedding":
    "A wedding is the most exquisite chapter of your life story, and we are honoured to document it. From sacred rituals to spontaneous tears of joy, our lenses capture every emotion with cinematic grace. Your day, preserved as timeless fine art forever.",
  "Wedding Shooting":
    "A wedding is the most exquisite chapter of your life story, and we are honoured to document it. From sacred rituals to spontaneous tears of joy, our lenses capture every emotion with cinematic grace. Your day, preserved as timeless fine art forever.",
  "Fashion Shoot":
    "Where haute couture meets expressive visual storytelling, our fashion sessions redefine elegance. We combine impeccable lighting, bold aesthetics, and artistic direction to deliver stunning, magazine-worthy imagery. Fashion is the art you wear — we make it eternal.",
};

function getAiCaption(category: string): string {
  if (AI_CAPTIONS[category]) return AI_CAPTIONS[category];
  const found = Object.keys(AI_CAPTIONS).find((k) => isCategoryMatch(k, category));
  if (found) return AI_CAPTIONS[found];
  return `Explore our curated ${category} collection, a showcase of artistry, emotion, and authentic storytelling through the lens. Each photograph is crafted with care to preserve your most meaningful moments. Discover the beauty in every frame we have captured for you.`;
}

const DEFAULT_CATEGORIES = [
  "Baby Shoot",
  "Engagement",
  "Fashion Shoot",
  "Maternity Shoot",
  "Modeling",
  "Pre-Wedding",
  "Sreemantham",
  "Wedding",
];

const INITIAL_WORKS: WorkItem[] = [
  { id: "w-1", src: "/assets/wedding/DSC07642.JPG.jpeg", title: "Sacred Vows", year: "2024", cat: "Wedding", tall: true },
  { id: "w-15", src: "/assets/pre-wedding/SSS01607.JPG.jpeg", title: "Enchanted Moments", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-2", src: "/assets/pre-wedding/SSS00987.JPG.jpeg", title: "Sunlit Romance", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-3", src: "/assets/engagement/SSS01906.JPG.jpeg", title: "Golden Promise", year: "2024", cat: "Engagement", tall: true },
  { id: "w-4", src: "/assets/wedding/DSC07660.JPG.jpeg", title: "Royal Entrance", year: "2024", cat: "Wedding", tall: false },
  { id: "w-5", src: "/assets/maternity%20shooting/SSS09685.JPG.jpeg", title: "A Mother's Grace", year: "2024", cat: "Maternity Shoot", tall: true },
  { id: "w-6", src: "/assets/pre-wedding/SSS01259.JPG.jpeg", title: "Together in Bliss", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-7", src: "/assets/wedding/DSC07738.JPG.jpeg", title: "Bridal Splendor", year: "2024", cat: "Wedding", tall: true },
  { id: "w-8", src: "/assets/wedding/DSC07749.JPG.jpeg", title: "Holy Union", year: "2024", cat: "Wedding", tall: false },
  { id: "w-9", src: "/assets/engagement/SSS01934.JPG.jpeg", title: "Ring Ceremony", year: "2024", cat: "Engagement", tall: true },
  { id: "w-10", src: "/assets/pre-wedding/SSS01402.JPG.jpeg", title: "Whispering Winds", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-11", src: "/assets/wedding/DSC07752.JPG.jpeg", title: "Temple Blessings", year: "2024", cat: "Wedding", tall: true },
  { id: "w-12", src: "/assets/pre-wedding/SSS01590.JPG.jpeg", title: "Eternal Bond", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-13", src: "/assets/wedding/DSC07775.JPG.jpeg", title: "Ceremonial Joy", year: "2024", cat: "Wedding", tall: false },
  { id: "w-14", src: "/assets/wedding/DSC07780.JPG.jpeg", title: "Traditional Elegance", year: "2024", cat: "Wedding", tall: true },
  { id: "w-16", src: "/assets/wedding/DSC07794.JPG.jpeg", title: "The Mangalsutra", year: "2024", cat: "Wedding", tall: true },
  { id: "w-17", src: "/assets/pre-wedding/SSS01617.JPG.jpeg", title: "Serenade", year: "2024", cat: "Pre-Wedding", tall: false },
  { id: "w-18", src: "/assets/wedding/DSC07823.JPG.jpeg", title: "Festive Rituals", year: "2024", cat: "Wedding", tall: true },
  { id: "w-19", src: "/assets/wedding/DSC07833.JPG.jpeg", title: "Auspicious Moments", year: "2024", cat: "Wedding", tall: false },
  { id: "w-20", src: "/assets/pre-wedding/SSS01963.JPG.jpeg", title: "Timeless Embrace", year: "2023", cat: "Pre-Wedding", tall: true },
  { id: "w-21", src: "/assets/wedding/DSC07846.JPG.jpeg", title: "Sacred Fire", year: "2024", cat: "Wedding", tall: false },
  { id: "w-22", src: "/assets/wedding/DSC07850.JPG.jpeg", title: "Joyful Tears", year: "2024", cat: "Wedding", tall: true },
  { id: "w-23", src: "/assets/pre-wedding/SSS02004.JPG.jpeg", title: "Golden Horizon", year: "2023", cat: "Pre-Wedding", tall: false },
  { id: "w-24", src: "/assets/wedding/DSC07860.JPG.jpeg", title: "Family Traditions", year: "2024", cat: "Wedding", tall: true },
  { id: "w-25", src: "/assets/wedding/DSC07898.JPG.jpeg", title: "The Couple", year: "2024", cat: "Wedding", tall: false },
  { id: "w-26", src: "/assets/wedding/DSC07915.JPG.jpeg", title: "Pure Emotion", year: "2024", cat: "Wedding", tall: true },
  { id: "w-27", src: "/assets/wedding/DSC07943.JPG.jpeg", title: "Grand Celebration", year: "2024", cat: "Wedding", tall: false },
  { id: "w-28", src: "/assets/wedding/DSC07978.JPG.jpeg", title: "Graceful Twirl", year: "2024", cat: "Wedding", tall: true },
  { id: "w-29", src: "/assets/wedding/DSC07992.JPG.jpeg", title: "Everlasting Story", year: "2024", cat: "Wedding", tall: false },
];

export default function Work() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [works, setWorks] = useState<WorkItem[]>(INITIAL_WORKS);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<string>("Baby Shoot");

  useScrollReveal([activeFilter, works.length]);

  // Caption state
  const [customCaptions, setCustomCaptions] = useState<Record<string, string>>({});
  const [editingCaption, setEditingCaption] = useState<boolean>(false);
  const [draftCaption, setDraftCaption] = useState<string>("");

  // Admin and UI state — always locked by default when opening or navigating to the page
  const [adminLocked, setAdminLocked] = useState<boolean>(true);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);

  // Clear any old sessionStorage keys if they exist
  useEffect(() => {
    try {
      sessionStorage.removeItem("sivaa_admin_unlocked");
    } catch {
      // sessionStorage not available in SSR/private mode
    }
  }, []);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  // Category rename state
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState<boolean>(false);
  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Derive current caption
  const currentCaption = customCaptions[activeFilter] ?? getAiCaption(activeFilter);

  // Fetch portfolio data from server on mount
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            if (!data.categories.includes(selectedAdminCategory)) {
              setSelectedAdminCategory(data.categories[0]);
            }
          }
          if (data.works && Array.isArray(data.works) && data.works.length > 0) {
            setWorks(data.works);
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      }
    }
    loadPortfolio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When filter changes, close caption edit
  useEffect(() => {
    setEditingCaption(false);
  }, [activeFilter]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingCaption && captionTextareaRef.current) {
      captionTextareaRef.current.focus();
      captionTextareaRef.current.select();
    }
  }, [editingCaption]);

  // Filtered works list
  const filteredWorks =
    activeFilter === "All"
      ? works
      : works.filter((w) => isCategoryMatch(w.cat, activeFilter));

  // Lightbox keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editingCaption) return; // don't intercept arrow keys while editing
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredWorks.length) % filteredWorks.length : null
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredWorks.length : null
        );
      }
    },
    [lightboxIndex, filteredWorks.length, editingCaption]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Caption actions
  const startEditCaption = () => {
    setDraftCaption(currentCaption);
    setEditingCaption(true);
  };

  const saveCaption = () => {
    if (draftCaption.trim()) {
      setCustomCaptions((prev) => ({ ...prev, [activeFilter]: draftCaption.trim() }));
    }
    setEditingCaption(false);
  };

  const resetCaption = () => {
    setCustomCaptions((prev) => {
      const next = { ...prev };
      delete next[activeFilter];
      return next;
    });
    setDraftCaption(getAiCaption(activeFilter));
    setEditingCaption(false);
    showStatus("Caption reset to AI-generated version.");
  };

  // Admin PIN verification
  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === "949857") {
      setAdminLocked(false);
      setPinModalOpen(false);
      setPinInput("");
      setPinError("");
      setShowPin(false);
      showStatus("Admin controls & AI Caption unlocked!");
    } else {
      setPinError("Invalid security PIN. Access denied.");
    }
  };

  // Lock admin controls
  const handleLockAdmin = () => {
    setAdminLocked(true);
    setEditingCaption(false);
    showStatus("Admin controls locked.");
  };

  // Add new category handler
  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showStatus("Category already exists!", "error");
      return;
    }

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_category", name: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
        setSelectedAdminCategory(trimmed);
      } else {
        const updated = [...categories, trimmed].sort((a, b) => a.localeCompare(b));
        setCategories(updated);
        setSelectedAdminCategory(trimmed);
      }
    } catch {
      const updated = [...categories, trimmed].sort((a, b) => a.localeCompare(b));
      setCategories(updated);
      setSelectedAdminCategory(trimmed);
    }

    setNewCategoryName("");
    setNewCategoryModalOpen(false);
    setDropdownOpen(false);
    showStatus(`Category "${trimmed}" added successfully!`);
  };

  // Rename category handler
  const handleRenameCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editCategoryName.trim();
    const oldName = activeFilter === "All" ? selectedAdminCategory : activeFilter;
    if (!trimmed || trimmed === oldName) {
      setEditCategoryModalOpen(false);
      return;
    }
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName)) {
      showStatus("A category with that name already exists!", "error");
      return;
    }

    try {
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename_category", oldName, newName: trimmed }),
      });
    } catch {
      // Optimistic UI — update local state regardless
    }

    // Update categories list
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    // Update all works that belong to the old category
    setWorks((prev) => prev.map((w) => isCategoryMatch(w.cat, oldName) ? { ...w, cat: trimmed } : w));
    // Update selected/active filters
    setSelectedAdminCategory(trimmed);
    if (activeFilter === oldName) setActiveFilter(trimmed);
    setEditCategoryModalOpen(false);
    setEditCategoryName("");
    showStatus(`Category renamed to "${trimmed}"!`);
  };

  // Delete category handler
  const handleDeleteCategory = async () => {
    if (!selectedAdminCategory) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the "${selectedAdminCategory}" category?`
    );
    if (!confirmDelete) return;

    try {
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_category", name: selectedAdminCategory }),
      });
    } catch {
      // Optimistic UI — local state updated below regardless
    }

    const updated = categories.filter((c) => c !== selectedAdminCategory);
    setCategories(updated);
    const nextCategory = updated[0] || "Wedding Shooting";
    setSelectedAdminCategory(nextCategory);
    if (activeFilter === selectedAdminCategory) setActiveFilter("All");
    showStatus(`Category "${selectedAdminCategory}" removed.`);
  };

  // Handle file selection
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      // Auto-generate custom title using AI according to image & category
      const autoTitle = generateAiTitle(selectedAdminCategory, files[0].name);
      setUploadTitle(autoTitle);
      setUploadModalOpen(true);
    }
  };

  // Upload files handler — sends files via multipart FormData to /api/upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("files", file);
      }
      formData.append("category", selectedAdminCategory);
      formData.append("year", new Date().getFullYear().toString());
      if (uploadTitle.trim() && selectedFiles.length === 1) {
        formData.append("title", uploadTitle.trim());
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      let data: { success?: boolean; uploadedWorks?: WorkItem[]; allWorks?: WorkItem[]; categories?: string[]; error?: string } | null = null;
      try { data = JSON.parse(rawText); } catch { /* ignore */ }

      if (!res.ok || data?.error) {
        throw new Error(data?.error || "Upload failed");
      }

      if (data?.allWorks) {
        setWorks(data.allWorks);
      } else if (data?.uploadedWorks) {
        setWorks((prev) => [...(data!.uploadedWorks as WorkItem[]), ...prev]);
      }
      if (data?.categories) setCategories(data.categories);

      setUploadModalOpen(false);
      setSelectedFiles([]);
      setUploadTitle("");
      showStatus(`${selectedFiles.length} photo(s) uploaded to "${selectedAdminCategory}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed. Please check your connection.";
      showStatus(msg, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete individual work item
  const handleDeleteWork = async (item: WorkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Remove "${item.title}" from portfolio?`);
    if (!confirmDelete) return;

    try {
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_work", id: item.id, src: item.src }),
      });
    } catch {
      // Optimistic UI — item removed from local state below
    }
    setWorks((prev) => prev.filter((w) => w.id !== item.id && w.src !== item.src));
    showStatus("Photo removed.");
  };

  const activeLightboxItem = lightboxIndex !== null ? filteredWorks[lightboxIndex] : null;
  const isCustomCaption = Boolean(customCaptions[activeFilter]);

  return (
    <>
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">

        {/* ── Status Toast ────────────────────────────────────── */}
        {statusMessage && (
          <div className="fixed top-24 right-6 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-5 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-2 border ${
              statusMessage.type === "success"
                ? "bg-black/90 border-primary text-primary"
                : "bg-black/90 border-red-500 text-red-400"
            }`}>
              {statusMessage.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {statusMessage.text}
            </div>
          </div>
        )}

        {/* ── Category Filter Bar — wrapping, no side scroll ─── */}
        <div className="mb-10 reveal">
          <div className="flex flex-wrap items-center justify-center gap-x-0 gap-y-1 border-b border-white/10">
            {["All", ...categories].map((cat, idx, arr) => {
              const count = cat === "All" ? works.length : works.filter((w) => isCategoryMatch(w.cat, cat)).length;
              const isActive = cat.toLowerCase().trim() === activeFilter.toLowerCase().trim();
              const isLast = idx === arr.length - 1;
              return (
                <div key={cat} className="flex items-center">
                  <button
                    onClick={() => {
                      setActiveFilter(cat);
                      if (cat !== "All") setSelectedAdminCategory(cat);
                    }}
                    className={`relative px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-semibold transition-all duration-300 focus:outline-none group ${
                      isActive ? "text-primary" : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    {cat}
                    {count > 0 && (
                      <span className={`ml-1 text-[9px] sm:text-[10px] font-normal ${isActive ? "text-primary/70" : "text-white/30"}`}>
                        ({count})
                      </span>
                    )}
                    <span className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                      isActive ? "bg-primary" : "bg-transparent group-hover:bg-white/15"
                    }`} />
                  </button>
                  {!isLast && (
                    <span className="text-white/15 text-xs select-none">·</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Caption Box ──────────────────────────────────────── */}
        <div className="reveal max-w-4xl mx-auto mb-14 relative z-40">
          {/* overflow-visible allows dropdown to float cleanly above images */}
          <div className="bg-[#0b0b0c] border border-white/10 rounded-2xl p-8 sm:p-12 text-center relative shadow-2xl overflow-visible z-40">

            {/* Title */}
            <p className="font-display tracking-[0.35em] text-[#d4af37] text-xs sm:text-sm uppercase mb-4">
              {activeFilter === "All" ? "THE ENTIRE PORTFOLIO" : activeFilter.toUpperCase()}
            </p>

            {/* Ornament */}
            <div className="flex items-center justify-center gap-4 mb-6 opacity-60">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#d4af37]" />
              <span className="text-[#d4af37] text-xs">✦</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#d4af37]" />
            </div>

            {/* ── Caption: View or Edit (Editing and AI option only visible when unlocked with PIN) ── */}
            {!adminLocked && editingCaption ? (
              <div className="relative max-w-2xl mx-auto">
                <textarea
                  ref={captionTextareaRef}
                  value={draftCaption}
                  onChange={(e) => setDraftCaption(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-[#d4af37]/40 rounded-xl px-5 py-4 text-white/90 font-serif italic text-sm sm:text-[15px] leading-relaxed resize-none focus:outline-none focus:border-[#d4af37]/80 transition-colors text-center"
                  placeholder="Enter a 3-line description for this category..."
                />
                <p className="text-[11px] text-white/30 mt-1 mb-4">
                  Keep it to 3 lines — short, vivid and evocative.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={resetCaption}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-white/50 hover:text-white/80 text-[11px] uppercase tracking-wider transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCaption(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 text-white/50 hover:text-white/80 text-[11px] uppercase tracking-wider transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveCaption}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] uppercase tracking-wider hover:bg-primary/90 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Caption
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative max-w-2xl mx-auto group/caption">
                <p className="font-serif italic text-white/75 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {currentCaption}
                </p>
                {/* Caption AI / Edit button shown only when admin enters security PIN */}
                {!adminLocked && (
                  <button
                    type="button"
                    onClick={startEditCaption}
                    title="Edit caption"
                    className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/30 hover:text-[#d4af37] transition-colors focus:outline-none"
                  >
                    <Pencil className="w-3 h-3" />
                    {isCustomCaption ? "Edit Caption" : "Edit Caption"}
                    {!isCustomCaption && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-[#d4af37]/60">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ── Admin Controls ── */}
            {!adminLocked ? (
              <div className="mt-8 flex flex-col items-center relative z-50">
                <div className="bg-[#121214] border border-white/10 rounded-xl px-4 py-3 inline-flex flex-wrap items-center justify-center gap-3 shadow-lg relative z-50">
                  {/* Label */}
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold select-none">
                    CATEGORY:
                  </span>

                  {/* Dropdown — stable, anchored directly to button, renders on top of images */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      id="cat-dropdown-btn"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="bg-[#09090a] border border-white/15 hover:border-white/35 text-white text-[11px] tracking-wider uppercase px-3.5 py-2 rounded-lg flex items-center gap-2.5 min-w-[170px] transition-all focus:outline-none"
                    >
                      <span className="truncate flex-1 text-left">
                        {activeFilter === "All" ? selectedAdminCategory : activeFilter}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-white/60 flex-shrink-0 transition-transform duration-200 ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#111113] border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* List of categories with custom dark scrollbar */}
                        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                          {/* "All Categories" option so admin can easily switch back to All */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveFilter("All");
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-[11px] tracking-wider uppercase text-left flex items-center justify-between transition-colors border-b border-white/5 ${
                              activeFilter === "All"
                                ? "text-[#d4af37] font-semibold bg-white/5"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>ALL CATEGORIES</span>
                            {activeFilter === "All" && <Check className="w-3 h-3 text-[#d4af37]" />}
                          </button>

                          {categories.map((cat) => {
                            const isSelected = isCategoryMatch(
                              cat,
                              activeFilter === "All" ? selectedAdminCategory : activeFilter
                            );
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedAdminCategory(cat);
                                  setActiveFilter(cat);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-[11px] tracking-wider uppercase text-left flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? "text-[#d4af37] font-semibold bg-white/5"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span className="truncate">{cat}</span>
                                {isSelected && <Check className="w-3 h-3 text-[#d4af37] flex-shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Add New Category Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            setNewCategoryModalOpen(true);
                          }}
                          className="bg-[#0066ff] hover:bg-[#0055dd] text-white font-semibold text-[11px] tracking-wider uppercase py-2.5 px-4 flex items-center justify-center gap-1.5 transition-colors flex-shrink-0 border-t border-white/10"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add New Category...
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rename category */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditCategoryName(activeFilter === "All" ? selectedAdminCategory : activeFilter);
                      setEditCategoryModalOpen(true);
                    }}
                    className="p-2 rounded-lg border border-white/15 text-white/50 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                    title={`Rename "${activeFilter === "All" ? selectedAdminCategory : activeFilter}" category`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete category */}
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    className="p-2 rounded-lg border border-red-500/25 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all focus:outline-none"
                    title={`Delete "${activeFilter === "All" ? selectedAdminCategory : activeFilter}" category`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Upload images */}
                  <label className="border border-dashed border-[#d4af37]/50 hover:border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/8 text-[11px] tracking-widest font-semibold uppercase px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all select-none">
                    <Plus className="w-3.5 h-3.5" /> UPLOAD IMAGES
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFilesSelected}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleLockAdmin}
                  className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors focus:outline-none"
                >
                  <Lock className="w-3 h-3" /> LOCK ADMIN CONTROLS
                </button>
              </div>
            ) : (
              /* When locked, show UNLOCK ADMIN CONTROLS only on All category */
              activeFilter === "All" && (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setPinInput("");
                      setPinError("");
                      setShowPin(false);
                      setPinModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] tracking-[0.15em] uppercase text-white/50 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                  >
                    <Unlock className="w-3.5 h-3.5" /> UNLOCK ADMIN CONTROLS
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Empty State ──────────────────────────────────────── */}
        {filteredWorks.length === 0 && (
          <div className="text-center py-20 reveal">
            <h3 className="font-display text-xl sm:text-2xl text-white/60 tracking-wider">
              No Images
            </h3>
            {!adminLocked && (
              <div className="mt-5">
                <label className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-xs tracking-widest uppercase font-semibold cursor-pointer hover:bg-primary/90 transition-all">
                  <Upload className="w-4 h-4" /> Upload Photos
                  <input
                    type="file" multiple accept="image/*" className="hidden"
                    onChange={(e) => { setSelectedAdminCategory(activeFilter !== "All" ? activeFilter : categories[0]); handleFilesSelected(e); }}
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Masonry Grid ─────────────────────────────────────── */}
        <div className="relative z-10 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredWorks.map((w, i) => (
            <div
              key={`${w.src}-${i}`}
              className="reveal image-zoom group relative block w-full break-inside-avoid text-left rounded-sm overflow-hidden border border-border/30 bg-muted/20"
              style={{ transitionDelay: `${(i % 6) * 0.05}s` }}
            >
              {/* Use next/image for automatic WebP conversion + lazy loading + optimized sizes */}
              <div
                className={`relative w-full ${w.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={w.src}
                  alt={w.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={72}
                  loading={i < 6 ? "eager" : "lazy"}
                  className="object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoH BwYIDAoMCwsKCwsNCxAQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkU DQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAAR CAARABLAMA2JAAIRAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgUEB//EACMQAAIBBAMBAQEAAAAAAAAA AAECBAMFEiExUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwD AQACEQMRAARAALFZG5OiWVhJSWm2qy7eV2oZ2W4uqXYJBXmB1oeQiPkM5H/9k="
                />
              </div>
              {!adminLocked && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteWork(w, e)}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/70 hover:bg-red-600 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div
                onClick={() => setLightboxIndex(i)}
                className="gallery-overlay group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 cursor-pointer"
              >
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-medium block mb-1">{w.cat}</span>
                  <h3 className="font-display text-xl text-white">{w.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MODAL: Admin Security PIN ─────────────────────────── */}
      {pinModalOpen && (
        <div
          className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setPinModalOpen(false);
            setPinInput("");
            setPinError("");
            setShowPin(false);
          }}
        >
          <div
            className="bg-[#121214] border border-[#d4af37]/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setPinModalOpen(false);
                setPinInput("");
                setPinError("");
                setShowPin(false);
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-4 text-[#d4af37]">
              <Lock className="w-5 h-5" />
            </div>

            <h3 className="font-display text-xl text-white mb-1.5 tracking-wide">
              ADMIN ACCESS
            </h3>
            <p className="text-white/50 text-xs mb-6 leading-relaxed">
              Enter security PIN to unlock admin controls and AI caption management.
            </p>

            <form onSubmit={handleVerifyPin} autoComplete="off" className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    id="admin_security_pin_field"
                    name="admin_security_token_code"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPinInput(val);
                      if (pinError) setPinError("");
                    }}
                    placeholder={showPin ? "PIN" : "• • • • • •"}
                    className="w-full text-center text-2xl tracking-[0.35em] pl-10 pr-10 py-3 bg-[#0a0a0c] border border-white/20 rounded-xl text-[#d4af37] focus:outline-none focus:border-[#d4af37] placeholder:text-white/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#d4af37] transition-colors p-1 focus:outline-none"
                    title={showPin ? "Hide PIN" : "Show PIN"}
                    tabIndex={-1}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {pinError && (
                  <p className="text-xs text-red-400 mt-2 font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPinModalOpen(false);
                    setPinInput("");
                    setPinError("");
                    setShowPin(false);
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#c5a028] transition-colors"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Rename Category ───────────────────────────── */}
      {editCategoryModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditCategoryModalOpen(false)}>
          <div className="bg-[#121214] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#d4af37]" /> Rename Category
              </h3>
              <button type="button" onClick={() => setEditCategoryModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Rename <span className="text-white font-semibold">&ldquo;{activeFilter === "All" ? selectedAdminCategory : activeFilter}&rdquo;</span>. All photos in this category will be updated automatically.
            </p>
            <form onSubmit={handleRenameCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">New Category Name</label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="Enter new category name..."
                  autoFocus
                  className="w-full px-4 py-3 bg-[#0a0a0c] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEditCategoryModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-white/10 text-white/70 hover:text-white text-xs uppercase tracking-wider transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={!editCategoryName.trim() || editCategoryName.trim() === (activeFilter === "All" ? selectedAdminCategory : activeFilter)}
                  className="px-5 py-2.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider hover:bg-[#c5a028] disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add New Category ──────────────────────────── */}
      {newCategoryModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setNewCategoryModalOpen(false)}>
          <div className="bg-[#121214] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-foreground">Add New Category</h3>
              <button type="button" onClick={() => setNewCategoryModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Create a new category to organise and showcase your photoshoot collections.</p>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Category Name</label>
                <input
                  type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Baby Shoot, Fashion, Sports" autoFocus
                  className="w-full px-4 py-3 bg-[#0a0a0c] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setNewCategoryModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-white/10 text-white/70 hover:text-white text-xs uppercase tracking-wider transition-colors">Cancel</button>
                <button type="submit" disabled={!newCategoryName.trim()} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Upload Images ─────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !uploading && setUploadModalOpen(false)}>
          <div className="bg-[#121214] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload {selectedFiles.length} Image(s)
              </h3>
              {!uploading && <button type="button" onClick={() => setUploadModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>}
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Target Category</label>
                <select
                  value={selectedAdminCategory}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setSelectedAdminCategory(newCat);
                    if (selectedFiles.length > 0) {
                      setUploadTitle(generateAiTitle(newCat, selectedFiles[0].name));
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> Title (Auto-Generated by AI)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFiles.length > 0) {
                        setUploadTitle(generateAiTitle(selectedAdminCategory, selectedFiles[0].name, undefined, true));
                      }
                    }}
                    className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 transition-colors"
                    title="Generate another AI title"
                  >
                    <RotateCcw className="w-3 h-3" /> Regenerate AI Title
                  </button>
                </div>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="AI title generated according to image..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="bg-[#0a0a0c] border border-white/10 rounded-lg p-3 max-h-36 overflow-y-auto">
                <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-2 font-medium">Selected Files ({selectedFiles.length}):</span>
                <ul className="space-y-1">
                  {selectedFiles.map((f, idx) => (
                    <li key={idx} className="text-xs text-white/80 flex items-center justify-between">
                      <span className="truncate max-w-[280px]">{f.name}</span>
                      <span className="text-white/40 text-[10px]">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button type="button" disabled={uploading} onClick={() => setUploadModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-white/10 text-white/70 hover:text-white text-xs uppercase tracking-wider transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={uploading} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Start Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL ───────────────────────────────────── */}
      {activeLightboxItem && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8" onClick={() => setLightboxIndex(null)}>
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-foreground z-10">
            <div className="flex items-center gap-3">
              <div>
                <span className="font-display text-lg tracking-wide block sm:inline mr-2">{activeLightboxItem.title}</span>
                <span className="text-xs uppercase tracking-widest text-primary font-medium">{activeLightboxItem.cat}</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground px-2 py-0.5 rounded border border-border">
                {lightboxIndex + 1} / {filteredWorks.length}
              </span>
            </div>
            <button className="text-foreground text-3xl hover:text-primary transition-colors focus:outline-none p-2" onClick={() => setLightboxIndex(null)}>✕</button>
          </div>
          {filteredWorks.length > 1 && (
            <button className="absolute left-4 md:left-8 text-foreground text-4xl hover:text-primary transition-colors focus:outline-none z-10 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => prev !== null ? (prev - 1 + filteredWorks.length) % filteredWorks.length : 0); }}>‹</button>
          )}
          <img src={activeLightboxItem.src} alt={activeLightboxItem.title} className="max-h-[82vh] max-w-full object-contain shadow-2xl rounded-sm select-none" onClick={(e) => e.stopPropagation()} />
          {filteredWorks.length > 1 && (
            <button className="absolute right-4 md:right-8 text-foreground text-4xl hover:text-primary transition-colors focus:outline-none z-10 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => prev !== null ? (prev + 1) % filteredWorks.length : 0); }}>›</button>
          )}
        </div>
      )}
    </>
  );
}
