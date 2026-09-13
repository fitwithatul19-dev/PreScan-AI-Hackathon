import { motion } from "motion/react";
import {
  Database,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { scrollToId } from "./LandingNavbar";
import { ROUTES } from "../../router/routes";

const principles = [
  {
    icon: Database,
    title: "Tenant Isolation & Partitioning",
    description:
      "Every creator workspace and production organization operates with isolated database scopes and strict role-based access boundaries.",
  },
  {
    icon: Server,
    title: "Transient Media Processing",
    description:
      "Uploaded video and audio streams are processed only for the duration of the scan transcription and evaluation pipeline.",
  },
  {
    icon: EyeOff,
    title: "Zero Public Model Training",
    description:
      "Your unreleased concepts, scripts, and metadata are never used to train public foundation models or shared with third parties.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Authentication & Sessions",
    description:
      "Authentication uses strong cryptographic tokens, encrypted session cookies, and modern industry-standard protocols.",
  },
  {
    icon: KeyRound,
    title: "Least-Privilege Integrations",
    description:
      "Connections to external platforms request only the minimum scopes required to fetch draft metadata and run a scan.",
  },
  {
    icon: Trash2,
    title: "Data Retention & Creator Deletion",
    description:
      "You maintain control over scans and project history. Deleting a report removes its associated metadata from our systems.",
  },
];

interface LandingSecurityProps { onNavigate: (route: string) => void; }

export default function Security({ onNavigate }: LandingSecurityProps) {
  return (
    <>
      <section id="security" className="w-full scroll-mt-20 bg-secondary/30 border-t border-border/60">
        <div className="px-6 py-16 text-center md:px-12 md:py-20 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust & Infrastructure
            </span>
            <h2 className="mt-4 font-display text-4xl leading-none tracking-tight text-foreground md:text-[3.6rem]">
              Security & Privacy <span className="italic">Architecture</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              PreScan is designed with security and privacy as foundational requirements. We protect your unreleased drafts, video scripts, and creator credentials.
            </p>
          </motion.div>
        </div>

        <div className="border-t border-border/60 bg-background px-6 py-16 md:px-12 md:py-20 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h3 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
                Core Security Principles
              </h3>
              <p className="mt-2 text-[13px] text-muted-foreground">
                How we safeguard unpublished creator intellectual property at every stage.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {principles.map((principle, index) => (
                <motion.article
                  key={principle.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
                  className="rounded-2xl border border-border bg-secondary/20 p-5 transition-colors hover:bg-secondary/50"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm">
                    <principle.icon className="h-4 w-4" />
                  </span>
                  <h4 className="mt-5 text-sm font-semibold tracking-tight text-foreground">
                    {principle.title}
                  </h4>
                  <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-border pt-8 text-center sm:flex-row sm:text-left"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Fingerprint className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Your content remains yours.</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">Private by design, protected throughout the scan.</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(ROUTES.SIGNUP)}
                className="rounded-full bg-primary px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start securely
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-background px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <button onClick={() => scrollToId("home")} className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            PreScan
          </button>
          <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
            <button onClick={() => scrollToId("features")} className="hover:text-foreground">Features</button>
            <button onClick={() => scrollToId("how-it-works")} className="hover:text-foreground">How It Works</button>
            <button onClick={() => scrollToId("security")} className="hover:text-foreground">Security</button>
          </div>
          <p className="text-[11px] text-muted-foreground">© 2026 PreScan. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}