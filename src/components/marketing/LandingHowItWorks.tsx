import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileUp,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/Button";
import { scrollToId } from "./LandingNavbar";
import { ROUTES } from "../../router/routes";

const steps = [
  {
    icon: FileUp,
    title: "Upload your media file",
    description:
      "Upload your supported video or audio file directly to your private workspace. Large files are handled securely and prepared for analysis.",
    points: [
      "Direct video upload (MP4, MOV, WebM)",
      "Direct audio file upload (MP3, WAV)",
      "Files encrypted during processing",
    ],
  },
  {
    icon: ScanSearch,
    title: "PreScan evaluates audio and metadata",
    description:
      "The audio dialogue is transcribed and evaluated across Community Guidelines, Advertiser Suitability, copyright signals, and metadata consistency.",
    points: [
      "Opening-hook and profanity language check",
      "Sensitive topic and context detection",
      "Metadata title-description consistency",
    ],
  },
  {
    icon: FileCheck2,
    title: "Review structured findings",
    description:
      "Instead of vague AI output, you receive an organized report with exact timestamps, evidence excerpts, severity scores, and recommended actions.",
    points: [
      "Timestamped audio and policy findings",
      "Evidence excerpts for quicker decisions",
      "Actionable options: keep, mute, edit, or remove",
    ],
  },
  {
    icon: Sparkles,
    title: "Publish with complete context",
    description:
      "PreScan does not make the final decision for you. It gives your team visibility into risk so you can publish with confidence and creative control.",
    points: [
      "Full creator editorial ownership",
      "No automatic publishing or takedowns",
      "Straightforward findings and guidance",
    ],
  },
];

interface LandingHowItWorksProps { onNavigate: (route: string) => void; }

export default function HowItWorks({ onNavigate }: LandingHowItWorksProps) {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20 border-t border-border/60 bg-background">
      <div className="px-6 py-16 text-center md:px-12 md:py-20 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            From upload to insight
          </span>
          <h2 className="mt-4 font-display text-4xl leading-none tracking-tight text-foreground md:text-[3.6rem]">
            How PreScan <span className="italic">Works</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            A seamless pre-publish quality assurance stop that turns hours of manual checking into a two-minute automated report.
          </p>
          <Button onClick={() => onNavigate(ROUTES.SIGNUP)} className="mt-5 h-10 px-5 text-[13px]">
            Start scanning free
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>

      <div className="border-t border-border/60 px-6 py-14 md:px-12 md:py-20 lg:px-20">
        <div className="relative mx-auto max-w-3xl space-y-6 before:absolute before:bottom-10 before:left-6.25 before:top-10 before:hidden before:w-px before:bg-border md:before:block">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative grid gap-5 rounded-2xl border border-border bg-background p-5 shadow-[0_1px_8px_rgba(0,0,0,0.035)] md:grid-cols-[54px_1fr] md:p-6"
            >
              <div className="relative z-10 flex items-start gap-3 md:block">
                <span className="inline-flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                  <span className="text-[11px] font-semibold">0{index + 1}</span>
                </span>
                <span className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-foreground md:mx-auto md:flex">
                  <step.icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}