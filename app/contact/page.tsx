"use client";

import { useState, FormEvent } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { 
  MapPin, 
  Phone, 
  Instagram, 
  ChevronDown, 
  ExternalLink,
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  Clock, 
  RotateCcw, 
  Camera, 
  ArrowUpRight 
} from "lucide-react";

const category1Options = [
  "Wedding Shoot",
  "Engagement",
  "Maternity Shoot",
  "Baby Shoot",
  "Modeling",
  "Sreemantham",
  "Other / Custom",
];

const category2Options = [
  "Drone",
  "Candid photos",
  "Candid video",
  "Traditional photo",
  "Traditional video",
  "LED wall",
  "Second camera (audience camera)",
];

function CustomSelect({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <label className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-primary mb-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 border-b border-border hover:border-primary/60 transition-colors duration-300 text-left focus:outline-none"
      >
        <span className={`text-sm font-medium ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 bg-[#141414] border border-border shadow-2xl shadow-black/60 mt-1">
          <button
            type="button"
            onClick={() => { onChange(""); onToggle(); }}
            className="w-full text-left px-4 py-3 text-sm text-muted-foreground bg-zinc-700/60 hover:bg-zinc-600/60 transition-colors border-b border-border"
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); onToggle(); }}
              className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200 border-b border-border/40 last:border-0"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
];

export default function Contact() {
  useScrollReveal();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category1: "",
    category2: "",
    message: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<typeof formData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Tracks which dropdown is currently open; null means none
  const [activeSelect, setActiveSelect] = useState<"cat1" | "cat2" | null>(null);

  const toggleSelect = (key: "cat1" | "cat2") =>
    setActiveSelect((prev) => (prev === key ? null : key));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const fullPhone = `${countryCode} ${formData.phone}`.trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: fullPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setLastSubmitted({ ...formData, phone: fullPhone });
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        category1: "",
        category2: "",
        message: "",
      });
      setCountryCode("+91");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="pt-32 pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            Get In Touch
          </p>
          <h1 className="font-display text-foreground text-4xl md:text-6xl lg:text-7xl">
            Let&apos;s Document Your Story.
          </h1>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* ── LEFT: Info cards + map ── */}
          <div className="space-y-4 reveal">
            {/* Location Card */}
            <div className="bg-card/30 border border-border p-6 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 p-2.5 bg-primary/10 rounded-full ring-1 ring-primary/20 shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold mb-2">
                    Location
                  </p>
                  <p className="text-foreground/80 text-sm leading-relaxed">
                    Chittoor District
                    <br />
                    Andhra Pradesh, 517001
                  </p>
                  <a
                    href="https://maps.app.goo.gl/VMZNPxRaKWvPSHtk6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary text-xs mt-3 hover:text-primary/70 transition-colors duration-200 underline underline-offset-4 decoration-primary/40"
                  >
                    View on Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-card/30 border border-border p-6 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 p-2.5 bg-primary/10 rounded-full ring-1 ring-primary/20 shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold mb-2">
                    Phone
                  </p>
                  <div className="space-y-1">
                    <p className="text-foreground/80 text-sm">
                      <a href="tel:+917330915802" className="hover:text-primary transition-colors">
                        +91 73309 15802
                      </a>
                    </p>
                    <p className="text-foreground/80 text-sm">
                      <a href="tel:+919494069857" className="hover:text-primary transition-colors">
                        +91 94940 69857
                      </a>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                    <a
                      href="tel:+917330915802"
                      className="inline-flex items-center gap-1.5 text-primary text-xs hover:text-primary/70 transition-colors duration-200 underline underline-offset-4 decoration-primary/40"
                    >
                      Call +91 73309 15802
                    </a>
                    <a
                      href="tel:+919494069857"
                      className="inline-flex items-center gap-1.5 text-primary text-xs hover:text-primary/70 transition-colors duration-200 underline underline-offset-4 decoration-primary/40"
                    >
                      Call +91 94940 69857
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Card */}
            <div className="bg-card/30 border border-border p-6 hover:border-primary/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 p-2.5 bg-primary/10 rounded-full ring-1 ring-primary/20 shrink-0">
                  <Instagram className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-4 w-full">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-primary font-semibold">
                    Instagram
                  </p>
                  {/* Main studio */}
                  <div>
                    <p className="text-foreground/80 text-sm">@sivaa_studio_chittoor</p>
                    <a
                      href="https://www.instagram.com/sivaa_studio_chittoor?stkn=MTJ4eGs0cGFpYjE5eA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary text-xs mt-2 hover:text-primary/70 transition-colors duration-200 underline underline-offset-4 decoration-primary/40"
                    >
                      Follow Gallery
                    </a>
                  </div>
                  {/* Baby studio */}
                  <div>
                    <p className="text-foreground/80 text-sm">@tiny_toes_babystudio</p>
                    <a
                      href="https://www.instagram.com/tiny_toes_babystudio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary text-xs mt-2 hover:text-primary/70 transition-colors duration-200 underline underline-offset-4 decoration-primary/40"
                    >
                      Follow Baby Studio
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="aspect-video border border-border overflow-hidden">
              <iframe
                title="Sivaa Studio Location"
                src="https://maps.google.com/maps?q=13.2030077,79.0955887&hl=en&z=16&output=embed"
                className="w-full h-full border-0 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* ── RIGHT: Inquiry Form or Luxury Animated Confirmation ── */}
          <div className="bg-card/30 border border-border p-8 md:p-10 reveal relative overflow-hidden transition-all duration-700">
            {submitted && lastSubmitted ? (
              <div className="py-2 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Ambient gold glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Gold Checkmark Ring */}
                <div className="relative mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-primary/30 via-primary/20 to-amber-400/20 border border-primary/60 ring-8 ring-primary/10 shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-in zoom-in-50 duration-700">
                  <CheckCircle2 className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                  <div className="absolute -top-1 -right-1 p-1 rounded-full bg-primary text-black animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 fill-black" />
                  </div>
                </div>

                {/* Main Titles */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] tracking-[0.25em] uppercase font-bold">
                    ✦ Inquiry Confirmed ✦
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl text-foreground mt-3 mb-2">
                    Your Vision Is In Motion.
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-foreground font-semibold">{lastSubmitted.name}</span>. 
                    Your query has been transferred directly into our studio schedule &amp; Google Sheet.
                  </p>
                </div>

                {/* Inquiry Summary Slate */}
                <div className="bg-black/60 border border-border/80 rounded-xl p-5 text-left space-y-3.5 backdrop-blur-md shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[11px] tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-primary" /> Service Selected
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {lastSubmitted.category1 || "Photography Shoot"}
                    </span>
                  </div>

                  {lastSubmitted.category2 && (
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-[11px] tracking-wider uppercase text-muted-foreground">
                        Requirements
                      </span>
                      <span className="text-sm font-medium text-foreground/90 text-right">
                        {lastSubmitted.category2}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" /> Response Time
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      Within 2 Hours (Guaranteed)
                    </span>
                  </div>
                </div>

                {/* Instant Actions */}
                <div className="space-y-3 pt-2">
                  {/* WhatsApp Direct Chat */}
                  <a
                    href={`https://wa.me/919494069857?text=${encodeURIComponent(
                      `Hello Sivaa Studio! I just submitted an inquiry for "${lastSubmitted.category1 || "Photography"}". My name is ${lastSubmitted.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 hover:shadow-emerald-600/30 transition-all duration-300 group"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Chat Directly on WhatsApp</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>

                  <div className="flex items-center justify-center gap-4 text-xs pt-1">
                    <a
                      href="tel:+917330915802"
                      className="text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-primary" /> +91 73309 15802
                    </a>
                    <span className="text-border">•</span>
                    <a
                      href="tel:+919494069857"
                      className="text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-primary" /> +91 94940 69857
                    </a>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors py-1 flex items-center gap-1.5 text-xs underline underline-offset-4"
                    >
                      <RotateCcw className="w-3 h-3" /> Send Another Inquiry
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl text-primary mb-1">Send an Inquiry</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Fill out the details below, and our team will get back to you shortly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Row 1: Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-primary mb-1">
                        Your Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-border py-3 text-foreground text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors duration-300"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-primary mb-1">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-border py-3 text-foreground text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors duration-300"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone + Category 1 */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-primary mb-1">
                        Phone Number <span className="text-primary">*</span>
                      </label>
                      <div className="flex items-stretch border-b border-border focus-within:border-primary transition-colors duration-300">
                        {/* Country Code Selector */}
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown((p) => !p)}
                            className="flex items-center gap-1 pr-2 py-3 text-sm text-foreground hover:text-primary transition-colors focus:outline-none"
                          >
                            <span>{COUNTRY_CODES.find((c) => c.code === countryCode)?.flag}</span>
                            <span className="text-xs text-muted-foreground">{countryCode}</span>
                            <ChevronDown className={`w-3 h-3 text-primary transition-transform duration-200 ${showCountryDropdown ? "rotate-180" : ""}`} />
                          </button>
                          {showCountryDropdown && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                              <div className="absolute z-50 top-full left-0 w-52 bg-[#141414] border border-border shadow-2xl shadow-black/60 max-h-60 overflow-y-auto mt-1">
                                {COUNTRY_CODES.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => {
                                      setCountryCode(c.code);
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-primary/10 hover:text-primary transition-colors border-b border-border/30 last:border-0 ${
                                      countryCode === c.code ? "bg-primary/10 text-primary" : "text-foreground"
                                    }`}
                                  >
                                    <span className="text-base">{c.flag}</span>
                                    <span className="flex-1 truncate text-xs">{c.name}</span>
                                    <span className="text-xs text-muted-foreground">{c.code}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        {/* Number Input */}
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="flex-1 bg-transparent py-3 pl-2 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none"
                          placeholder="XXXXX XXXXX"
                        />
                      </div>
                    </div>
                    <CustomSelect
                      label="Category 1"
                      required
                      placeholder="Select Category 1"
                      options={category1Options}
                      value={formData.category1}
                      onChange={(val) => setFormData({ ...formData, category1: val })}
                      isOpen={activeSelect === "cat1"}
                      onToggle={() => toggleSelect("cat1")}
                    />
                  </div>

                  {/* Row 3: Category 2 */}
                  <CustomSelect
                    label="Category 2"
                    placeholder="Select Category 2"
                    options={category2Options}
                    value={formData.category2}
                    onChange={(val) => setFormData({ ...formData, category2: val })}
                    isOpen={activeSelect === "cat2"}
                    onToggle={() => toggleSelect("cat2")}
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-primary mb-1">
                      Share Details of Your Vision… <span className="text-primary">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 text-foreground text-sm placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors duration-300 resize-none"
                      placeholder="Tell us about your event, preferred date, location, style..."
                    />
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                      {errorMessage}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-xs tracking-[0.3em] uppercase font-semibold transition-all duration-500 flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-primary/50 text-primary-foreground border border-primary/50 cursor-not-allowed"
                        : "bg-transparent border border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Transferring Inquiry...
                      </span>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
