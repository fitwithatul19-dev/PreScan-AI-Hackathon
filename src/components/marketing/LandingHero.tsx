import { motion } from "motion/react";
import { Play } from "lucide-react";
import { Button } from "../ui/Button";
import DashboardPreview from "./LandingDashboardPreview";
import { scrollToId } from "./LandingNavbar";
import { ROUTES } from "../../router/routes";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4";

interface LandingHeroProps { onNavigate: (route: string) => void; }

export default function Hero({ onNavigate }: LandingHeroProps) {
  return (
    <section id="home" className="relative overflow-hidden w-full">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Readability overlay */}
      <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-background/80 via-background/35 to-background" />
      <div className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(60%_50%_at_50%_20%,rgba(255,255,255,0.7),transparent)]" />

      {/* Handwritten annotations - desktop only */}
      <div className="pointer-events-none absolute left-[4%] top-[34%] z-5 hidden select-none lg:block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-hand text-[26px] leading-[1.05] text-background drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] -rotate-6"
        >
          Good
          <br />
          Ideas
          <br />
          Better
          <br />
          Videos
        </motion.div>
        <svg width="70" height="50" viewBox="0 0 70 50" className="mt-1 ml-2 -rotate-12 opacity-90">
          <path
            d="M8 4 C 14 18, 22 28, 40 36 M40 36 l-8 -3 M40 36 l-2 -8"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M38 2 C 44 14, 50 24, 58 32 M58 32 l-7 -1 M58 32 l-1 -7"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute right-[5%] top-[10%] z-5 hidden select-none lg:block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="font-hand rotate-10 text-[19px] leading-[1.1] text-accent drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
        >
          Scan Smarter
          <br />
          Create Safer
          <br />
          Grow Freely
        </motion.div>
        <svg width="30" height="44" viewBox="0 0 30 44" className="ml-8 mt-1 rotate-10">
          <path
            d="M15 2 C 15 16, 14 28, 8 38 M8 38 l7 -5 M8 38 l8 2"
            fill="none"
            stroke="hsl(239 84% 67%)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 pt-10 md:pt-14">
        {/* 1. Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body shadow-sm">
            Now with AI Scan v2
            <span aria-hidden>✨</span>
          </span>
        </motion.div>

        {/* 2. Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl text-balance"
        >
          The Future of
          <br />
          <span className="italic font-normal">Safer</span> Creation
        </motion.h1>

        {/* 3. Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-4 max-w-162.5 text-center font-body text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Pre-scan your videos with intelligent agents that check copyright, policy, and
          monetization — so you can publish with total confidence.
        </motion.p>

        {/* 4. CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-5 flex items-center gap-3"
        >
          <Button
            onClick={() => onNavigate(ROUTES.SIGNUP)}
            className="rounded-full px-6 h-11 text-sm font-medium font-body"
          >
            Start a scan
          </Button>
          <button
            aria-label="Play intro video"
            onClick={() => scrollToId("features")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border-0 bg-background shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background/80 transition-colors"
          >
            <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
          </button>
        </motion.div>

        {/* 5. Dashboard Preview */}
        <DashboardPreview />
      </div>

      {/* Bottom fade into next section + clip illusion */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-6 h-28 bg-linear-to-t from-background via-background/60 to-transparent" />
    </section>
  );
}
