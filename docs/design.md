# Design — Brand Protection Control Center

> Style: **Warm Contrast Analytics**
> Source files: `~/Desktop/domain design criteria/design-criteria.jsonc` and `developer-brief.md`
> Implemented in: `src/styles/global.css`

---

## Pass 1 — Structure and Direction

### Layout Pattern

Framed dark shell on warm amber canvas. The app lives inside a near-black rounded container (`rounded-2xl`) with visible amber (`#F2C35C`) margins on all sides. Inside the shell: left nav rail (w-56, bg-card) + main content area (bg-background).

Desktop-first. Content max-width not constrained within the shell — the shell itself is the frame.

### Density and Tone

Medium-low density. Generous padding (px-10 py-8 on content area, px-5 py-6 on nav header). Sections breathe. The feel is "polished internal tool" — confident, calm, data-forward. Not sci-fi, not playful.

Headlines are large, left-aligned, tightly tracked. Amber accent is rationed: CTAs, chart emphasis, active nav state, tiny metadata labels. If everything is accented, nothing is accented.

### Design References

- **Torch analytics product** (marketing pages) — the primary visual reference
- Dark shell + warm amber canvas composition
- 2x2 chart tile clusters with simplified bar/ring/line charts
- Feature cards: dark, rounded, icon + headline + restrained copy
- Split hero pattern (content left, proof right)
- Pricing cards with featured-tier emphasis
- FAQ accordion rows

### Reference Interpretation

**What we use from the references:**
- Shell-on-canvas framing pattern (adapted for app layout vs marketing page)
- Color palette: near-black surfaces, warm off-white text, amber accent family
- Typography rhythm: large tight-tracked headlines, muted supporting copy
- Card language: dark cards with soft borders, generous radius
- Chart styling: amber data series, warm neutral secondaries
- Interaction patterns: subtle hover shifts, visible focus rings, no glow effects

**What we adapt:**
- Marketing hero/pricing/testimonial patterns → dashboard tables, detail panels, metric cards
- Top nav → left nav rail (architectural decision from spec)
- Split hero → overview page metrics layout
- CTA buttons → action buttons within workflow context

**What we ignore:**
- Marketing-specific modules (pricing tiers, testimonial rows, newsletter forms)
- Photography/texture as decorative elements
- Logo strips and trust badges

### Token System

All tokens centralized in `src/styles/global.css` as CSS custom properties mapped to shadcn semantic variables.

**Palette:**
| Token | Value | Role |
|-------|-------|------|
| `--ambient` | `#F2C35C` | Warm canvas behind shell |
| `--background` | `#101211` | App background / shell bg |
| `--card` / `--surface` | `#181A19` | Primary surface (nav rail, cards) |
| `--surface-alt` | `#202322` | Alternate surface |
| `--surface-elevated` | `#262927` | Elevated surface (badges, hover) |
| `--border` | `rgba(255,255,255,0.06)` | Soft borders |
| `--border-strong` | `#2D302E` | Explicit borders |
| `--foreground` | `#F6F2E8` | Primary text |
| `--text-secondary` | `#ABA79D` | Secondary text |
| `--muted-foreground` | `#7F7B73` | Muted text |
| `--primary` | `#F7C554` | Amber accent |
| `--destructive` | `#C56E63` | Danger/error |
| `--success` | `#83B889` | Success |
| `--warning` | `#D89E3C` | Warning |

**Chart series:** Amber family — `#F7C554`, `#F9D67A`, `#F5EBD1`, `#6F6A61`, `#ABA79D`

**Typography:** Geist Variable → ui-sans-serif → system-ui fallback. Tight negative tracking on headlines (-0.02em to -0.055em). Weights: 400/500/600/700.

**Radius:** sm=0.625rem, md=0.875rem (base), lg=1.25rem, xl=1.75rem. Shell uses rounded-2xl.

**Shadows:** Warm-tinted, large offsets: subtle (12px), medium (20px), floating (32px).

**Motion:** Fast=120ms, base=180ms, slow=280ms. Easing: cubic-bezier(0.22, 1, 0.36, 1). Restrained — opacity + translateY preferred over large travel.

### Styling Library

**Tailwind CSS v4** via `@tailwindcss/vite` plugin. Component library: **shadcn/ui** (Nova preset, customized tokens). No CSS Modules — Tailwind utility classes + shadcn components cover all needs.

### Charting

TBD — will decide during B5 (Operations Overview). Candidates: Recharts (easiest shadcn integration) or custom SVG. Chart styling: amber data series on dark backgrounds, `rgba(255,255,255,0.05)` grid lines.

---

## Pass 2 — Component Patterns

<!-- Populate as components are built and solidify during BUILD phase. -->

### Component Vocabulary

_To be filled during Phase B as shared primitives emerge from B1._

Expected shared components:
- DataTable (sortable, filterable)
- DetailPanel (right-side or overlay)
- FilterBar (search + dropdowns)
- StatusChip (color-coded by status)
- MetricCard (for overview page)
- SectionHeader (page title + subtitle pattern)

### Spacing and Rhythm

_To be documented as pages are built._

### Responsive Behavior

Desktop-first. Responsive pass deferred to POLISH phase. Key principles from design criteria:
- Shell concept preserved at all sizes (tighter padding on mobile, but amber margin remains)
- Multi-column → single-column stack below 1024px
- Nav rail → collapsible or bottom nav on mobile (TBD)

### State Patterns

_To be documented as pages are built._

Loading: skeleton blocks matching final layout proportions (no spinners).
Empty: concise copy + single CTA.
Error: inline, close to affected component, danger color.

### Deviations from Pass 1

_None yet._
