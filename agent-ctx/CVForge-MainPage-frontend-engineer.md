# Task: CVForge-MainPage
## Agent: Frontend Engineer (main agent)

### Work Log
- Read `worklog.md` (context from prior Poupt analysis tasks — not directly related, just historical).
- Read existing `src/app/page.tsx` (placeholder Z.ai logo), `src/app/layout.tsx` (Inter + Sora fonts, metadata, Toaster), `package.json` (Next 16, React 19, full shadcn/ui + Lucide + framer-motion + z-ai-web-dev-sdk).
- Read `src/lib/i18n.ts` — confirmed `Locale` type (`pt-BR | pt-PT | en | es | fr | de`), `LOCALES` array (with flag + label), and `t(locale, key)` function. Verified all keys used by the page exist (nav.*, hero.*, builder.*, features.ats/cover/linkedin/multilang/pdf/interview.*, templates.{europass,ats,modern,academic,tech,executive}.{name,desc}, pricing.{free,pro}.*, footer.*).
- Read `src/app/api/optimize-cv/route.ts` — confirmed POST endpoint returns `{ success, optimizedCV, atsScore, suggestions, template }` and validates CV >= 50 chars.
- Read `src/app/globals.css` — confirmed dark theme tokens, `.gradient-text`, `.glass-card`, `.glow`, `.grid-bg` utility classes are available. Dark mode is enabled by `.dark` class on a parent (`@custom-variant dark (&:is(.dark *))`).
- Read `src/components/ui/button.tsx` — confirmed variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon.

### Implementation
- Wrote complete `src/app/page.tsx` as a `'use client'` single-page application (~720 lines).
- Added `useEffect` to toggle `.dark` class on `document.documentElement` for the dark premium theme (since `layout.tsx` doesn't set it).
- **State**: `locale`, `cv`, `jobDescription`, `selectedTemplate` (default `'ats'`), `selectedLanguage` (default `'auto'`), `isOptimizing`, `result`, `error`, `mobileMenuOpen`, `copied`.
- **Sections built**:
  1. Sticky navbar (logo with `Hammer` icon + gradient "AI" text, desktop nav links, language dropdown with flags, primary CTA, mobile hamburger menu).
  2. Hero section (badge, big title with `gradient-text` second line, subtitle, two CTAs, 3-stat row in glass cards, `grid-bg` background with radial mask + glow blobs).
  3. CV Builder (left 60% / right 40% on lg): CV textarea (min-h-300), job description textarea (min-h-150), 6 template selector cards in a 2x3 grid with green border on selected, language `Select` (Auto-detect + 6 locales), Optimize button with loading state showing `Loader2` spinner + "Forging your CV…" text + skeletons; result panel with 4 states (empty, loading, result, error) — ATS score badge, scrollable optimized CV in monospace `<pre>`, suggestions list, Copy-to-clipboard (functional via `navigator.clipboard.writeText`) + Download PDF (disabled, with tooltip "Unlock Full Features — €4.99").
  4. Features grid: 6 cards (ATS Score Checker, Cover Letter AI, LinkedIn Import, Multi-Language CVs, Premium PDF Export, Interview Prep AI) with colored icons.
  5. Templates showcase: 6 cards each with a hand-crafted mini SVG-like preview (`TemplatePreview` component) representing the visual style of each template (Europass blue header, ATS minimalist, Modern colored sidebar, Academic centered, Tech code header with colored tag chips, Executive dark with violet accent).
  6. Pricing: 2 cards (Free €0 + Pro €4.99/CV with "Popular" badge and `glow` CTA, 30-day guarantee note).
  7. Footer: brand + tagline + 3 columns (Product/Company/Legal) + copyright with current year.
- Used `t(locale, 'key')` for ALL user-facing text.
- All cards use `glass-card`, hero CTA uses `glow`, all icons from `lucide-react`.
- Layout: `min-h-screen flex flex-col` root, `mt-auto` on footer (sticks to bottom).
- Toast notifications for success/error via `useToast` hook (already in project).
- Responsive: mobile-first, columns stack on mobile, side-by-side on `lg:`. Mobile menu drawer for navbar.

### Verification
- `bunx eslint src/app/page.tsx` — 0 errors, 0 warnings.
- `curl http://localhost:3000/` — HTTP 200, dev.log shows `Compiled in 186ms` with no errors.
- Page contains expected markers: `CVForge`, `Forge Your Future`, `Optimize`, `builder`, `gradient-text`.

### Stage Summary
- Single-file `src/app/page.tsx` complete and production-ready.
- All 7 sections implemented per spec.
- Builder is fully functional: state wiring, API call to `/api/optimize-cv`, loading/empty/error/result states, clipboard copy, tooltip on disabled PDF button.
- Dark premium theme (Linear/Stripe aesthetic) with emerald accent, grid background, glow effects, glass cards.
- Fully responsive with mobile menu.
- All text i18n-driven across 6 locales.
