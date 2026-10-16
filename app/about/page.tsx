"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";


function AnimatedCounter({ target, suffix = "", className }: { target: number; suffix?: string; className?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className={className || "font-display text-4xl md:text-5xl text-primary"}>
      {count}{suffix}
    </div>
  );
}

const timeline = [
  { year: "Childhood", title: "Finding the Spark", desc: "Despite hardship and losing his father early, seeing a camera for the first time sparked a lifelong dream." },
  { year: "2006", title: "Humble Beginnings", desc: "Started working at a studio for ₹500 a month, learning the art of photography up close." },
  { year: "2010", title: "Sivaa Studio is Born", desc: "Started his own studio with a Panasonic video camera, turning a dream into reality." },
  { year: "2010 - Today", title: "A Growing Legacy", desc: "Successfully captured 1000+ events across 14+ states with over 20 years of passion-driven experience." },
  { year: "Present", title: "The Heart of Our Studio", desc: "A trusted name built on passion and perseverance, believing every celebration is a memory worth preserving forever." },
];

export default function About() {
  useScrollReveal();

  return (
    <>
      {/* Story & Stats Layout */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column: Text Content */}
          <div className="space-y-12 pr-0 lg:pr-8">
            <div className="reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-4">Meet the Founder</p>
              <h1 className="font-display text-foreground text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
                The Vision Behind <br className="hidden md:block"/>the Lens
              </h1>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  Born in a small remote village in Thiruvallur District, the founder of Sivaa Studio began life as a joyful and playful boy whose childhood changed too soon after losing his father. From a young age, he carried responsibilities beyond his years, facing hardship and poverty with courage.
                </p>
                <p>
                  Even during difficult times, one moment changed everything — seeing a camera for the first time. That spark created a dream: to capture emotions, preserve memories, and tell stories through the lens. Today, that same vision continues to guide Sivaa Studio.
                </p>
              </div>
            </div>

            <div className="reveal">
              <h3 className="font-display text-foreground text-2xl md:text-3xl mb-4">Founder’s Story</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                In 2006, he was offered a job at a studio for ₹500 per month. There, he saw a camera up close for the first time and slowly learned the art of photography. With determination and belief in himself, he started his own studio in 2010. His first camera was a Panasonic video camera — a humble beginning to an inspiring journey.
              </p>
            </div>

            <div className="reveal">
              <h3 className="font-display text-foreground text-2xl md:text-3xl mb-4">Behind the Lens</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                From 2010 to today, with over 20 years of experience, he has successfully captured 1000+ events across 14+ states, serving 1000+ happy customers. Every frame reflects dedication, creativity, and years of hard-earned expertise.
              </p>
            </div>

            <div className="reveal">
              <h3 className="font-display text-foreground text-2xl md:text-3xl mb-4">The Heart of Our Studio</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                What began as a struggle and a dream has become Sivaa Studio — a trusted name built on passion, perseverance, and timeless storytelling. For us, every celebration is more than an event; it is a memory worth preserving forever.
              </p>
            </div>
          </div>

          {/* Right Column: Image and Stats */}
          <div className="space-y-6 lg:sticky lg:top-32">
            {/* Image Slot */}
            <div className="reveal rounded-[2rem] overflow-hidden aspect-[4/3] relative bg-muted shadow-lg">
              <Image src="/founder.jpg" alt="Founder of Sivaa Studio" fill sizes="(max-width: 1024px) 100vw, 45vw" quality={75} className="object-cover object-top" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 flex flex-col items-start justify-center reveal">
                <AnimatedCounter target={20} suffix="+" className="font-display text-4xl md:text-5xl text-foreground font-bold mb-2" />
                <p className="text-muted-foreground text-sm md:text-base">Years Experience</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 flex flex-col items-start justify-center reveal" style={{ transitionDelay: '0.1s' }}>
                <AnimatedCounter target={1000} suffix="+" className="font-display text-4xl md:text-5xl text-foreground font-bold mb-2" />
                <p className="text-muted-foreground text-sm md:text-base">Events Captured</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 flex flex-col items-start justify-center reveal" style={{ transitionDelay: '0.2s' }}>
                <AnimatedCounter target={14} suffix="+" className="font-display text-4xl md:text-5xl text-foreground font-bold mb-2" />
                <p className="text-muted-foreground text-sm md:text-base">States</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-3xl shadow-sm border border-border/50 flex flex-col items-start justify-center reveal" style={{ transitionDelay: '0.3s' }}>
                <AnimatedCounter target={1000} suffix="+" className="font-display text-4xl md:text-5xl text-foreground font-bold mb-2" />
                <p className="text-muted-foreground text-sm md:text-base">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 lg:px-12 max-w-[1400px] mx-auto overflow-hidden">
        <div className="text-center mb-20 reveal">
          <p className="text-primary text-sm tracking-widest uppercase mb-3 font-bold">Our Journey</p>
          <h2 className="font-display text-foreground text-4xl md:text-5xl">The Timeline</h2>
        </div>
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[22px] md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
          
          <div className="space-y-16 md:space-y-24">
            {timeline.map((t, i) => (
              <div key={t.year} className="reveal relative flex flex-col md:flex-row items-start w-full group" style={{ transitionDelay: `${i * 0.1}s` }}>
                
                {/* Center Dot */}
                <div className="absolute left-[22px] md:left-1/2 w-4 h-4 bg-primary rounded-full -translate-x-1/2 mt-1 z-10 shadow-[0_0_0_8px_hsl(var(--background))] transition-transform duration-300 group-hover:scale-125" />

                {/* Desktop Left Side */}
                <div className="hidden md:flex w-1/2 flex-col items-end pr-12 lg:pr-20 text-right">
                  {i % 2 === 0 && (
                    <>
                      <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2">{t.year}</span>
                      <h3 className="font-display text-foreground text-2xl lg:text-3xl mb-4">{t.title}</h3>
                      <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-md">{t.desc}</p>
                    </>
                  )}
                </div>

                {/* Desktop Right Side / Mobile Everything */}
                <div className={`flex w-full md:w-1/2 flex-col items-start pl-16 md:pl-12 lg:pl-20 ${i % 2 === 0 ? "md:hidden" : ""}`}>
                  <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2">{t.year}</span>
                  <h3 className="font-display text-foreground text-2xl lg:text-3xl mb-4">{t.title}</h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-md">{t.desc}</p>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
