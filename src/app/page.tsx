'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Hammer,
  FileText,
  ShieldCheck,
  Mail,
  Linkedin,
  Globe,
  FileDown,
  MessageSquare,
  Check,
  Copy,
  Download,
  Sparkles,
  Loader2,
  ChevronDown,
  Star,
  Zap,
  GraduationCap,
  Code2,
  Briefcase,
  Languages,
  Lock,
  RefreshCw,
  Globe2,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useFileUpload } from '@/hooks/use-file-upload'
import { t, LOCALES, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Upload, Link2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

// ---------- Types ----------

type TemplateId = 'europass' | 'ats' | 'modern' | 'academic' | 'tech' | 'executive'

interface OptimizeResult {
  optimizedCV: string
  atsScore: number | null
  suggestions: string[]
  template?: string
}

interface TemplateMeta {
  id: TemplateId
  icon: React.ElementType
  accent: string
  nameKey: string
  descKey: string
}

const TEMPLATES: TemplateMeta[] = [
  { id: 'europass', icon: FileText, accent: 'text-sky-400', nameKey: 'templates.europass.name', descKey: 'templates.europass.desc' },
  { id: 'ats', icon: ShieldCheck, accent: 'text-emerald-400', nameKey: 'templates.ats.name', descKey: 'templates.ats.desc' },
  { id: 'modern', icon: Sparkles, accent: 'text-fuchsia-400', nameKey: 'templates.modern.name', descKey: 'templates.modern.desc' },
  { id: 'academic', icon: GraduationCap, accent: 'text-amber-400', nameKey: 'templates.academic.name', descKey: 'templates.academic.desc' },
  { id: 'tech', icon: Code2, accent: 'text-cyan-400', nameKey: 'templates.tech.name', descKey: 'templates.tech.desc' },
  { id: 'executive', icon: Briefcase, accent: 'text-violet-400', nameKey: 'templates.executive.name', descKey: 'templates.executive.desc' },
]

interface FeatureMeta {
  icon: React.ElementType
  titleKey: string
  descKey: string
  accent: string
}

const FEATURES: FeatureMeta[] = [
  { icon: ShieldCheck, titleKey: 'features.ats.title', descKey: 'features.ats.desc', accent: 'text-emerald-400' },
  { icon: Mail, titleKey: 'features.cover.title', descKey: 'features.cover.desc', accent: 'text-sky-400' },
  { icon: Linkedin, titleKey: 'features.linkedin.title', descKey: 'features.linkedin.desc', accent: 'text-blue-400' },
  { icon: Globe, titleKey: 'features.multilang.title', descKey: 'features.multilang.desc', accent: 'text-fuchsia-400' },
  { icon: FileDown, titleKey: 'features.pdf.title', descKey: 'features.pdf.desc', accent: 'text-amber-400' },
  { icon: MessageSquare, titleKey: 'features.interview.title', descKey: 'features.interview.desc', accent: 'text-violet-400' },
]

// ---------- Helpers ----------

function scrollToId(id: string) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function TemplatePreview({ id }: { id: TemplateId }) {
  // Tiny visual representations of each template style
  const common = 'w-full h-full rounded-md p-2 text-[6px] leading-[1.1] bg-background/80 border border-border/60'
  switch (id) {
    case 'europass':
      return (
        <div className={cn(common, 'flex flex-col gap-0.5')}>
          <div className="h-1.5 w-2/3 rounded-sm bg-sky-500/70" />
          <div className="h-0.5 w-1/2 bg-muted-foreground/40" />
          <div className="mt-1 h-0.5 w-1/3 bg-sky-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="h-0.5 w-5/6 bg-muted-foreground/30" />
          <div className="mt-1 h-0.5 w-1/3 bg-sky-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="h-0.5 w-4/5 bg-muted-foreground/30" />
        </div>
      )
    case 'ats':
      return (
        <div className={cn(common, 'flex flex-col gap-0.5')}>
          <div className="h-1.5 w-1/2 bg-foreground/80" />
          <div className="h-0.5 w-2/3 bg-muted-foreground/40" />
          <div className="mt-1 h-0.5 w-1/4 bg-foreground/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="mt-1 h-0.5 w-1/4 bg-foreground/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
        </div>
      )
    case 'modern':
      return (
        <div className={cn(common, 'flex gap-1')}>
          <div className="w-1/3 flex flex-col gap-0.5 rounded-sm bg-fuchsia-500/15 p-0.5">
            <div className="h-1 w-full rounded-full bg-fuchsia-400/70" />
            <div className="h-0.5 w-full bg-muted-foreground/40" />
            <div className="h-0.5 w-3/4 bg-muted-foreground/40" />
            <div className="mt-0.5 h-0.5 w-2/3 bg-fuchsia-400/60" />
            <div className="h-0.5 w-full bg-muted-foreground/30" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className="h-1.5 w-2/3 bg-foreground/80" />
            <div className="h-0.5 w-1/2 bg-muted-foreground/40" />
            <div className="mt-1 h-0.5 w-1/3 bg-foreground/60" />
            <div className="h-0.5 w-full bg-muted-foreground/30" />
            <div className="h-0.5 w-5/6 bg-muted-foreground/30" />
          </div>
        </div>
      )
    case 'academic':
      return (
        <div className={cn(common, 'flex flex-col gap-0.5 text-center')}>
          <div className="mx-auto h-1.5 w-1/2 bg-amber-500/70" />
          <div className="mx-auto h-0.5 w-1/3 bg-muted-foreground/40" />
          <div className="mt-1 h-0.5 w-2/3 bg-amber-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="mx-auto h-0.5 w-3/4 bg-muted-foreground/30" />
          <div className="mt-1 h-0.5 w-1/2 bg-amber-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
        </div>
      )
    case 'tech':
      return (
        <div className={cn(common, 'flex flex-col gap-0.5 font-mono')}>
          <div className="flex items-center gap-0.5">
            <span className="text-cyan-400">{'</>'}</span>
            <div className="h-1.5 w-1/2 bg-cyan-400/70" />
          </div>
          <div className="h-0.5 w-1/3 bg-cyan-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="h-0.5 w-4/5 bg-muted-foreground/30" />
          <div className="mt-1 flex gap-0.5">
            <div className="h-1 w-3 rounded-sm bg-cyan-500/40" />
            <div className="h-1 w-3 rounded-sm bg-emerald-500/40" />
            <div className="h-1 w-3 rounded-sm bg-amber-500/40" />
          </div>
        </div>
      )
    case 'executive':
      return (
        <div className={cn(common, 'flex flex-col gap-0.5 bg-zinc-950')}>
          <div className="h-1.5 w-3/4 border-l-2 border-violet-400 pl-1">
            <div className="h-1 w-2/3 bg-violet-400/80" />
          </div>
          <div className="h-0.5 w-1/2 bg-muted-foreground/40" />
          <div className="mt-1 h-0.5 w-1/3 bg-violet-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
          <div className="h-0.5 w-5/6 bg-muted-foreground/30" />
          <div className="mt-1 h-0.5 w-1/3 bg-violet-400/60" />
          <div className="h-0.5 w-full bg-muted-foreground/30" />
        </div>
      )
  }
}

// ---------- Main Component ----------

export default function Home() {
  const { toast } = useToast()

  // State
  const [locale, setLocale] = useState<Locale>('en')
  const [cv, setCv] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('ats')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { processFile, isProcessing: isUploading, error: uploadError, setError: setUploadError } = useFileUpload()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const builderRef = useRef<HTMLDivElement | null>(null)

  // Apply dark theme on mount
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('dark')
    return () => {
      root.classList.remove('dark')
    }
  }, [])

  const handleOptimize = useCallback(async () => {
    if (!cv || cv.trim().length < 50) {
      setError(t(locale, 'builder.cvPlaceholder').split('\n')[0])
      toast({
        title: 'CV too short',
        description: 'Please paste at least 50 characters of your CV.',
        variant: 'destructive',
      })
      return
    }
    setIsOptimizing(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv,
          jobDescription,
          template: selectedTemplate,
          language: selectedLanguage,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to optimize CV.')
      }
      setResult({
        optimizedCV: data.optimizedCV ?? '',
        atsScore: data.atsScore ?? null,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        template: data.template,
      })
      toast({
        title: 'CV forged successfully',
        description: 'Your optimized CV is ready to review.',
      })
      // Scroll automático para o resultado (mobile-friendly)
      setTimeout(() => {
        const resultEl = document.getElementById('cv-result')
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to optimize CV. Please try again.')
      toast({
        title: 'Optimization failed',
        description: e?.message ?? 'Please try again in a moment.',
        variant: 'destructive',
      })
    } finally {
      setIsOptimizing(false)
    }
  }, [cv, jobDescription, selectedTemplate, selectedLanguage, locale, toast])

  const handleCopy = useCallback(async () => {
    if (!result?.optimizedCV) return
    try {
      await navigator.clipboard.writeText(result.optimizedCV)
      setCopied(true)
      toast({ title: 'Copied to clipboard' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' })
    }
  }, [result, toast])

  const handleReset = useCallback(() => {
    setCv('')
    setJobDescription('')
    setResult(null)
    setError(null)
    setSelectedTemplate('ats')
    setSelectedLanguage('auto')
  }, [])

  const currentLocaleMeta = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  // ---------- Render ----------

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      {/* ============================= NAVBAR ============================= */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => scrollToId('hero')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="CVForge AI home"
          >
            <span className="relative flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Hammer className="size-5" />
              <span className="absolute inset-0 -z-10 rounded-lg bg-primary/20 blur-md" />
            </span>
            <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              CVForge <span className="gradient-text">AI</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { id: 'features', key: 'nav.features' },
              { id: 'templates', key: 'nav.templates' },
              { id: 'pricing', key: 'nav.pricing' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(locale, item.key)}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Globe2 className="size-4" />
                  <span className="hidden sm:inline">{currentLocaleMeta.flag}</span>
                  <span className="hidden lg:inline">{currentLocaleMeta.label}</span>
                  <ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {LOCALES.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLocale(l.code)}
                    className={cn(
                      'cursor-pointer justify-between',
                      l.code === locale && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {l.code === locale && <Check className="size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA */}
            <Button
              size="sm"
              onClick={() => scrollToId('builder')}
              className="hidden sm:inline-flex glow"
            >
              <Zap className="size-4" />
              {t(locale, 'nav.builder')}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/40 bg-background/95 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {[
                { id: 'features', key: 'nav.features' },
                { id: 'templates', key: 'nav.templates' },
                { id: 'pricing', key: 'nav.pricing' },
                { id: 'builder', key: 'nav.builder' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToId(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {t(locale, item.key)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* ============================= HERO ============================= */}
        <section id="hero" className="relative overflow-hidden">
          {/* Grid background */}
          <div className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
                <Sparkles className="size-3.5" />
                {t(locale, 'hero.badge')}
              </div>

              {/* Title */}
              <h1
                className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                <span className="block">{t(locale, 'hero.title')}</span>
                <span className="gradient-text block">{t(locale, 'hero.title2')}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {t(locale, 'hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => scrollToId('builder')}
                  className="glow h-12 px-7 text-base"
                >
                  <Zap className="size-5" />
                  {t(locale, 'hero.cta')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToId('templates')}
                  className="h-12 px-7 text-base"
                >
                  <FileText className="size-5" />
                  {t(locale, 'hero.cta.secondary')}
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-14 grid w-full max-w-2xl grid-cols-3 gap-4">
                {[
                  { value: '12,847', key: 'hero.stat1' },
                  { value: '6', key: 'hero.stat2' },
                  { value: '6', key: 'hero.stat3' },
                ].map((s) => (
                  <div
                    key={s.key}
                    className="glass-card rounded-xl px-3 py-4 text-center"
                  >
                    <div
                      className="text-2xl font-bold sm:text-3xl"
                      style={{ fontFamily: 'var(--font-sora), sans-serif' }}
                    >
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {t(locale, s.key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================= BUILDER ============================= */}
        <section id="builder" className="relative scroll-mt-16 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                <Hammer className="mr-1 size-3" />
                {t(locale, 'nav.builder')}
              </Badge>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                {t(locale, 'builder.title')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t(locale, 'builder.subtitle')}</p>
            </div>

            <div ref={builderRef} className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* ---------- LEFT (60%) ---------- */}
              <div className="lg:col-span-3 space-y-6">
                {/* CV textarea */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{t(locale, 'builder.cvLabel')}</CardTitle>
                      <div className="flex items-center gap-2">
                        {/* Upload button */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.docx,.txt"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            try {
                              const text = await processFile(file)
                              setCv(text)
                              toast({ title: 'CV uploaded successfully!', description: `${text.length} characters extracted from ${file.name}` })
                            } catch (err: any) {
                              toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
                            }
                            // Reset input
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" /> Upload CV</>
                          )}
                        </Button>
                        {/* LinkedIn import button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setShowLinkedInModal(true)}
                          disabled={isImportingLinkedIn}
                        >
                          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                        </Button>
                        <span className={cn('text-xs', cv.length < 50 ? 'text-muted-foreground' : 'text-primary')}>
                          {cv.length} chars
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={cv}
                      onChange={(e) => setCv(e.target.value)}
                      placeholder={t(locale, 'builder.cvPlaceholder')}
                      className="min-h-[300px] resize-y font-mono text-sm leading-relaxed"
                    />
                  </CardContent>
                </Card>

                {/* LinkedIn Import Modal */}
                <Dialog open={showLinkedInModal} onOpenChange={setShowLinkedInModal}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-primary" />
                        Import from LinkedIn
                      </DialogTitle>
                      <DialogDescription>
                        Paste your LinkedIn profile URL below. We'll extract your experience, education, and skills automatically.
                        <br /><br />
                        <span className="text-xs text-muted-foreground">
                          ⚠️ Your LinkedIn profile must be public for this to work. If it's private, you can export your LinkedIn data as PDF and use the "Upload CV" button instead.
                        </span>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="https://www.linkedin.com/in/your-profile/"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowLinkedInModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!linkedinUrl.trim()) return
                          setIsImportingLinkedIn(true)
                          try {
                            const res = await fetch('/api/import-linkedin', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: linkedinUrl }),
                            })
                            const data = await res.json()
                            if (data.success) {
                              setCv(data.cvText)
                              toast({
                                title: 'LinkedIn profile imported!',
                                description: `Extracted: ${data.profile.name || 'Profile'} with ${data.profile.experience?.length || 0} experiences`,
                              })
                              setShowLinkedInModal(false)
                              setLinkedinUrl('')
                            } else {
                              toast({
                                title: 'Import failed',
                                description: data.error || 'Could not import LinkedIn profile',
                                variant: 'destructive',
                              })
                            }
                          } catch (err: any) {
                            toast({
                              title: 'Import failed',
                              description: err.message,
                              variant: 'destructive',
                            })
                          } finally {
                            setIsImportingLinkedIn(false)
                          }
                        }}
                        disabled={isImportingLinkedIn || !linkedinUrl.trim()}
                      >
                        {isImportingLinkedIn ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Importing...</>
                        ) : (
                          <><Linkedin className="h-4 w-4" /> Import Profile</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Job description */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t(locale, 'builder.jobLabel')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder={t(locale, 'builder.jobPlaceholder')}
                      className="min-h-[150px] resize-y text-sm leading-relaxed"
                    />
                  </CardContent>
                </Card>

                {/* Template selector */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t(locale, 'builder.templateLabel')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {TEMPLATES.map((tpl) => {
                        const Icon = tpl.icon
                        const isSelected = selectedTemplate === tpl.id
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setSelectedTemplate(tpl.id)}
                            aria-pressed={isSelected}
                            className={cn(
                              'group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all',
                              isSelected
                                ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                                : 'border-border bg-card/40 hover:border-primary/40 hover:bg-accent/40'
                            )}
                          >
                            <div className="flex w-full items-center justify-between">
                              <Icon className={cn('size-5', tpl.accent)} />
                              {isSelected && (
                                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                  <Check className="size-3" />
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold">{t(locale, tpl.nameKey)}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {t(locale, tpl.descKey)}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Language selector + Optimize */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t(locale, 'builder.languageLabel')}</CardTitle>
                    <CardDescription className="text-xs">{t(locale, 'builder.languageHint')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t(locale, 'builder.languageLabel')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <span className="flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            {t(locale, 'builder.languageHint')}
                          </span>
                        </SelectItem>
                        {LOCALES.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            <span className="flex items-center gap-2">
                              <span>{l.flag}</span>
                              <span>{l.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        size="lg"
                        onClick={handleOptimize}
                        disabled={isOptimizing || cv.trim().length < 50}
                        className="glow flex-1"
                      >
                        {isOptimizing ? (
                          <>
                            <Loader2 className="size-5 animate-spin" />
                            {t(locale, 'builder.processing')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-5" />
                            {t(locale, 'builder.optimize')}
                          </>
                        )}
                      </Button>
                      {(result || cv || jobDescription) && (
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          disabled={isOptimizing}
                        >
                          <RefreshCw className="size-4" />
                          {t(locale, 'builder.reset')}
                        </Button>
                      )}
                    </div>

                    {error && (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ---------- RIGHT (40%) ---------- */}
              <div className="lg:col-span-2">
                <div id="cv-result" className="sticky top-20 scroll-mt-20">
                  <Card className="glass-card min-h-[500px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-base">{t(locale, 'builder.result')}</CardTitle>
                      {result?.atsScore != null && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-primary/40 text-primary',
                            result.atsScore >= 80 && 'border-emerald-400/50 text-emerald-400'
                          )}
                        >
                          <ShieldCheck className="mr-1 size-3" />
                          ATS {result.atsScore}/100
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Empty state */}
                      {!isOptimizing && !result && (
                        <div className="flex h-[420px] flex-col items-center justify-center gap-4 text-center">
                          <div className="relative flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                            <Hammer className="size-9" />
                            <span className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-xl" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Ready to forge your CV</p>
                            <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                              {t(locale, 'builder.subtitle')}
                            </p>
                          </div>
                          <div className="mt-2 grid w-full max-w-xs grid-cols-1 gap-2 text-left text-xs text-muted-foreground">
                            {[
                              'Paste your current CV on the left',
                              'Pick a template that matches your goal',
                              'Click Optimize and watch the magic',
                            ].map((step, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                                  {i + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Loading state */}
                      {isOptimizing && (
                        <div className="flex h-[420px] flex-col items-center justify-center gap-4">
                          <div className="relative flex size-16 items-center justify-center">
                            <Loader2 className="size-16 animate-spin text-primary" />
                            <Hammer className="absolute size-6 text-primary" />
                          </div>
                          <div className="space-y-2 text-center">
                            <p className="text-sm font-medium">{t(locale, 'builder.processing')}</p>
                            <p className="text-xs text-muted-foreground">Analyzing, rewriting, and polishing…</p>
                          </div>
                          <div className="w-full max-w-xs space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                            <Skeleton className="h-3 w-4/5" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      )}

                      {/* Result state */}
                      {!isOptimizing && result && (
                        <div className="space-y-4">
                          <ScrollArea className="h-[360px] w-full rounded-md border border-border/60 bg-background/60 p-3">
                            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/90">
                              {result.optimizedCV}
                            </pre>
                          </ScrollArea>

                          {/* Suggestions */}
                          {result.suggestions.length > 0 && (
                            <div className="rounded-md border border-border/60 bg-background/40 p-3">
                              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" />
                                Suggestions
                              </div>
                              <ul className="space-y-1.5">
                                {result.suggestions.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                                      <Check className="size-3" />
                                    </span>
                                    <span>{s.replace(/^\d+\.\s*/, '')}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button onClick={handleCopy} variant="default" className="flex-1">
                              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                              {t(locale, 'builder.copy')}
                            </Button>
                            <TooltipProvider delayDuration={150}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-1">
                                    <Button variant="outline" className="w-full cursor-not-allowed opacity-70">
                                      <Lock className="size-4" />
                                      {t(locale, 'builder.download')}
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <span>{t(locale, 'builder.unlock')} — €4.99</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================= FEATURES ============================= */}
        <section id="features" className="relative scroll-mt-16 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                <Star className="mr-1 size-3" />
                Features
              </Badge>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                {t(locale, 'features.title')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t(locale, 'features.subtitle')}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <Card
                    key={f.titleKey}
                    className="glass-card group relative overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                        <Icon className={cn('size-5', f.accent)} />
                      </div>
                      <h3
                        className="text-base font-semibold"
                        style={{ fontFamily: 'var(--font-sora), sans-serif' }}
                      >
                        {t(locale, f.titleKey)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{t(locale, f.descKey)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============================= TEMPLATES ============================= */}
        <section id="templates" className="relative scroll-mt-16 py-16 sm:py-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                <FileText className="mr-1 size-3" />
                Templates
              </Badge>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                {t(locale, 'templates.title')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t(locale, 'templates.subtitle')}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon
                const isSelected = selectedTemplate === tpl.id
                return (
                  <Card
                    key={tpl.id}
                    className={cn(
                      'glass-card group relative cursor-pointer overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
                      isSelected && 'border-primary ring-1 ring-primary/30'
                    )}
                    onClick={() => {
                      setSelectedTemplate(tpl.id)
                      scrollToId('builder')
                    }}
                  >
                    <CardContent className="p-5">
                      {/* Mini preview */}
                      <div className="mb-4 h-32 w-full overflow-hidden rounded-lg border border-border/60 bg-card/40">
                        <TemplatePreview id={tpl.id} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className={cn('size-4', tpl.accent)} />
                            <h3
                              className="text-sm font-semibold"
                              style={{ fontFamily: 'var(--font-sora), sans-serif' }}
                            >
                              {t(locale, tpl.nameKey)}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {t(locale, tpl.descKey)}
                          </p>
                        </div>
                        {isSelected && (
                          <Badge variant="secondary" className="shrink-0 bg-primary/15 text-primary">
                            <Check className="mr-1 size-3" /> Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-border/40 px-5 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTemplate(tpl.id)
                          scrollToId('builder')
                        }}
                      >
                        Use template <ArrowRight className="size-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* ============================= PRICING ============================= */}
        <section id="pricing" className="relative scroll-mt-16 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                <Star className="mr-1 size-3" />
                Pricing
              </Badge>
              <h2
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-sora), sans-serif' }}
              >
                {t(locale, 'pricing.title')}
              </h2>
              <p className="mt-3 text-muted-foreground">{t(locale, 'pricing.subtitle')}</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              {/* Free */}
              <Card className="glass-card relative flex flex-col">
                <CardHeader>
                  <CardDescription>{t(locale, 'pricing.free.desc')}</CardDescription>
                  <CardTitle
                    className="mt-1 text-2xl"
                    style={{ fontFamily: 'var(--font-sora), sans-serif' }}
                  >
                    {t(locale, 'pricing.free.name')}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{t(locale, 'pricing.free.price')}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {['pricing.free.f1', 'pricing.free.f2', 'pricing.free.f3', 'pricing.free.f4'].map((k) => (
                      <li key={k} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{t(locale, k)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => scrollToId('builder')}
                  >
                    {t(locale, 'hero.cta')}
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro */}
              <Card className="glass-card relative flex flex-col border-primary/40 ring-1 ring-primary/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="size-3" /> Popular
                  </Badge>
                </div>
                <CardHeader>
                  <CardDescription>{t(locale, 'pricing.pro.desc')}</CardDescription>
                  <CardTitle
                    className="mt-1 text-2xl"
                    style={{ fontFamily: 'var(--font-sora), sans-serif' }}
                  >
                    {t(locale, 'pricing.pro.name')}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{t(locale, 'pricing.pro.price')}</span>
                    <span className="text-sm text-muted-foreground">/ {t(locale, 'pricing.pro.per')}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 text-sm">
                    {['pricing.pro.f1', 'pricing.pro.f2', 'pricing.pro.f3', 'pricing.pro.f4', 'pricing.pro.f5', 'pricing.pro.f6'].map((k) => (
                      <li key={k} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{t(locale, k)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-2">
                  <Button className="glow w-full" onClick={() => scrollToId('builder')}>
                    <Zap className="size-4" />
                    {t(locale, 'pricing.pro.cta')}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {t(locale, 'pricing.guarantee')}
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* ============================= FOOTER ============================= */}
      <footer className="mt-auto border-t border-border/40 bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Hammer className="size-4" />
                </span>
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  CVForge <span className="gradient-text">AI</span>
                </span>
              </div>
              <p className="mt-3 max-w-xs text-xs text-muted-foreground">
                {t(locale, 'footer.tagline')}
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                {t(locale, 'footer.product')}
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {['features', 'templates', 'pricing', 'builder'].map((id) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToId(id)}
                      className="transition-colors hover:text-foreground"
                    >
                      {t(locale, `nav.${id}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                {t(locale, 'footer.company')}
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {['About', 'Blog', 'Careers', 'Contact'].map((label) => (
                  <li key={label}>
                    <a href="#" className="transition-colors hover:text-foreground">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                {t(locale, 'footer.legal')}
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {['Privacy', 'Terms', 'GDPR', 'Cookies'].map((label) => (
                  <li key={label}>
                    <a href="#" className="transition-colors hover:text-foreground">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CVForge AI. {t(locale, 'footer.rights')}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="size-3.5" />
              <span>{LOCALES.length} languages supported</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
