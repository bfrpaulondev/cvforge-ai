"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Hammer,
  ShieldCheck,
  Mail,
  Linkedin,
  FileDown,
  MessageSquare,
  Check,
  Copy,
  Sparkles,
  Loader2,
  ChevronDown,
  Star,
  Zap,
  Languages,
  Lock,
  RefreshCw,
  Globe2,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Upload,
  ClipboardPaste,
  Play,
  TrendingUp,
  Award,
  Rocket,
  Heart,
  Twitter,
  Github,
  LinkedinIcon,
  Youtube,
  CircleCheck,
  Crown,
  Euro,
  FileSearch,
  Target,
  PenLine,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { t, LOCALES, type Locale } from "@/lib/i18n";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useToast } from "@/hooks/use-toast";

/* ============================================================
   Types & Constants
   ============================================================ */

type TemplateId =
  | "europass"
  | "ats"
  | "modern"
  | "academic"
  | "tech"
  | "executive";

interface OptimizeResult {
  success: boolean;
  optimizedCV: string;
  atsScore: number | null;
  suggestions: string[];
  template: string;
}

interface Template {
  id: TemplateId;
  nameKey: string;
  descKey: string;
  gradient: string;
  ring: string;
  emoji: string;
  tag: string;
}

const TEMPLATES: Template[] = [
  {
    id: "europass",
    nameKey: "templates.europass.name",
    descKey: "templates.europass.desc",
    gradient: "from-blue-500 to-indigo-500",
    ring: "ring-blue-400",
    emoji: "🇪🇺",
    tag: "EU Official",
  },
  {
    id: "ats",
    nameKey: "templates.ats.name",
    descKey: "templates.ats.desc",
    gradient: "from-slate-600 to-slate-800",
    ring: "ring-slate-500",
    emoji: "🤖",
    tag: "ATS Pass",
  },
  {
    id: "modern",
    nameKey: "templates.modern.name",
    descKey: "templates.modern.desc",
    gradient: "from-fuchsia-500 to-pink-500",
    ring: "ring-fuchsia-400",
    emoji: "🎨",
    tag: "Creative",
  },
  {
    id: "academic",
    nameKey: "templates.academic.name",
    descKey: "templates.academic.desc",
    gradient: "from-amber-600 to-orange-700",
    ring: "ring-amber-400",
    emoji: "🎓",
    tag: "Research",
  },
  {
    id: "tech",
    nameKey: "templates.tech.name",
    descKey: "templates.tech.desc",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
    emoji: "💻",
    tag: "Devs",
  },
  {
    id: "executive",
    nameKey: "templates.executive.name",
    descKey: "templates.executive.desc",
    gradient: "from-stone-700 to-stone-900",
    ring: "ring-stone-500",
    emoji: "👔",
    tag: "C-Level",
  },
];

const FEATURES = [
  {
    icon: Target,
    titleKey: "features.ats.title",
    descKey: "features.ats.desc",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
  },
  {
    icon: Mail,
    titleKey: "features.cover.title",
    descKey: "features.cover.desc",
    color: "from-pink-500 to-rose-600",
    bg: "bg-pink-50",
  },
  {
    icon: Linkedin,
    titleKey: "features.linkedin.title",
    descKey: "features.linkedin.desc",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-sky-50",
  },
  {
    icon: Languages,
    titleKey: "features.multilang.title",
    descKey: "features.multilang.desc",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
  },
  {
    icon: FileDown,
    titleKey: "features.pdf.title",
    descKey: "features.pdf.desc",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
  },
  {
    icon: MessageSquare,
    titleKey: "features.interview.title",
    descKey: "features.interview.desc",
    color: "from-fuchsia-500 to-pink-600",
    bg: "bg-fuchsia-50",
  },
];

const TESTIMONIALS = [
  {
    name: "Maria Silva",
    role: "Marketing Manager",
    quote: "Got 3 interviews in 1 week! The ATS optimization is unreal.",
    initials: "MS",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    name: "João Santos",
    role: "Software Developer",
    quote: "The ATS optimization is incredible. Landed a senior role at a FAANG.",
    initials: "JS",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Ana Costa",
    role: "Recent Graduate",
    quote: "Landed my first job thanks to CVForge. The Europass template was perfect!",
    initials: "AC",
    color: "from-amber-500 to-orange-500",
  },
];

const FAQS = [
  {
    q: "How does CVForge AI work?",
    a: "Simply paste your current CV (or upload a PDF/DOCX, or import from LinkedIn), choose a template and language, and our AI — trained on 15+ years of HR expertise — rewrites your bullets into quantified achievements, weaves in ATS keywords, and scores your CV against the job.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We don't store your CV after processing. Each optimization runs in an isolated request and your content is never used to train models. You can request deletion at any time.",
  },
  {
    q: "What templates are available?",
    a: "We offer 6 designed templates: Europass (EU official), ATS-Optimized, Modern Visual, Academic, Tech Portfolio, and Executive. Each is tailored for a specific career stage and industry.",
  },
  {
    q: "Can I use it in my language?",
    a: "Yes! We support 6 languages: English, Portuguese (BR & PT), Spanish, French, and German. The AI auto-detects your CV's language or lets you pick the output language manually.",
  },
  {
    q: "How much does it cost?",
    a: "The preview is completely free — you can optimize a CV and see your ATS score with no watermark on the text. To download a print-ready PDF, it's a one-time €4.99 per CV. No subscriptions, no hidden fees.",
  },
  {
    q: "Does it work with ATS?",
    a: "Yes. Our ATS-Optimized template uses a single-column, keyword-rich structure that Applicant Tracking Systems parse flawlessly. We also surface your ATS score so you know exactly how you'll rank.",
  },
  {
    q: "Can I import from LinkedIn?",
    a: "Yes! Just paste your public LinkedIn profile URL and we'll extract your experience, education, and skills automatically — no manual typing needed.",
  },
  {
    q: "What file formats are supported?",
    a: "You can upload PDF, DOCX, and TXT files up to 5MB. For scanned/image PDFs we recommend pasting your text or exporting from LinkedIn instead.",
  },
];

const COMPARISON = {
  features: [
    "AI Optimization",
    "ATS Score",
    "Multi-language (6)",
    "Europass Template",
    "LinkedIn Import",
    "Price",
  ],
  cvforge: ["✅", "✅", "✅", "✅", "✅", "€4.99/CV"],
  rezi: ["✅", "✅", "❌", "❌", "❌", "$29/mo"],
  zety: ["❌", "❌", "❌", "❌", "❌", "$23/mo"],
  canva: ["❌", "❌", "✅", "❌", "❌", "$13/mo"],
};

const BLOG_POSTS = [
  {
    title: "10 Action Verbs That Make Recruiters Stop Scrolling",
    excerpt:
      "Strong bullets start with strong verbs. Here are the 10 power words that turn a bland CV into a recruiter magnet.",
    tag: "Writing Tips",
    readTime: "5 min read",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "How to Beat the ATS in 2025: A Complete Guide",
    excerpt:
      "Applicant Tracking Systems reject 75% of CVs before a human sees them. Learn the exact keywords and structure to pass.",
    tag: "ATS Strategy",
    readTime: "8 min read",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "The Europass CV: When to Use It (and When Not To)",
    excerpt:
      "Europass is mandatory for some EU jobs and a red flag for others. Here's the definitive guide to using it right.",
    tag: "Templates",
    readTime: "6 min read",
    gradient: "from-amber-500 to-orange-600",
  },
];

const NAV_LINKS = [
  { key: "nav.features", href: "#features" },
  { key: "nav.templates", href: "#templates" },
  { key: "nav.pricing", href: "#pricing" },
  { key: "nav.builder", href: "#builder" },
];

/* ============================================================
   Helper Components
   ============================================================ */

function AnimatedCounter({
  target,
  duration = 2200,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) {
        setCount(target);
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TemplatePreview({
  template,
  selected,
}: {
  template: Template;
  selected: boolean;
}) {
  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-white ring-2 transition-all ${
        selected ? template.ring + " ring-offset-2" : "ring-slate-200"
      }`}
    >
      {/* Header bar */}
      <div className={`h-8 bg-gradient-to-r ${template.gradient}`} />
      <div className="p-2 space-y-1.5">
        <div className="h-1.5 w-2/3 rounded-full bg-slate-800" />
        <div className="h-1 w-1/2 rounded-full bg-slate-400" />
        <div className="mt-2 h-1 w-full rounded-full bg-slate-200" />
        {template.id === "modern" && (
          <div className="flex gap-1.5">
            <div className="space-y-1">
              <div className="h-1 w-10 rounded-full bg-slate-700" />
              <div className="h-1 w-10 rounded-full bg-slate-200" />
              <div className="h-1 w-10 rounded-full bg-slate-200" />
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <div className={`h-12 w-3 rounded bg-gradient-to-b ${template.gradient}`} />
          </div>
        )}
        {template.id === "europass" && (
          <div className="mt-1 flex items-center gap-1">
            <div className="h-2 w-2 rounded-sm bg-blue-600" />
            <div className="h-1 w-12 rounded-full bg-slate-700" />
          </div>
        )}
        {template.id === "tech" && (
          <div className="mt-1 space-y-1">
            <div className="h-1 w-full rounded-full bg-emerald-200" />
            <div className="h-1 w-3/4 rounded-full bg-slate-200" />
            <div className="flex gap-0.5">
              <div className="h-1.5 w-3 rounded bg-emerald-500" />
              <div className="h-1.5 w-4 rounded bg-teal-500" />
              <div className="h-1.5 w-2 rounded bg-cyan-500" />
            </div>
          </div>
        )}
        {template.id === "executive" && (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-1/2 rounded-full bg-stone-800" />
            <div className="h-1 w-full rounded-full bg-stone-200" />
            <div className="h-1 w-full rounded-full bg-stone-200" />
          </div>
        )}
        {template.id === "academic" && (
          <div className="mt-1 space-y-1">
            <div className="h-1 w-2/3 rounded-full bg-amber-700" />
            <div className="h-1 w-full rounded-full bg-slate-200" />
            <div className="h-1 w-full rounded-full bg-slate-200" />
          </div>
        )}
        {template.id === "ats" && (
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-1/2 rounded-full bg-slate-800" />
            <div className="h-1 w-full rounded-full bg-slate-200" />
            <div className="h-1 w-full rounded-full bg-slate-200" />
            <div className="h-1 w-3/4 rounded-full bg-slate-200" />
          </div>
        )}
        <div className="space-y-1 pt-1">
          <div className="h-1 w-full rounded-full bg-slate-200" />
          <div className="h-1 w-5/6 rounded-full bg-slate-200" />
          <div className="h-1 w-full rounded-full bg-slate-200" />
        </div>
      </div>
      {selected && (
        <div className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg">
          <Check className="size-3" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function AtsScoreRing({ score }: { score: number }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 80 ? "#10b981" : clamped >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <defs>
          <linearGradient id="atsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
        />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#atsGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="font-heading text-4xl font-extrabold"
          style={{ color }}
        >
          {clamped}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          / 100
        </span>
      </div>
    </div>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="size-4 fill-amber-400 text-amber-400"
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-violet-500/30">
        <Hammer className="size-5 text-white" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
        </span>
      </div>
      <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
        CVForge<span className="gradient-text-cv"> AI</span>
      </span>
    </div>
  );
}

/* ============================================================
   Main Page
   ============================================================ */

export default function CVForgePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [cv, setCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("ats");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputTab, setInputTab] = useState<"paste" | "upload" | "linkedin">(
    "paste"
  );
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);

  const { processFile, isProcessing, error: uploadError } = useFileUpload();
  const { toast } = useToast();

  const builderRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Browser language detection
  useEffect(() => {
    const browserLang =
      (typeof navigator !== "undefined" && navigator.language) || "en";
    const match = LOCALES.find((l) =>
      browserLang.toLowerCase().startsWith(l.code.toLowerCase().split("-")[0])
    );
    setLocale(match?.code ?? "en");
  }, []);

  // Scroll listener for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await processFile(file);
      setCv(text);
      toast({
        title: "File imported! ✅",
        description: `${file.name} parsed successfully (${text.length} chars).`,
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Could not read this file.",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInImport = async () => {
    if (!linkedinUrl.trim()) return;
    setLinkedinLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkedinUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setCv(data.cvText || "");
      toast({
        title: "LinkedIn imported! ✅",
        description: "Your profile data has been loaded into the CV field.",
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description:
          err.message ||
          "Couldn't access the profile. Make sure it's public.",
        variant: "destructive",
      });
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (cv.trim().length < 30) {
      setError("Please provide at least 30 characters of CV content.");
      return;
    }
    setIsOptimizing(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv,
          jobDescription,
          template: selectedTemplate,
          language: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Optimization failed");
      setResult(data);
      setWizardStep(3);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!result?.optimizedCV) return;
    try {
      await navigator.clipboard.writeText(result.optimizedCV);
      setCopied(true);
      toast({ title: "Copied! ✅", description: "CV copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select the text and copy manually.",
        variant: "destructive",
      });
    }
  }, [result, toast]);

  const handleReset = () => {
    setWizardStep(1);
    setCv("");
    setJobDescription("");
    setSelectedTemplate("ats");
    setSelectedLanguage("auto");
    setResult(null);
    setError(null);
    setLinkedinUrl("");
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToBuilder = () => scrollTo("#builder");

  const currentLocaleObj = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ============================================================
          1. Sticky Navbar
          ============================================================ */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-violet-100 bg-white/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => scrollTo("#top")} aria-label="CVForge AI home">
            <Logo />
          </button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700"
              >
                {t(locale, link.key)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-lg text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                >
                  <Globe2 className="size-4" />
                  <span className="hidden sm:inline">
                    {currentLocaleObj.flag} {currentLocaleObj.code.toUpperCase()}
                  </span>
                  <span className="sm:hidden">{currentLocaleObj.flag}</span>
                  <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {LOCALES.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={`cursor-pointer gap-2 ${
                      l.code === locale
                        ? "bg-violet-50 font-semibold text-violet-700"
                        : ""
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                    {l.code === locale && (
                      <Check className="ml-auto size-4 text-violet-600" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={goToBuilder}
              className="hidden bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/40 sm:inline-flex"
              size="sm"
            >
              <Sparkles className="size-4" />
              {t(locale, "nav.builder")}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-violet-100 bg-white/95 backdrop-blur-xl lg:hidden"
            >
              <div className="space-y-1 px-4 py-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.key}
                    onClick={() => scrollTo(link.href)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                  >
                    {t(locale, link.key)}
                  </button>
                ))}
                <Button
                  onClick={goToBuilder}
                  className="mt-2 w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white"
                >
                  <Sparkles className="size-4" />
                  {t(locale, "nav.builder")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top" className="flex-1">
        {/* ============================================================
            2. Hero
            ============================================================ */}
        <section className="relative overflow-hidden">
          {/* Animated blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="blob animate-blob left-[-10%] top-[-5%] size-[28rem] bg-violet-300" />
            <div className="blob animation-delay-2000 animate-blob right-[-5%] top-[10%] size-[26rem] bg-fuchsia-300" />
            <div className="blob animation-delay-4000 animate-blob bottom-[-10%] left-[30%] size-[24rem] bg-cyan-200" />
          </div>
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 grid-bg" />

          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
            <div className="mx-auto max-w-4xl text-center">
              <Reveal>
                <Badge
                  variant="outline"
                  className="mb-6 border-violet-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-violet-700 backdrop-blur"
                >
                  <Sparkles className="size-3.5 text-fuchsia-500" />
                  {t(locale, "hero.badge")}
                </Badge>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 text-balance sm:text-6xl lg:text-7xl">
                  {t(locale, "hero.title")}{" "}
                  <span className="gradient-text-cv animate-gradient">
                    {t(locale, "hero.title2")}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 text-balance sm:text-lg lg:text-xl">
                  {t(locale, "hero.subtitle")}
                </p>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    onClick={goToBuilder}
                    size="lg"
                    className="h-12 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-8 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-fuchsia-500/40"
                  >
                    <Rocket className="size-5" />
                    {t(locale, "hero.cta")}
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    onClick={() => scrollTo("#templates")}
                    size="lg"
                    variant="outline"
                    className="h-12 border-slate-300 bg-white/70 px-8 text-base font-semibold text-slate-700 backdrop-blur hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  >
                    {t(locale, "hero.cta.secondary")}
                  </Button>
                </div>
              </Reveal>

              {/* Live counter + trust badges */}
              <Reveal delay={0.4}>
                <div className="mt-12 flex flex-col items-center gap-6">
                  <div className="grid grid-cols-3 gap-4 sm:gap-8">
                    <div className="text-center">
                      <div className="font-heading text-2xl font-extrabold gradient-text-cv sm:text-4xl">
                        <AnimatedCounter target={12847} />
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                        {t(locale, "hero.stat1")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-heading text-2xl font-extrabold gradient-text-ocean sm:text-4xl">
                        6
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                        {t(locale, "hero.stat2")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-heading text-2xl font-extrabold gradient-text-emerald sm:text-4xl">
                        6
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                        {t(locale, "hero.stat3")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      No login required
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Lock className="size-4 text-violet-500" />
                      We never store your CV
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      4.9/5 from 2,000+ users
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. Video Demo
            ============================================================ */}
        <section className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="gradient-border overflow-hidden rounded-3xl p-1.5 shadow-2xl shadow-violet-500/10">
              <div className="relative aspect-video overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900">
                {/* Decorative grid */}
                <div className="absolute inset-0 opacity-20 grid-bg" />
                {/* Floating play button */}
                <button
                  onClick={() =>
                    toast({
                      title: "Demo coming soon 🎬",
                      description: "Our walkthrough video launches shortly.",
                    })
                  }
                  className="group absolute inset-0 flex items-center justify-center"
                  aria-label="Play demo video"
                >
                  <span className="absolute size-20 animate-ping rounded-full bg-white/20" />
                  <span className="relative flex size-20 items-center justify-center rounded-full bg-white shadow-2xl transition-transform group-hover:scale-110 sm:size-24">
                    <Play className="ml-1 size-8 fill-violet-600 text-violet-600" />
                  </span>
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <Badge className="bg-white/20 text-white backdrop-blur">
                    <Youtube className="size-3.5" /> 2 min demo
                  </Badge>
                  <span className="text-xs font-medium text-white/80">
                    See CVForge in action →
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============================================================
            4. How It Works
            ============================================================ */}
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge className="mb-3 bg-violet-100 text-violet-700">
                Simple as 1-2-3
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How It <span className="gradient-text-cv">Works</span>
              </h2>
              <p className="mt-3 text-slate-600">
                From raw CV to recruiter-ready in under 60 seconds.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Upload or Paste",
                desc: "Paste your CV text, upload a PDF/DOCX, or import from LinkedIn in one click.",
                color: "from-violet-500 to-purple-600",
              },
              {
                icon: PenLine,
                step: "02",
                title: "Choose & Optimize",
                desc: "Pick a template and language. Our AI rewrites every bullet into a quantified win.",
                color: "from-fuchsia-500 to-pink-600",
              },
              {
                icon: FileDown,
                step: "03",
                title: "Download & Apply",
                desc: "Get your ATS score, copy the text free, or download a print-ready PDF for €4.99.",
                color: "from-cyan-500 to-blue-600",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.12}>
                <Card className="group relative h-full overflow-hidden border-slate-100 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
                  <CardContent className="relative p-6">
                    <div className="absolute right-4 top-4 font-heading text-5xl font-extrabold text-slate-100 transition-colors group-hover:text-violet-100">
                      {item.step}
                    </div>
                    <div
                      className={`mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
                    >
                      <item.icon className="size-6" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================
            5. CV Builder Wizard
            ============================================================ */}
        <section
          id="builder"
          ref={builderRef}
          className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-violet-50/50 via-white to-fuchsia-50/40 py-20"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <Badge className="mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                  <Hammer className="size-3.5" /> The Forge
                </Badge>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {t(locale, "builder.title")}
                </h2>
                <p className="mt-3 text-slate-600">
                  {t(locale, "builder.subtitle")}
                </p>
              </div>
            </Reveal>

            {/* Wizard card */}
            <Reveal delay={0.1}>
              <Card className="overflow-hidden border-violet-100 shadow-2xl shadow-violet-500/10">
                {/* Step indicator */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5 sm:px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                          <div
                            className={`flex size-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                              wizardStep === s
                                ? "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/40"
                                : wizardStep > s
                                ? "bg-emerald-500 text-white"
                                : "bg-white text-slate-400 ring-2 ring-slate-200"
                            }`}
                          >
                            {wizardStep > s ? (
                              <Check className="size-4" strokeWidth={3} />
                            ) : (
                              s
                            )}
                          </div>
                          {s < 3 && (
                            <div
                              className={`h-0.5 w-8 sm:w-16 ${
                                wizardStep > s ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="hidden text-sm font-semibold text-slate-500 sm:block">
                      Step {wizardStep} of 3
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-medium text-slate-700">
                    {wizardStep === 1 && "1. Input your CV"}
                    {wizardStep === 2 && "2. Customize your output"}
                    {wizardStep === 3 && "3. Your optimized CV is ready"}
                  </div>
                  <Progress
                    value={(wizardStep / 3) * 100}
                    className="mt-2 h-1.5"
                  />
                </div>

                <div className="p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {/* ---------- STEP 1: Input ---------- */}
                    {wizardStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <Tabs
                          value={inputTab}
                          onValueChange={(v) =>
                            setInputTab(v as typeof inputTab)
                          }
                        >
                          <TabsList className="grid w-full grid-cols-3 bg-violet-50">
                            <TabsTrigger
                              value="paste"
                              className="data-[state=active]:bg-white data-[state=active]:text-violet-700"
                            >
                              <ClipboardPaste className="size-4" />
                              <span className="hidden sm:inline">Paste CV</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="upload"
                              className="data-[state=active]:bg-white data-[state=active]:text-violet-700"
                            >
                              <Upload className="size-4" />
                              <span className="hidden sm:inline">
                                Upload File
                              </span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="linkedin"
                              className="data-[state=active]:bg-white data-[state=active]:text-violet-700"
                            >
                              <Linkedin className="size-4" />
                              <span className="hidden sm:inline">
                                LinkedIn
                              </span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="paste" className="mt-4">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              {t(locale, "builder.cvLabel")}
                            </label>
                            <Textarea
                              value={cv}
                              onChange={(e) => setCv(e.target.value)}
                              placeholder={t(locale, "builder.cvPlaceholder")}
                              className="min-h-[220px] resize-y border-slate-200 bg-slate-50/50 font-mono text-sm focus:border-violet-400 focus:bg-white"
                            />
                            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                              <span>{cv.length} characters</span>
                              <span>Min 30 chars required</span>
                            </div>
                          </TabsContent>

                          <TabsContent value="upload" className="mt-4">
                            <label
                              htmlFor="cv-file"
                              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-6 py-12 text-center transition-all hover:border-violet-400 hover:bg-violet-50"
                            >
                              <input
                                id="cv-file"
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileUpload}
                                className="sr-only"
                              />
                              <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg transition-transform group-hover:scale-110">
                                {isProcessing ? (
                                  <Loader2 className="size-6 animate-spin" />
                                ) : (
                                  <Upload className="size-6" />
                                )}
                              </div>
                              <span className="font-semibold text-slate-700">
                                {isProcessing
                                  ? "Parsing your file..."
                                  : "Drop your CV here or click to browse"}
                              </span>
                              <span className="mt-1 text-xs text-slate-500">
                                PDF, DOCX, or TXT — max 5MB
                              </span>
                            </label>
                            {uploadError && (
                              <p className="mt-2 text-center text-xs text-rose-500">
                                {uploadError}
                              </p>
                            )}
                            {cv && (
                              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                                <Check className="mr-1.5 inline size-4" />
                                File parsed! {cv.length} characters loaded.
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="linkedin" className="mt-4">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              LinkedIn Profile URL
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                value={linkedinUrl}
                                onChange={(e) =>
                                  setLinkedinUrl(e.target.value)
                                }
                                placeholder="https://www.linkedin.com/in/your-name"
                                className="border-slate-200 bg-slate-50/50 focus:border-blue-400 focus:bg-white"
                              />
                              <Button
                                onClick={handleLinkedInImport}
                                disabled={
                                  linkedinLoading || !linkedinUrl.trim()
                                }
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
                              >
                                {linkedinLoading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Linkedin className="size-4" />
                                )}
                                Import
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              Make sure your profile is public. We extract
                              experience, education, and skills automatically.
                            </p>
                            {cv && inputTab === "linkedin" && (
                              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                                <Check className="mr-1.5 inline size-4" />
                                Imported! Review your CV below.
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

                        {/* Preview of imported CV */}
                        {cv && inputTab !== "paste" && (
                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              Imported CV (editable)
                            </label>
                            <Textarea
                              value={cv}
                              onChange={(e) => setCv(e.target.value)}
                              className="min-h-[140px] resize-y border-slate-200 bg-slate-50/50 font-mono text-xs focus:border-violet-400 focus:bg-white"
                            />
                          </div>
                        )}

                        {/* Job description */}
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                            {t(locale, "builder.jobLabel")}
                          </label>
                          <Textarea
                            value={jobDescription}
                            onChange={(e) =>
                              setJobDescription(e.target.value)
                            }
                            placeholder={t(locale, "builder.jobPlaceholder")}
                            className="min-h-[100px] resize-y border-slate-200 bg-slate-50/50 text-sm focus:border-violet-400 focus:bg-white"
                          />
                        </div>

                        {error && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                            {error}
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            onClick={() => {
                              if (cv.trim().length < 30) {
                                setError(
                                  "Please provide at least 30 characters of CV content."
                                );
                                return;
                              }
                              setError(null);
                              setWizardStep(2);
                            }}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/25 hover:shadow-lg"
                            size="lg"
                          >
                            Next: Customize
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* ---------- STEP 2: Customize ---------- */}
                    {wizardStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-700">
                            {t(locale, "builder.templateLabel")}
                          </label>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {TEMPLATES.map((tpl) => (
                              <button
                                key={tpl.id}
                                onClick={() => setSelectedTemplate(tpl.id)}
                                className={`group relative rounded-2xl border-2 p-2 text-left transition-all ${
                                  selectedTemplate === tpl.id
                                    ? "border-violet-500 bg-violet-50 shadow-md"
                                    : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"
                                }`}
                              >
                                <TemplatePreview
                                  template={tpl}
                                  selected={selectedTemplate === tpl.id}
                                />
                                <div className="mt-2 px-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">
                                      {tpl.emoji}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                      {t(locale, tpl.nameKey)}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              {t(locale, "builder.languageLabel")}
                            </label>
                            <Select
                              value={selectedLanguage}
                              onValueChange={setSelectedLanguage}
                            >
                              <SelectTrigger className="border-slate-200 bg-slate-50/50 focus:border-violet-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">
                                  <span className="flex items-center gap-2">
                                    🌍 {t(locale, "builder.languageHint")}
                                  </span>
                                </SelectItem>
                                {LOCALES.map((l) => (
                                  <SelectItem key={l.code} value={l.code}>
                                    <span className="flex items-center gap-2">
                                      {l.flag} {l.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                              Selected Template
                            </label>
                            <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-3 text-sm font-medium text-slate-700">
                              {TEMPLATES.find(
                                (t) => t.id === selectedTemplate
                              )?.emoji}{" "}
                              {t(
                                locale,
                                TEMPLATES.find((t) => t.id === selectedTemplate)!
                                  .nameKey
                              )}
                            </div>
                          </div>
                        </div>

                        {error && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                            {error}
                          </div>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                          <Button
                            onClick={() => setWizardStep(1)}
                            variant="outline"
                            size="lg"
                            className="border-slate-300"
                          >
                            <ArrowLeft className="size-4" />
                            Back
                          </Button>
                          <Button
                            onClick={handleOptimize}
                            disabled={isOptimizing}
                            className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02] hover:shadow-xl"
                            size="lg"
                          >
                            {isOptimizing ? (
                              <>
                                <Loader2 className="size-4 animate-spin" />
                                {t(locale, "builder.processing")}
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4" />
                                {t(locale, "builder.optimize")}
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* ---------- STEP 3: Result ---------- */}
                    {wizardStep === 3 && (
                      <motion.div
                        key="step3"
                        ref={resultRef}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {isOptimizing && !result ? (
                          <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="size-12 animate-spin text-violet-500" />
                            <p className="mt-4 font-semibold text-slate-700">
                              {t(locale, "builder.processing")}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Forging every bullet into a quantified win...
                            </p>
                          </div>
                        ) : result ? (
                          <>
                            {/* ATS score */}
                            <div className="flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 sm:flex-row sm:gap-6">
                              <div className="flex shrink-0 items-center justify-center">
                                {result.atsScore !== null ? (
                                  <AtsScoreRing score={result.atsScore} />
                                ) : (
                                  <div className="flex size-32 items-center justify-center rounded-full bg-white text-slate-400 shadow">
                                    N/A
                                  </div>
                                )}
                              </div>
                              <div className="text-center sm:text-left">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                  <TrendingUp className="size-5 text-emerald-500" />
                                  <h3 className="font-heading text-xl font-bold text-slate-900">
                                    ATS Compatibility Score
                                  </h3>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                  {result.atsScore !== null &&
                                  result.atsScore >= 80
                                    ? "Excellent! Your CV is highly ATS-friendly. You're ready to apply."
                                    : result.atsScore !== null &&
                                      result.atsScore >= 60
                                    ? "Good start. Apply the suggestions below to push past 80."
                                    : "Needs work. Follow the suggestions to boost your score significantly."}
                                </p>
                                <Badge className="mt-2 bg-white text-violet-700">
                                  Template:{" "}
                                  {t(
                                    locale,
                                    `templates.${result.template}.name`
                                  )}
                                </Badge>
                              </div>
                            </div>

                            {/* Optimized CV */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-heading text-lg font-bold text-slate-900">
                                  {t(locale, "builder.result")}
                                </h3>
                                <Button
                                  onClick={handleCopy}
                                  variant="outline"
                                  size="sm"
                                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="size-4 text-emerald-500" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-4" />
                                      {t(locale, "builder.copy")}
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="custom-scroll max-h-[400px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner">
                                <pre className="whitespace-pre-wrap break-words">
                                  {result.optimizedCV}
                                </pre>
                              </div>
                            </div>

                            {/* Suggestions */}
                            {result.suggestions.length > 0 && (
                              <div>
                                <h3 className="mb-2 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
                                  <Sparkles className="size-5 text-fuchsia-500" />
                                  AI Suggestions
                                </h3>
                                <ul className="space-y-2">
                                  {result.suggestions.map((s, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-2.5 text-sm text-slate-700"
                                    >
                                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
                                        {i + 1}
                                      </span>
                                      <span>{s.replace(/^\d+\.\s*/, "")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md hover:shadow-lg"
                                      onClick={() =>
                                        toast({
                                          title: "🔒 PDF download",
                                          description:
                                            "Unlock print-ready PDF export for €4.99 (one-time, per CV).",
                                        })
                                      }
                                    >
                                      <FileDown className="size-4" />
                                      {t(locale, "builder.download")}
                                      <Badge className="ml-1 bg-white/25 text-white">
                                        <Euro className="size-3" /> 4.99
                                      </Badge>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    One-time €4.99 — print-ready PDF with
                                    embedded fonts
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <Button
                                onClick={handleCopy}
                                variant="outline"
                                className="flex-1 border-violet-200 text-violet-700 hover:bg-violet-50"
                              >
                                <Copy className="size-4" />
                                {t(locale, "builder.copy")}
                              </Button>

                              <Button
                                onClick={handleReset}
                                variant="ghost"
                                className="text-slate-600 hover:bg-slate-100"
                              >
                                <RefreshCw className="size-4" />
                                {t(locale, "builder.reset")}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="py-8 text-center text-slate-500">
                            No result yet. Start over to forge your CV.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            6. Templates Showcase
            ============================================================ */}
        <section
          id="templates"
          className="relative scroll-mt-20 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge className="mb-3 bg-fuchsia-100 text-fuchsia-700">
                <Award className="size-3.5" /> 6 Designs
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t(locale, "templates.title")}
              </h2>
              <p className="mt-3 text-slate-600">
                {t(locale, "templates.subtitle")}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((tpl, i) => (
              <Reveal key={tpl.id} delay={i * 0.08}>
                <Card className="group h-full overflow-hidden border-slate-100 transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/10">
                  <div
                    className={`relative h-44 overflow-hidden bg-gradient-to-br ${tpl.gradient}`}
                  >
                    <div className="absolute inset-0 grid-bg opacity-30" />
                    <div className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2">
                      <div className="overflow-hidden rounded-lg bg-white p-1.5 shadow-2xl">
                        <TemplatePreview template={tpl} selected={false} />
                      </div>
                    </div>
                    <Badge className="absolute right-3 top-3 bg-white/90 text-slate-700 backdrop-blur">
                      {tpl.tag}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tpl.emoji}</span>
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        {t(locale, tpl.nameKey)}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {t(locale, tpl.descKey)}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={goToBuilder}
                      className="mt-3 -ml-2 text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                      size="sm"
                    >
                      Use this template
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================
            7. Features
            ============================================================ */}
        <section
          id="features"
          className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <Badge className="mb-3 bg-emerald-100 text-emerald-700">
                  <Zap className="size-3.5" /> All-in-one
                </Badge>
                <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {t(locale, "features.title")}
                </h2>
                <p className="mt-3 text-slate-600">
                  {t(locale, "features.subtitle")}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <Reveal key={f.titleKey} delay={i * 0.07}>
                  <Card className="group h-full border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
                    <CardContent className="p-6">
                      <div
                        className={`mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg transition-transform group-hover:scale-110`}
                      >
                        <f.icon className="size-6" />
                      </div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        {t(locale, f.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {t(locale, f.descKey)}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            8. Testimonials
            ============================================================ */}
        <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge className="mb-3 bg-amber-100 text-amber-700">
                <Heart className="size-3.5" /> Loved by job seekers
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Real People, <span className="gradient-text-cv">Real Jobs</span>
              </h2>
              <p className="mt-3 text-slate-600">
                Join 12,000+ professionals who forged their way to a new role.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((tm, i) => (
              <Reveal key={tm.name} delay={i * 0.1}>
                <Card className="relative h-full overflow-hidden border-slate-100 shadow-sm">
                  <div
                    className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br ${tm.color} opacity-10`}
                  />
                  <CardContent className="relative p-6">
                    <StarRating />
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">
                      &ldquo;{tm.quote}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div
                        className={`flex size-11 items-center justify-center rounded-full bg-gradient-to-br ${tm.color} font-heading text-sm font-bold text-white shadow-md`}
                      >
                        {tm.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {tm.name}
                        </div>
                        <div className="text-xs text-slate-500">{tm.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================
            9. Comparison Table
            ============================================================ */}
        <section className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge className="mb-3 bg-cyan-100 text-cyan-700">
                <FileSearch className="size-3.5" /> Side by side
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Why Switch to <span className="gradient-text-cv">CVForge</span>?
              </h2>
              <p className="mt-3 text-slate-600">
                More features, no subscription, a fraction of the price.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="overflow-hidden border-slate-100 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-violet-50 to-fuchsia-50">
                      <th className="px-4 py-4 font-heading font-bold text-slate-700 sm:px-6">
                        Feature
                      </th>
                      <th className="px-3 py-4 text-center">
                        <span className="font-heading font-extrabold text-violet-700">
                          CVForge
                        </span>
                      </th>
                      <th className="px-3 py-4 text-center font-semibold text-slate-500">
                        Rezi
                      </th>
                      <th className="px-3 py-4 text-center font-semibold text-slate-500">
                        Zety
                      </th>
                      <th className="px-3 py-4 text-center font-semibold text-slate-500">
                        Canva
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.features.map((feat, i) => (
                      <tr
                        key={feat}
                        className={
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }
                      >
                        <td className="px-4 py-3.5 font-medium text-slate-700 sm:px-6">
                          {feat}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span
                            className={`inline-flex ${
                              feat === "Price"
                                ? "font-heading font-extrabold text-violet-700"
                                : ""
                            }`}
                          >
                            {COMPARISON.cvforge[i]}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-center text-slate-500">
                          {COMPARISON.rezi[i]}
                        </td>
                        <td className="px-3 py-3.5 text-center text-slate-500">
                          {COMPARISON.zety[i]}
                        </td>
                        <td className="px-3 py-3.5 text-center text-slate-500">
                          {COMPARISON.canva[i]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-4 text-center">
                <Button
                  onClick={goToBuilder}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
                >
                  <Sparkles className="size-4" />
                  Try CVForge Free
                </Button>
              </div>
            </Card>
          </Reveal>
        </section>

        {/* ============================================================
            10. Pricing
            ============================================================ */}
        <section
          id="pricing"
          className="relative scroll-mt-20 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge className="mb-3 bg-violet-100 text-violet-700">
                <Euro className="size-3.5" /> No subscriptions
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t(locale, "pricing.title")}
              </h2>
              <p className="mt-3 text-slate-600">
                {t(locale, "pricing.subtitle")}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <Reveal>
              <Card className="h-full border-slate-200 shadow-sm">
                <CardContent className="flex h-full flex-col p-7">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <h3 className="font-heading text-xl font-bold text-slate-900">
                      {t(locale, "pricing.free.name")}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {t(locale, "pricing.free.desc")}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-heading text-5xl font-extrabold text-slate-900">
                      {t(locale, "pricing.free.price")}
                    </span>
                    <span className="text-slate-400">forever</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {["f1", "f2", "f3", "f4"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                        <span className="text-slate-700">
                          {t(locale, `pricing.free.${f}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={goToBuilder}
                    variant="outline"
                    className="mt-7 w-full border-violet-300 text-violet-700 hover:bg-violet-50"
                    size="lg"
                  >
                    Start Free
                  </Button>
                </CardContent>
              </Card>
            </Reveal>

            {/* Pro */}
            <Reveal delay={0.1}>
              <Card className="relative h-full overflow-hidden border-violet-300 shadow-xl shadow-violet-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50" />
                <div className="absolute right-5 top-5">
                  <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                    <Crown className="size-3.5" /> Best Value
                  </Badge>
                </div>
                <CardContent className="relative flex h-full flex-col p-7">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <h3 className="font-heading text-xl font-bold text-slate-900">
                      {t(locale, "pricing.pro.name")}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {t(locale, "pricing.pro.desc")}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-heading text-5xl font-extrabold gradient-text-cv">
                      {t(locale, "pricing.pro.price")}
                    </span>
                    <span className="font-medium text-slate-500">
                      {t(locale, "pricing.pro.per")}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {["f1", "f2", "f3", "f4", "f5", "f6"].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CircleCheck className="mt-0.5 size-5 shrink-0 text-violet-600" />
                        <span className="text-slate-700">
                          {t(locale, `pricing.pro.${f}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={goToBuilder}
                    className="mt-7 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02]"
                    size="lg"
                  >
                    <Sparkles className="size-4" />
                    {t(locale, "pricing.pro.cta")}
                  </Button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    {t(locale, "pricing.guarantee")}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* ============================================================
            11. FAQ
            ============================================================ */}
        <section className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge className="mb-3 bg-blue-100 text-blue-700">
                <MessageSquare className="size-3.5" /> FAQ
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Questions? <span className="gradient-text-ocean">Answered.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-2 sm:p-4">
                <Accordion type="single" collapsible className="w-full">
                  {FAQS.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="px-2 sm:px-3"
                    >
                      <AccordionTrigger className="text-left text-base font-semibold text-slate-800 hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-slate-600">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </Reveal>
        </section>

        {/* ============================================================
            12. Blog / SEO Teaser
            ============================================================ */}
        <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Badge className="mb-3 bg-amber-100 text-amber-700">
                <PenLine className="size-3.5" /> From the blog
              </Badge>
              <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Tips to <span className="gradient-text-cv">Land the Job</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {BLOG_POSTS.map((post, i) => (
              <Reveal key={post.title} delay={i * 0.1}>
                <Card className="group h-full cursor-pointer overflow-hidden border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
                  <div
                    className={`relative h-40 overflow-hidden bg-gradient-to-br ${post.gradient}`}
                  >
                    <div className="absolute inset-0 grid-bg opacity-30" />
                    <Badge className="absolute left-3 top-3 bg-white/90 text-slate-700 backdrop-blur">
                      {post.tag}
                    </Badge>
                    <div className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                  <CardContent className="flex h-[calc(100%-10rem)] flex-col p-5">
                    <h3 className="font-heading text-lg font-bold leading-snug text-slate-900">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {post.readTime}
                      </span>
                      <span className="font-semibold text-violet-600">
                        Read more →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================
            13. Final CTA
            ============================================================ */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 px-6 py-16 text-center shadow-2xl shadow-violet-500/30 sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
              <div className="pointer-events-none absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full bg-amber-300/20 blur-2xl" />
              <div className="relative">
                <Badge className="mb-5 bg-white/20 text-white backdrop-blur">
                  <Sparkles className="size-3.5" /> Join 12,847+ forgers
                </Badge>
                <h2 className="font-heading text-3xl font-extrabold leading-tight text-white text-balance sm:text-5xl">
                  Ready to forge your CV?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
                  It takes 60 seconds. It costs nothing to try. It could change
                  your career.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button
                    onClick={goToBuilder}
                    size="lg"
                    className="h-12 bg-white px-8 text-base font-bold text-violet-700 shadow-xl hover:scale-[1.03] hover:bg-violet-50"
                  >
                    <Rocket className="size-5" />
                    {t(locale, "hero.cta")}
                  </Button>
                  <Button
                    onClick={() => scrollTo("#pricing")}
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/50 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
                  >
                    See Pricing
                  </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Check className="size-4" /> Free preview
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="size-4" /> No signup needed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="size-4" /> 6 languages
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ============================================================
          14. Footer
          ============================================================ */}
      <footer className="mt-auto border-t border-slate-100 bg-gradient-to-b from-white to-violet-50/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-4 max-w-xs text-sm text-slate-600">
                {t(locale, "footer.tagline")}
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  { icon: Twitter, label: "Twitter" },
                  { icon: Github, label: "GitHub" },
                  { icon: LinkedinIcon, label: "LinkedIn" },
                  { icon: Youtube, label: "YouTube" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                {t(locale, "footer.product")}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["CV Builder", "Templates", "Pricing", "Features"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-slate-600 transition-colors hover:text-violet-600"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                {t(locale, "footer.company")}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-600 transition-colors hover:text-violet-600"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-900">
                {t(locale, "footer.legal")}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Privacy", "Terms", "GDPR", "Cookies"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-slate-600 transition-colors hover:text-violet-600"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row">
            <p>
              © {new Date().getFullYear()} CVForge AI.{" "}
              {t(locale, "footer.rights")}
            </p>
            <p className="flex items-center gap-1.5">
              Made with <Heart className="size-3.5 fill-fuchsia-500 text-fuchsia-500" />{" "}
              for job seekers worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
