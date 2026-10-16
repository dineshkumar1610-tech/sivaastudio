import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/assets/sivaa logo.png"
                alt="Sivaa Studio Logo"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <h3 className="font-display text-2xl text-foreground">Sivaa Studio</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Capturing moments that last forever. Based in Chittoor District, Andhra Pradesh.
            </p>
          </div>
          <div>
            <h4 className="text-sm tracking-widest uppercase text-primary mb-4">Navigate</h4>
            <ul className="space-y-3">
              {["Home", "About", "Collections", "Work", "Contact"].map((l) => (
                <li key={l}>
                  <Link
                    href={l === "Home" ? "/" : `/${l.toLowerCase()}`}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors duration-300"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm tracking-widest uppercase text-primary mb-4">Connect</h4>
            <div className="space-y-3.5 text-sm text-muted-foreground">
              <a
                href="https://maps.app.goo.gl/VMZNPxRaKWvPSHtk6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-primary transition-colors duration-300"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Chittoor District, Andhra Pradesh 517001
                </span>
              </a>

              <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                <a
                  href="tel:+917330915802"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+91 73309 15802</span>
                </a>
                <a
                  href="tel:+919494069857"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors duration-300"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+91 94940 69857</span>
                </a>
              </div>

              <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                <a
                  href="https://www.instagram.com/sivaa_studio_chittoor?stkn=MTJ4eGs0cGFpYjE5eA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors duration-300 group"
                >
                  <Instagram className="w-4 h-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span>@sivaa_studio_chittoor</span>
                </a>
                <a
                  href="https://www.instagram.com/tiny_toes_babystudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors duration-300 group"
                >
                  <Instagram className="w-4 h-4 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span>@tiny_toes_babystudio</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sivaa Studio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
