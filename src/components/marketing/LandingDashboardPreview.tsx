import { motion } from "motion/react";
import {
  BadgeCheck,
  BadgeDollarSign,
  Bell,
  ChevronDown,
  Copyright,
  FilePlus2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MoreVertical,
  Plug,
  Plus,
  ScanSearch,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Users,
  Wallet,
  Zap,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "../../utils/cn";

const sidebarMain = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ScanSearch, label: "Scans", badge: "12" },
  { icon: FileText, label: "Reports" },
  { icon: FolderKanban, label: "Projects", chevron: true },
  { icon: Users, label: "Team" },
  { icon: Plug, label: "Integrations" },
  { icon: Wallet, label: "Billing", chevron: true },
];

const sidebarChecks = [
  { icon: Copyright, label: "Copyright" },
  { icon: ShieldCheck, label: "Policy" },
  { icon: BadgeDollarSign, label: "Monetization" },
  { icon: Tags, label: "Metadata" },
];

const actions = [
  { icon: Zap, label: "New Scan", primary: true },
  { icon: Copyright, label: "Copyright" },
  { icon: ShieldCheck, label: "Policy Check" },
  { icon: Shield, label: "Safety" },
  { icon: BadgeDollarSign, label: "Monetization" },
  { icon: FilePlus2, label: "New Report" },
];

const risks = [
  { icon: Copyright, label: "Copyright", value: "99.2%", tint: "bg-blue-50 text-blue-600" },
  { icon: ShieldCheck, label: "Policy", value: "97.8%", tint: "bg-emerald-50 text-emerald-600" },
  { icon: BadgeDollarSign, label: "Monetization", value: "98.6%", tint: "bg-amber-50 text-amber-600" },
];

const scans = [
  { date: "Jul 28, 2024", video: "Summer Vlog Ep.24 — Beach Day", finding: "2 warnings", status: "Review", tone: "amber" as const },
  { date: "Jul 27, 2024", video: "I Tested $1 vs $1000 Hotel", finding: "0 issues", status: "Cleared", tone: "green" as const },
  { date: "Jul 26, 2024", video: "Gaming Highlights #42", finding: "0 issues", status: "Cleared", tone: "green" as const },
  { date: "Jul 25, 2024", video: "Podcast: Creator Economy", finding: "1 note", status: "Cleared", tone: "green" as const },
];

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.21, 0.65, 0.36, 1] }}
      className="mt-8 w-full max-w-5xl px-4 sm:px-6"
    >
      <div
        className="rounded-2xl overflow-hidden p-3 md:p-4"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "var(--shadow-dashboard)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="rounded-xl overflow-hidden bg-background border border-border/60 shadow-sm text-[11px] select-none pointer-events-none text-left">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60 bg-background">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground text-[11px] font-semibold shadow-sm">
                P
              </span>
              <span className="text-[12px] font-semibold text-foreground">PreScan</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>

            <div className="hidden md:flex flex-1 max-w-sm mx-4 items-center gap-2 rounded-lg bg-secondary/80 px-2.5 py-1.5 text-muted-foreground">
              <Search className="h-3 w-3 shrink-0" />
              <span className="truncate text-[11px]">Search scans, videos, or reports...</span>
              <span className="ml-auto rounded border border-border bg-background px-1 text-[10px] font-medium leading-4">
                ⌘K
              </span>
            </div>
            <div className="flex md:hidden flex-1" />

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-[11px] font-medium shadow-sm">
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">New Scan</span>
                <span className="sm:hidden">Scan</span>
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-foreground">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold">
                JC
              </span>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <aside className="hidden sm:flex w-40 shrink-0 flex-col px-2 py-3 border-r border-border/60 bg-background">
              <div className="flex flex-col gap-0.5">
                {sidebarMain.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors",
                      item.active
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="ml-auto rounded-full bg-secondary border border-border/60 px-1.5 text-[10px] font-medium text-foreground leading-4">
                        {item.badge}
                      </span>
                    )}
                    {"chevron" in item && item.chevron && (
                      <ChevronDown className="ml-auto h-3 w-3 opacity-70" />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-2.5 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Risk Checks
              </div>
              <div className="flex flex-col gap-0.5">
                {sidebarChecks.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground"
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 bg-secondary/30 px-3 sm:px-4 py-3">
              <div className="text-sm font-semibold text-foreground">Welcome, Jane</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Here&apos;s your channel safety overview.
              </div>

              {/* Action pills */}
              <div className="scrollbar-none mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {actions.map((a) => (
                  <span
                    key={a.label}
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-medium shrink-0",
                      a.primary
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "bg-background border border-border/70 text-foreground shadow-sm"
                    )}
                  >
                    <a.icon className="h-3 w-3" />
                    {a.label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-1.5 text-[10px] font-medium text-muted-foreground shrink-0">
                  <SlidersHorizontal className="h-3 w-3" />
                  Customize
                </span>
              </div>

              {/* Two cards */}
              <div className="mt-2 flex gap-3 flex-col sm:flex-row">
                {/* Health card */}
                <div className="flex-1 basis-0 rounded-xl border border-border/60 bg-background p-3 shadow-sm min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-foreground">Channel Health</span>
                    <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">98.4</span>
                    <span className="text-xs text-muted-foreground font-medium">% safe</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <span className="text-muted-foreground">Last 30 Days</span>
                    <span className="inline-flex items-center gap-0.5 font-medium text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      +12%
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-medium text-red-500">
                      <ArrowDownRight className="h-3 w-3" />
                      -3%
                    </span>
                  </div>
                  <div className="mt-2 h-20 w-full">
                    <svg
                      viewBox="0 0 300 80"
                      preserveAspectRatio="none"
                      className="h-full w-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="prescanChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,66 C18,62 28,56 48,53 C68,50 78,59 98,55 C118,51 128,36 148,38 C168,40 178,49 198,43 C218,37 228,22 248,19 C268,16 286,10 300,7 L300,80 L0,80 Z"
                        fill="url(#prescanChart)"
                      />
                      <path
                        d="M0,66 C18,62 28,56 48,53 C68,50 78,59 98,55 C118,51 128,36 148,38 C168,40 178,49 198,43 C218,37 228,22 248,19 C268,16 286,10 300,7"
                        fill="none"
                        stroke="hsl(239 84% 67%)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Risk checks card */}
                <div className="flex-1 basis-0 rounded-xl border border-border/60 bg-background p-3 shadow-sm min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-foreground">Risk Checks</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      <MoreVertical className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="mt-1">
                    {risks.map((r) => (
                      <div key={r.label} className="flex items-center justify-between py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-md",
                              r.tint
                            )}
                          >
                            <r.icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs text-foreground">{r.label}</span>
                        </span>
                        <span className="text-xs font-medium text-foreground tabular-nums">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent scans table */}
              <div className="mt-3 rounded-xl border border-border/60 bg-background p-3 shadow-sm">
                <div className="text-[12px] font-semibold text-foreground">Recent Scans</div>
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full min-w-105 text-left text-[11px]">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="font-medium py-1.5 pr-2 text-[10px]">Date</th>
                        <th className="font-medium py-1.5 pr-2 text-[10px]">Video</th>
                        <th className="font-medium py-1.5 pr-2 text-[10px]">Findings</th>
                        <th className="font-medium py-1.5 text-[10px] text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((s) => (
                        <tr key={s.video} className="border-t border-border/50">
                          <td className="py-2 pr-2 text-muted-foreground whitespace-nowrap">{s.date}</td>
                          <td className="max-w-45 truncate py-2 pr-2 font-medium text-foreground">
                            {s.video}
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground whitespace-nowrap">{s.finding}</td>
                          <td className="py-2 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                                s.tone === "amber"
                                  ? "bg-amber-50 text-amber-700 border-amber-200/70"
                                  : "bg-green-50 text-green-700 border-green-200/70"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  s.tone === "amber" ? "bg-amber-500" : "bg-green-500"
                                )}
                              />
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
