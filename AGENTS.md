# AGENTS.md — domain-security-project

A portfolio project by Tony Mikityuk.
Part of the portfolio at https://tqny.github.io/Tony-s-Site/

---

## Current Phase

**BUILD — Phase B (Pages)**

Phases progress as: BRIEF → PLAN → BUILD (seed data) → DATA (real pipeline) → POLISH

Update this field as the project advances.

---

## What To Do Right Now

Foundation is complete (A1–A6). Design system is applied (Warm Contrast Analytics). Next: build the 5 workflow pages.

1. Read this file, then follow the read order below.
2. Work from `docs/tasks.md` — Phase B tasks, one page at a time.
3. Build order: B1 Case Queue → B2 Investigation → B3 Domain Portfolio → B4 Enforcement Tracker → B5 Operations Overview.
4. B1 establishes shared component patterns (table, detail panel, filter bar, status chips) that B2–B5 reuse.
5. After Phase B, move to Phase C (portfolio surface: About page, breadcrumbs, nav badges, reset demo).
6. Then Phase D (ship: deployment, review, README final).
7. **Run `/review`** before creating PRs — catches console errors, accessibility issues, and polish problems.
8. **Run `/browse`** for visual QA — screenshots, responsive checks, user flow verification via headless browser.
9. **Run `/ship`** when a feature branch is ready — automates sync, checks, push, and PR creation.

### Design Authority

The design system is documented in `docs/design.md`. The source-of-truth criteria files live at `~/Desktop/domain design criteria/` (design-criteria.jsonc + developer-brief.md). All tokens are mapped into `src/styles/global.css`. When building components, follow the Warm Contrast Analytics system — amber accent is rationed deliberately.

---

## Read Order

For any thread picking up this project:

1. `AGENTS.md` (this file) — current phase and what to do
2. `V3-master-prompt.md` — full methodology reference
3. `docs/spec.md` — what the product is
4. `docs/architecture.md` — how it's structured
5. `docs/tasks.md` — what's done, what's next
6. `docs/design.md` — design system and direction
7. `README.md` — reviewer-facing context

During BRIEF phase, only items 1 and 2 (plus `brief-template.md`) are relevant.

---

## Source of Truth

- `docs/spec.md` — primary product truth (once populated)
- `docs/tasks.md` — execution state and continuity
- `docs/architecture.md` — technical structure
- `docs/design.md` — design system and decisions
- `README.md` — reviewer-facing orientation

---

## End-of-Session Discipline

Before ending any session:

1. Update `docs/tasks.md` — mark completed tasks, note what's in progress, confirm next task.
2. Update this file's "Current Phase" if it changed.
3. If architecture or design decisions were made, update the relevant doc.
4. Note anything a new thread needs to know that isn't captured in docs.

---

## Thread Switching

When context gets heavy (30+ substantial exchanges), recommend a fresh thread. The new thread reads this file first, then follows the read order above. Docs-as-memory keeps continuity intact.

---

## Portfolio Context

This project is part of Tony Mikityuk's portfolio. It should be:

- Portfolio-grade: polished, presentable, credible
- Scoped honestly: clear MVP, clear non-goals
- Modular: clean boundaries, reusable primitives
- Documented: repo docs are durable, chat is temporary
- Reviewer-ready: includes an in-product "About This Project" surface

Target audience for the portfolio: hiring managers evaluating a program manager / customer success professional with growing AI/agentic engineering skills.

---

## Repo Workflow

- Git repo from day 1
- GitHub remote from day 1
- Feature branches for meaningful work
- PRs before merge to main
- No direct-to-main unless trivial
