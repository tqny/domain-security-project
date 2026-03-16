# Design — Brand Protection Control Center

> Style: **Torch Dark Gold**
> Source files: `~/Desktop/domain new/design-criteria.jsonc` and `developer-brief.md`
> Implemented in: `src/styles/global.css`

---

## Pass 1 — Structure and Direction

### Layout Pattern

Full-viewport CSS Grid. Sidebar (260px) + TopBar (64px) + scrollable main content area. No framing wrapper — the app fills the viewport edge-to-edge on a near-black background (`#0D0D0D`).

Desktop-first. Sidebar is sticky full-height. TopBar is sticky top.

### Density and Tone

Medium density. Data-rich sections use tight spacing; overview sections use generous whitespace. The feel is "premium analytics tool" — confident, warm, data-forward. Not cold/clinical, not playful.

Headlines are large, left-aligned, tightly tracked. Amber accent is rationed: primary CTAs, active nav state, chart highlights, key data points. Text hierarchy uses opacity/weight rather than color changes.

### Design References

- **Torch analytics product** (marketing pages) — the primary visual reference
- Deep charcoal surfaces with single amber/gold accent
- Sidebar + topbar grid layout
- Stat cards with trend badges
- Chart panels (bar + donut)
- Data tables with hover rows and sortable headers
- Feature cards with icon + title + description

### Token System

All tokens centralized in `src/styles/global.css` as CSS custom properties mapped to shadcn semantic variables.

**Palette:**
| Token | Value | Role |
|-------|-------|------|
| `--background` | `#0D0D0D` | Main app background |
| `--surface` / `--card` | `#161616` | Sidebar, cards, panels |
| `--surface-alt` | `#1E1E1E` | Table headers, alternate surfaces |
| `--surface-hover` | `#252525` | Hover state on surfaces |
| `--border` | `#2A2A2A` | Default borders (solid) |
| `--border-emphasis` | `#3A3A3A` | Stronger borders, focus states |
| `--foreground` | `#F5F5F5` | Primary text |
| `--text-secondary` | `#A0A0A0` | Secondary text |
| `--text-tertiary` | `#666666` | Muted / disabled text |
| `--primary` | `#E8A838` | Amber accent |
| `--accent-hover` | `#D4952F` | Accent hover state |
| `--accent-muted` | `rgba(232,168,56,0.15)` | Accent tint backgrounds |
| `--destructive` | `#E5484D` | Danger / error |
| `--success` | `#34C759` | Success / healthy |
| `--warning` | `#E8A838` | Warning (same as accent) |
| `--info` | `#5B9BD5` | Informational / blue |

**Semantic muted variants:** `--danger-muted`, `--success-muted`, `--warning-muted`, `--info-muted` — all at 15% opacity for badge/chip backgrounds.

**Chart series:** `#E8A838` (gold), `#F5F5F5` (white), `#5B9BD5` (blue), `#34C759` (green), `#A0A0A0` (gray)

**Typography:** Geist Variable → ui-sans-serif → system-ui fallback. Tight tracking on headlines (-0.02em). Weights: 400/500/600/700.

**Radius:** sm=4px, md=8px, lg=12px, xl=16px, 2xl=20px, pill=9999px.

**Shadows:** Conventional black, no warm tint. Subtle (1px), medium (12px), floating (32px), glow (amber 15% for featured elements).

### Motion System

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Micro-interactions |
| `--duration-fast` | 150ms | Hover, focus, close buttons |
| `--duration-base` | 250ms | Row hover, nav transitions |
| `--duration-slow` | 400ms | Panel transitions, chart animations |
| `--duration-entrance` | 500ms | Page-level entrance animations |
| `--ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | All interactive transitions |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Entrance animations |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Chart bar growth, playful elements |

### Styling Library

**Tailwind CSS v4** via `@tailwindcss/vite` plugin. Component library: **shadcn/ui** (customized tokens). No CSS Modules.

### Charting

CSS-based. No external charting library. Overview uses:
- Horizontal bar chart via `width%` on colored divs
- Donut chart via CSS `conic-gradient`

---

## Pass 2 — Component Patterns

### Component Vocabulary

**DataTable** (`src/components/shared/DataTable.tsx`)
- Generic sortable table with typed column definitions
- Container: `rounded-xl border border-border`
- Header row: `bg-surface-alt` — solid background, uppercase semibold labels with wide tracking
- Body rows: `py-3.5` padding, `border-b border-border` separators
- Selected row: `bg-accent-muted border-l-[3px] border-l-primary` — amber accent bar
- Hover: `hover:bg-surface-hover`
- Transitions: `duration-[var(--duration-fast)] ease-[var(--ease-standard)]`

**DetailPanel** (`src/components/shared/DetailPanel.tsx`)
- Fixed position right-side panel, 420px wide, `bg-surface`
- Left border, floating shadow
- Sticky header with title + close button
- Scrollable content area with `px-5 py-4` padding
- Uses `<aside>` element for semantics

**FilterBar** (`src/components/shared/FilterBar.tsx`)
- Search input + dropdown filters + clear button
- Inputs: `h-8 rounded-lg bg-background border-border` with amber focus ring (`focus:border-primary`)
- Placeholder text uses `text-text-tertiary`
- Clear button appears when any filter is active

**StatusChip** (`src/components/shared/StatusChip.tsx`)
- Pill-shaped (`rounded-full`) inline badge with dot indicator (1.5px circle)
- Supports 4 types: `status`, `priority`, `domain-status`, `action-status`
- Color mapping uses semantic muted backgrounds:
  - Amber (`accent-muted` / `primary`): New cases, warnings
  - Blue (`info-muted` / `info`): Triaged, medium priority, monitoring, sent
  - Red (`danger-muted` / `destructive`): Enforcement, critical, incident, denied
  - Green (`success-muted` / `success`): Resolved
  - Gray (`surface-alt` / `text-secondary`): Closed, low priority, suspended, queued

**StatCard** (in `Overview.tsx`)
- `rounded-xl border border-border bg-surface p-6`
- Hover: `-translate-y-0.5` lift + `shadow-medium`
- Highlighted variant: `border-l-[3px] border-l-primary`
- Trend badge: pill with directional icon (up/down/flat), colored by sentiment

### App Shell

**Sidebar** (`src/components/shell/NavRail.tsx`)
- Width: 260px, `bg-surface`, right border
- Logo: amber icon + "Sentinel" brand text
- Nav sections with uppercase tracking labels ("Workflow", "Project")
- Lucide icons on all nav items
- Active state: amber left accent bar (3px, pill-rounded) + `bg-accent-muted text-primary`
- Badges: live counts from context, styled pill
- User block at footer: initials avatar (amber gradient) + name + role

**TopBar** (`src/components/shell/TopBar.tsx`)
- Height: 64px, `bg-surface`, bottom border
- Left: breadcrumb (Home / page name, derived from route)
- Right: search input with kbd shortcut hint + notification bell with red dot

### Spacing and Rhythm

- Page content sections: `space-y-6` to `space-y-8`
- Layout main content: `p-8` (32px all sides)
- Detail panel sections: `pt-5` top padding with `border-t border-border` dividers
- Stat cards grid: `gap-6`
- Chart panels grid: `gap-6`

### State Patterns

- **Selected**: amber left border + accent-muted background
- **Hover**: surface-hover background
- **Focus**: `focus:border-primary focus:ring-1 focus:ring-primary` on inputs
- **Active button**: `active:scale-[0.98] active:translate-y-px`
- **Disabled**: `opacity-40 pointer-events-none cursor-not-allowed`
- **Empty table**: centered muted message, generous vertical padding

### Responsive Behavior

Desktop-first. Responsive pass deferred to POLISH phase. Key principles:
- Sidebar collapses to icons at 1024px, hidden at 768px
- Stat cards reflow: 4 → 2 → 1 columns
- Charts stack vertically below lg breakpoint
- Tables gain horizontal scroll on mobile
