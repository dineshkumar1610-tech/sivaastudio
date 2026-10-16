"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import { Camera, MapPin, Users, Calendar, ArrowRight, Heart, Sparkles, Image as ImageIcon, Globe } from "lucide-react";

const heroSlides = [
  "/assets/hero-nature.jpg",
  "/assets/wedding12.png",
  "/assets/WEDDING SHOOT.png",
  "/assets/MOTHER AND BABY 1.jpg",
];

const stats = [
  { num: "20+", label: "Years Experience", icon: Calendar },
  { num: "1000+", label: "Events Captured", icon: Heart },
  { num: "14+", label: "States", icon: Globe },
  { num: "1000+", label: "Happy Customers", icon: Users },
];

const services = [
  {
    title: "Wedding Cinema",
    description: "Capturing the pure emotions and timeless traditions of your special day.",
    icon: Sparkles,
  },
  {
    title: "Pre-Wedding",
    description: "Telling your love story in breathtaking locations with creative vision.",
    icon: Camera,
  },
  {
    title: "Lifestyle Portraits",
    description: "Professional sessions that bring out your unique personality and style.",
    icon: ImageIcon,
  },
];

export default function Index() {
  useScrollReveal();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-svh overflow-hidden">
        {heroSlides.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{ transitionDuration: "2000ms", opacity: currentSlide === i ? 1 : 0 }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              quality={75}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              className="object-cover scale-110 animate-zoom-out"
            />
            {/* Subtle, 50% brighter overlay to let the photo colors and brightness shine through */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/50" />
          </div>
        ))}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
          <span
            className="text-primary text-xs md:text-sm font-bold tracking-[0.35em] uppercase mb-5 opacity-0 animate-fade-in-up bg-black/60 px-6 py-2 rounded-full border border-primary/50 backdrop-blur-md shadow-2xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
          >
            Your Story, Told Through Our Lens
          </span>
          <h1
            className="font-display text-white text-[clamp(2.8rem,8.5vw,6.5rem)] font-normal leading-[1.1] mb-6 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: "0.2s",
              textShadow: "0 4px 20px rgba(0,0,0,0.95), 0 8px 35px rgba(0,0,0,0.9)",
            }}
          >
            Sivaa Studio
          </h1>
          <p
            className="text-white font-medium text-lg md:text-2xl max-w-2xl tracking-wide mb-10 opacity-0 animate-fade-in-up"
            style={{
              animationDelay: "0.4s",
              textShadow: "0 2px 12px rgba(0,0,0,0.95)",
            }}
          >
            Preserving the poetry of your most precious moments through artistic lens and light.
          </p>
          <div className="flex gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link
              href="/collections"
              className="bg-primary text-primary-foreground font-bold px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 hover:scale-105 transition-all duration-300 rounded-sm border border-primary/60 shadow-2xl"
              style={{
                boxShadow: "0 4px 25px rgba(0,0,0,0.7), 0 0 20px hsl(var(--primary) / 0.5)",
              }}
            >
              Enter the Gallery
            </Link>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 bg-black/45 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group flex items-center py-1 focus:outline-none"
            >
              <div
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  currentSlide === i
                    ? "bg-primary w-10 shadow-[0_0_12px_hsl(var(--primary))]"
                    : "bg-white/40 w-5 group-hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* About / Intro Section */}
      <section className="py-24 px-6 lg:px-12 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <p className="text-primary text-sm tracking-widest uppercase mb-4">Our Heritage</p>
            <h2 className="font-display text-foreground text-4xl md:text-5xl mb-8 leading-tight">
              Masters of Light, <br />Narrators of Love.
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Based in the heart of Chittoor, Sivaa Studio has spent over 16 years perfecting the art of visual storytelling. We don't just take photographs; we document legacies.
              </p>
              <p>
                Every smile, every tear, and every silent promise is captured with a blend of cinematic flair and raw, authentic emotion. Our goal is to make every frame a piece of art that you'll cherish for generations.
              </p>
            </div>
          </div>
          <div className="reveal relative aspect-square lg:aspect-auto h-full min-h-[500px]">
             <div className="absolute inset-0 border border-primary/20 -translate-x-4 translate-y-4" />
             <Image
               src="/assets/sivaa ss.png"
               alt="Sivaa Studio Photographer"
               fill
               sizes="(max-width: 1024px) 100vw, 50vw"
               quality={75}
               className="object-cover relative z-10"
             />
          </div>
        </div>
      </section>

      {/* Premium Stats Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
            {stats.map((s, i) => (
              <div 
                key={s.label} 
                className={`reveal text-center px-8 ${i !== stats.length - 1 ? 'lg:border-r border-border/50' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/5 rounded-full ring-1 ring-primary/20">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="font-display text-5xl md:text-6xl text-primary mb-3">{s.num}</div>
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20 reveal">
          <p className="text-primary text-sm tracking-widest uppercase mb-4">What We Offer</p>
          <h2 className="font-display text-foreground text-4xl md:text-5xl">Our Specialties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div 
              key={service.title} 
              className="reveal p-10 border border-border bg-card/20 hover:bg-card/40 transition-all duration-500 group"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <service.icon className="w-10 h-10 text-primary mb-8 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="font-display text-2xl text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Single unified inquiry CTA */}
        <div className="reveal mt-14 text-center">
          <p className="text-muted-foreground text-sm tracking-wide mb-6">
            Interested in any of our services? Fill one form and we'll get back to you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-500 rounded-sm font-semibold shadow-lg shadow-primary/20"
          >
            Send an Inquiry <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Upgraded CTA Section */}
      <section className="py-32 bg-primary/5 relative">
        <div className="max-w-4xl mx-auto text-center px-6 reveal">
          <div className="inline-block p-2 bg-primary/10 rounded-full mb-8">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display text-foreground text-4xl md:text-6xl mb-8 leading-tight">
            Let's Create Your Story
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Book your photoshoot today and let us capture the moments that matter most. Every story is unique—let's make yours unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-primary text-primary-foreground px-12 py-5 text-sm tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-500 rounded-sm font-semibold shadow-xl shadow-primary/20"
            >
              Book a Shoot
            </Link>
            <Link
              href="/work"
              className="w-full sm:w-auto border border-border text-foreground px-12 py-5 text-sm tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-500 rounded-sm font-semibold"
            >
              View Portfolios
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
