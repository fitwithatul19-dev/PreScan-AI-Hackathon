import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeDollarSign,
  Copyright,
  Eye,
  Globe,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";
import { scrollToId } from "./LandingNavbar";

const features = [
  {
    icon: Copyright,
    title: "Copyright Detection",
    desc: "Find potential copyrighted music, clips, and visuals.",
    box: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShieldAlert,
    title: "Policy Violation Scan",
    desc: "Checks against YouTube's latest community guidelines.",
    box: "bg-red-50 text-red-500",
  },
  {
    icon: Eye,
    title: "Sensitive Content Check",
    desc: "Detects adult, violent, or harmful content.",
    box: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: BadgeDollarSign,
    title: "Monetization Readiness",
    desc: "Helps you avoid demonetization issues.",
    box: "bg-amber-50 text-amber-600",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    desc: "Get actionable recommendations to fix issues.",
    box: "bg-violet-50 text-violet-600",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    desc: "Scan content in multiple languages.",
    box: "bg-sky-50 text-sky-600",
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full bg-background scroll-mt-20">
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24 grid lg:grid-cols-[360px_1fr] gap-10 lg:gap-14 items-start">
        {/* Left copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:sticky lg:top-28"
        >
          <span className="inline-flex items-center rounded-full bg-accent/10 border border-accent/15 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-accent font-body">
            Powered by AI
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-[3.4rem] leading-[0.98] tracking-tight text-foreground">
            Everything you need
            <br />
            for a <span className="italic">safer</span> internet.
          </h2>
          <p className="mt-4 max-w-85 font-body text-[15px] leading-relaxed text-muted-foreground">
            Detect risks, protect your content, and stay compliant with AI-powered analysis —
            all in one place.
          </p>
          <Button
            onClick={() => scrollToId("how-it-works")}
            className="mt-6 rounded-full px-6 h-11 text-sm font-medium gap-2"
          >
            See how it works
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Right grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="rounded-2xl border border-border/70 bg-background p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.box}`}
              >
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-foreground font-body tracking-tight">
                {f.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground font-body">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
