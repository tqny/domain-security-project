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

Populated during B1 (Case Queue). These patterns are reused by B2–B5.

### Component Vocabulary

**DataTable** (`src/components/shared/DataTable.tsx`)
- Generic sortable table with typed column definitions
- Container: `rounded-lg border border-border/60` — very subtle border
- Header row: `bg-surface-alt/50` — barely distinct from body, muted uppercase labels
- Body rows: `py-3.5` padding, `border-b border-border/50` separators
- Selected row: `bg-primary/[0.06] border-l-2 border-l-primary` — subtle amber highlight + amber left accent
- Hover: `hover:bg-surface-elevated/40`
- Transitions: `duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]` (design criteria base motion)

**DetailPanel** (`src/components/shared/DetailPanel.tsx`)
- Right-side panel, 400px fixed width, `bg-surface`
- Breaks out of Layout padding via negative margins when open (page-level concern)
- Sticky header with `text-base font-semibold` title + close button
- Scrollable content area with `px-5 py-4` padding
- Uses `<aside>` element for semantics

**FilterBar** (`src/components/shared/FilterBar.tsx`)
- Search input + dropdown filters + clear button
- Inputs: `h-8 rounded-lg bg-surface border-border` with amber focus ring
- Dropdowns: `appearance-none` with Lucide `ChevronDown` overlay
- Clear button appears when any filter is active
- Fast transitions: `duration-[120ms]`

**StatusChip** (`src/components/shared/StatusChip.tsx`)
- Pill-shaped (`rounded-full`) inline badge for status and priority values
- Color mapping: semantic backgrounds at 15–20% opacity with matching text color
- Status: New (amber), Triaged (secondary amber), Investigating (warning), Enforcement (destructive), Closed (muted)
- Priority: Low (muted), Medium (secondary amber), High (warning), Critical (destructive)

**Page Header Pattern** (established in Queue, reuse in B2–B5)
- Title: `text-3xl font-bold tracking-tight text-foreground`
- Subtitle: `mt-1 text-sm text-text-secondary`

### Spacing and Rhythm

- Page content sections: `space-y-6` (24px) between header, filters, and table
- Layout main content: `px-10 py-8` (40px horizontal, 32px vertical)
- Detail panel sections: `pt-5` top padding with `border-t border-border/50` dividers
- Detail section headers: `mb-3` below title before content
- Detail metadata rows: `py-1` vertical rhythm
- Button groups: `gap-2` between buttons, `size="sm"` for controls

### Motion System

Centralized in `global.css` as CSS custom properties from design criteria:

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 120ms | Close buttons, filter clear, sort header hover |
| `--duration-base` | 180ms | Row hover, nav link transitions |
| `--duration-slow` | 280ms | Panel open/close (future) |
| `--duration-scene` | 420ms | Page-level transitions (future) |
| `--ease-standard` | cubic-bezier(0.22, 1, 0.36, 1) | All interactive transitions |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Exit animations (future) |

Applied via Tailwind arbitrary values: `duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]`

### Responsive Behavior

Desktop-first. Responsive pass deferred to POLISH phase. Key principles from design criteria:
- Shell concept preserved at all sizes (tighter padding on mobile, but amber margin remains)
- Multi-column → single-column stack below 1024px
- Nav rail → collapsible or bottom nav on mobile (TBD)

### State Patterns

- **Selected**: amber left border + subtle amber background tint
- **Hover**: surface-elevated at 40% opacity
- **Focus**: amber ring (`ring-ring`) on all interactive elements
- **Active button**: `active:translate-y-px` press feedback
- **Empty table**: centered muted message, generous vertical padding

Loading: skeleton blocks matching final layout proportions (no spinners).
Empty: concise copy + single CTA.
Error: inline, close to affected component, danger color.

### Deviations from Pass 1

- **Nav rail badges**: active state uses `bg-primary/20 text-primary` instead of generic surface elevated — ties badge to amber accent system when the nav item is active.
- **Table header background**: uses `bg-surface-alt/50` instead of solid `bg-surface` — barely visible distinction matches reference's extremely subtle header treatment.
- **Card containers use `rounded-xl` (20px)**: matches Torch reference exactly (computed 20px on all cards). Table container, note cards.
- **No outer borders on card-like containers**: reference cards use zero borders — surface color contrast alone provides separation. Table container border removed; internal row dividers preserved for data readability.
- **Headline weight 600 (semibold)**: reference uses weight 500 at 72px. Scaled to 600 for our smaller 30px context to maintain equivalent visual weight.
- **All structural borders softened to `/40` opacity**: nav rail, detail panel left border, detail panel header — near-invisible, matching reference's borderless card aesthetic.
