import { useEffect, useState } from "react";
import type React from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../router/routes";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
];

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

interface LandingNavbarProps { onNavigate: (route: string) => void; }

export default function Navbar({ onNavigate }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    setOpen(false);
    // small timeout so mobile menu closes first
    setTimeout(() => scrollToId(id), 40);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body">
        {/* Left: Logo */}
        <a
          href="#home"
          onClick={(e) => handleClick(e, "#home")}
          className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-foreground"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
            <Sparkles className="h-4 w-4" />
          </span>
          PreScan
        </a>

        {/* Right: desktop links + CTA */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={(e) => handleClick(e, l.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onNavigate(ROUTES.SIGNUP);
            }}
            className="rounded-full px-5 text-sm font-medium"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            size="sm"
            className="rounded-full px-4 text-[13px]"
            onClick={() => onNavigate(ROUTES.SIGNUP)}
          >
            Get Started
          </Button>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden mx-4 mb-4 rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-2 shadow-xl">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => handleClick(e, l.href)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
