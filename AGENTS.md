# AGENTS.md — domain-security-project

A portfolio project by Tony Mikityuk.
Part of the portfolio at https://tqny.github.io/Tony-s-Site/

---

## Current Phase

**PLAN**

Phases progress as: BRIEF → PLAN → BUILD → POLISH

Update this field as the project advances.

---

## What To Do Right Now

This is a new project. Only the project name has been established.

1. Read `V3-master-prompt.md` to understand the methodology.
2. Read `brief-template.md` to understand the target brief format.
3. Ask Tony for his **project idea or full project brief**.
4. If he provides just an idea, ask structured questions to build out a complete brief. Cover all the major sections in `brief-template.md`. Don't rush — a strong brief sets up the entire project.
5. **Run `/plan-product-review`** to challenge and refine the brief against portfolio criteria. This pushes the project toward its highest-potential version.
6. Once the brief is solid, transition to **PLAN** phase:
   - Update this file's "Current Phase" to PLAN
   - Follow the V3 prompt's output behavior: framing, MVP/scope, project selection check, stack recommendation, module architecture, design direction (Pass 1), About This Project recommendation
   - Populate `docs/spec.md`, `docs/architecture.md`, `docs/tasks.md`, `docs/design.md`, and `README.md`
   - **Run `/plan-eng-review`** to lock in architecture with diagrams, edge cases, and build-readiness.
7. Once planning is complete, transition to **BUILD** phase:
   - Update this file's "Current Phase" to BUILD
   - Work from `docs/tasks.md`, one scoped task at a time
   - Verify each task before moving on
   - **Run `/review`** before creating PRs — catches console errors, accessibility issues, and polish problems
   - **Run `/browse`** for visual QA — screenshots, responsive checks, user flow verification via headless browser
   - **Run `/ship`** when a feature branch is ready — automates sync, checks, push, and PR creation

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
