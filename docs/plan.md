# SiyanceTool — Build Plan

A static website hosting a collection of interactive chemistry tools for a high school
classroom. Primary use case: the teacher shares her screen and drives a tool live during a
lesson. Secondary (future) use case: students open the same tools themselves.

**Constraint:** no backend API for now. Everything runs in the browser. The architecture
should not make adding a backend later painful.

This document is the **actionable build sequence**. It does not describe what the tools do —
[tools.md](tools.md) is the design document for that, and every tool item below consults it.
Open questions raised along the way live in [questions.md](questions.md).

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked on a decision

---

## 1. Decide the language and framework `[x]` — DECIDED: Vite + React + TypeScript

**Decision (2026-09-07): Vite + React + TypeScript**, with the sub-decisions below. The
analysis that follows is kept as the record of why, and of what was rejected.

This was item one because it is the only decision here that is expensive to reverse.
Everything below assumes an answer.

### What the choice actually has to serve

1. **~17 tools sharing one look and one set of controls.** Sliders, reveal-answer gates,
   reset buttons, and the page shell repeat on every tool. Reuse is the dominant cost.
2. **Correctness of the chemistry.** A balancer that returns wrong coefficients in front of
   a class is the worst possible failure. The chemistry core has to be testable.
3. **Two very different rendering needs.** Data-driven pages (periodic table) and 60fps
   particle simulations (gas laws) have opposite performance profiles.
4. **Static hosting, no server.** The build output must be plain files.
5. **Maintainability by someone who is not the original author** — possibly a teacher, a
   student, or a future contributor.

### Option A — Plain HTML + CSS + vanilla JS, no build step

**Pros**

- Zero tooling. No npm, no build, no dependency upgrades to babysit.
- Files can be opened directly from disk or a USB stick, so it works with no internet at all.
- Deployable literally anywhere, including a school's own file share.
- Native ES modules mean a shared `chem-core` still works without a bundler.
- Lowest barrier for a student who wants to read the source and understand it.

**Cons**

- No component model. The page shell, sliders, and reveal gate get copy-pasted ~17 times, so
  a single design change means editing 17 files.
- No type checking. A typo in an element's atomic mass, or a unit mixup between kPa and atm,
  fails silently and shows a wrong number to the class.
- Manual DOM updating for slider-driven simulations gets messy fast, and it is exactly the
  kind of code that develops subtle bugs.
- Many small module requests without bundling; noticeable on a slow school network.

**Verdict:** viable for two or three tools, painful at seventeen.

### Option B — Vite + React + TypeScript ← recommended

**Pros**

- Component reuse directly addresses the dominant cost: one `ToolShell`, one `Slider`, one
  `RevealAnswer`, used by every tool.
- TypeScript makes the chemistry data and unit handling checkable at compile time. Element
  data, formula parse trees, and reaction structures all get real types.
- Largest ecosystem of the options — mature 3D (`three` / `react-three-fiber`), charting,
  and routing, plus the most worked examples when stuck.
- Vite's production build is **plain static files**, so the no-backend constraint holds
  exactly and hosting stays free.
- Fast hot reload, which matters a lot when tuning how a simulation feels.
- The most widely known of these options, so a future maintainer is likeliest to know it.

**Cons**

- Requires Node and a build step; the source is no longer directly viewable in a browser.
- React's re-render model is a poor fit for per-frame particle animation. Mitigation:
  simulations own a `canvas` and run their loop outside React, with React managing only the
  surrounding controls. This is a standard pattern, but it is a real caveat and needs to be
  a deliberate convention rather than something discovered halfway through.
- More concepts to learn than plain JS for a student contributor.
- Larger bundle than Svelte for equivalent output (not a practical problem at this size).

### Option C — SvelteKit with the static adapter

**Pros**

- Compiles to small vanilla JS; no framework runtime shipped to the browser.
- Its reactivity model is an unusually natural fit for slider-driven simulations — "when
  temperature changes, recompute pressure" is close to a one-liner.
- Less boilerplate than React, and often the most pleasant of these to write.
- Scoped styles are built in, so the design system needs less discipline to stay clean.

**Cons**

- Smaller ecosystem, particularly for 3D molecular rendering and charting.
- Smaller pool of people who know it, which matters if this outlives its author.
- Fewer worked examples to lean on when building something unfamiliar.

**Verdict:** the closest runner-up. Pick this if the author already knows Svelte, or values
developer experience over ecosystem depth.

### Option D — Astro with React or Svelte islands

**Pros**

- Multi-page by default, which matches "one page per tool" exactly.
- Ships near-zero JavaScript on pages that do not need it, so the index loads instantly.
- Can mix frameworks per island if the 3D viewer wants something different.

**Cons**

- The islands concept is an extra layer to learn.
- Its main advantage — not shipping JS — is mostly wasted here, because nearly every page
  *is* an interactive app. The benefit applies to the home page and little else.

### Option E — Next.js

**Pros:** excellent routing and ecosystem, and static export is supported.

**Cons:** most of what Next.js provides is server rendering, API routes, and caching —
machinery this project explicitly does not need. It adds server concepts to a project whose
defining constraint is that there is no server. Overkill.

### Option F — Python (Streamlit / Shiny / Jupyter)

**Pros:** familiar to science teachers, with excellent numeric and plotting libraries.

**Cons:** requires a running server, which breaks the core constraint and adds hosting cost
and a cold-start delay. Interactions round-trip to the server, so slider-driven simulation
feels sluggish. The UI is not projector-polished and is hard to customize. **Ruled out**,
but named here so the decision is on the record.

### Recommendation

**Vite + React + TypeScript.** Reuse across many pages and provable correctness of the
chemistry are the two things that actually decide whether this project succeeds, and that
combination serves both better than the alternatives. SvelteKit is a defensible alternative
if the author prefers it — the rest of this plan survives either choice, with only item 2
changing.

### Sub-decisions that follow from item 1

- [x] **Rendering split:** SVG for charts and diagrams (styleable, accessible, few
      elements); Canvas 2D for particle simulations (hundreds of particles at 60fps);
      Three.js only for the 3D molecule viewer. Do not use SVG for particles.
- [x] **Charting:** hand-rolled SVG, for full control over projector legibility. Reconsider
      a library only if a tool needs high-frequency streaming plots.
- [ ] **3D:** `three.js` directly, or `3Dmol.js`. Deferred — evaluate when `vsepr-viewer`
      comes up (questions.md #24).
- [x] **Styling:** plain CSS with custom properties, so a projector theme (huge type, high
      contrast) and a student theme are a token swap rather than a rewrite.
- [x] **Testing:** Vitest, applied to `chem-core` only. UI tests are not worth the cost
      here. Wrong chemistry is.
- [ ] **Hosting:** GitHub Pages via Actions, Netlify, or Cloudflare Pages — all free, all
      static. Deferred to item 9.

---

## 2. Scaffold the project `[ ]`

- [ ] Initialize Vite + React + TypeScript in the repo root.
- [ ] Add ESLint and Prettier with a minimal, non-argumentative config.
- [ ] Add Vitest; confirm one trivial test runs.
- [ ] Set up path aliases (`@/core`, `@/ui`, `@/tools`) so imports stay readable.
- [ ] Fix the directory layout and record it in the README: `src/core/` (chemistry logic,
      zero UI), `src/ui/` (shared components), `src/tools/<tool-id>/` (one folder per tool,
      named for its id in [tools.md](tools.md)), `src/data/` (element and molecule datasets).
- [ ] Write a real README: what this is, how to run it, how to add a new tool.
- [ ] Add `.gitignore` and commit the scaffold.

## 3. Build the design system and teacher-mode conventions `[ ]`

Implements the "conventions every tool follows" section of [tools.md](tools.md). Establish
these before building tools, not after — they are what make the site usable live in a
classroom.

- [ ] Define CSS custom-property tokens: color, type scale, spacing, focus rings.
- [ ] Build the **projector theme**: oversized type, high contrast, thick lines. Verify it
      is readable from the back of a classroom, not just on a laptop.
- [ ] Verify the palette is colorblind-safe. This matters more than usual here, since
      indicator colors and flame tests are literally about color.
- [ ] Build the shared components:
  - [ ] `ToolShell` — title, description, controls area, output area, reset.
  - [ ] `Slider` — large hit target, live numeric readout, keyboard-steppable.
  - [ ] `RevealAnswer` — hides a result until clicked. This one component is what makes the
        site teachable rather than merely informative.
  - [ ] `NumberField` — units-aware, rejects nonsense input gracefully.
  - [ ] `ResetButton` and `RandomizeButton`.
- [ ] Implement the site-wide keyboard conventions (arrows adjust the focused control, `R`
      resets, `Space` reveals) so she is not hunting with a mouse mid-lesson.
- [ ] Confirm the shell works at both 1024x768 and 1920x1080.

## 4. Build `chem-core`, the shared chemistry library `[ ]`

Pure functions, no UI, fully unit-tested. Most tools depend on this, and retrofitting it
later is painful — which is why it comes before the tools. Each tool's entry in
[tools.md](tools.md) lists which of these it needs.

- [ ] Element dataset: symbol, name, Z, atomic mass, group, period, block, electron
      configuration, electronegativity, radii, melting and boiling points, common oxidation
      states, state at STP, emission lines. **Cite the data source in the file.**
- [ ] Formula parser handling nested parentheses and hydrate dot notation (`Ca(NO3)2`,
      `CuSO4·5H2O`). Returns an element-count map.
- [ ] Molar mass and percent composition from a parsed formula.
- [ ] Equation parser and **balancer** (linear algebra over the element-count matrix)
      returning smallest integer coefficients — and returning a clear failure for
      unbalanceable input rather than a wrong answer.
- [ ] Stoichiometry engine: mole conversions, limiting reagent, theoretical yield, excess
      remaining, percent yield.
- [ ] Gas law solver: ideal gas plus the named special cases.
- [ ] Solution math: molarity, dilution, mixing.
- [ ] Acid/base: pH, pOH, Ka/Kb, and titration curve generation for strong and weak acids.
- [ ] Thermochemistry: `q = mcΔT`, phase-change enthalpy, heating-curve segments.
- [ ] Significant figures: counting, rounding, and propagation through operations.
- [ ] Ion and polyatomic-ion tables for nomenclature.
- [ ] **Tests for every one of the above**, using known textbook problems with known answers
      as fixtures.

## 5. App shell, routing, and home page `[ ]`

- [ ] Route per tool, using each tool's id from [tools.md](tools.md) as its path.
- [ ] Home page: a grid of tool cards grouped by unit, each with a one-line description,
      generated from the registry in item 6 rather than hand-maintained. This is the page
      she lands on in front of the class, so it has to be scannable in about three seconds.
- [ ] Handle unknown routes gracefully.

## 6. Tool registry and on/off config `[ ]`

Every tool must be switchable on or off from a single config file, without touching the
tool's source or the home page. This matters for three reasons: half-finished tools can live
on `main` without appearing in class; she can hide tools for units she has not taught yet, so
the home page shows only what is relevant right now; and a broken tool can be disabled in one
commit rather than reverted.

- [ ] Define a `ToolDefinition` type: `id`, `title`, `unit`, `description`, `tier`,
      `component`, and any tool-specific defaults.
- [ ] Each tool self-registers a `ToolDefinition` from its own folder, so adding a tool means
      adding one folder and one registry line.
- [ ] Add a **`tools.config.json`** at the repo root — plain JSON, editable by someone who
      does not write code — mapping each tool id to at minimum `{ "enabled": true|false }`.
      Keep the format readable and hand-editable; this file is a user interface.
- [ ] Support per-tool option overrides in the same file (default units, difficulty,
      whether the reveal gate starts open), so classroom preferences do not require a code
      change.
- [ ] Derive **both** the route table and the home page grid from registry + config, so a
      disabled tool cannot be reached by typing its URL and cannot appear in navigation.
- [ ] Give a disabled tool's URL a clear "this tool is turned off" page, not a generic 404 —
      if she has a stale bookmark mid-lesson, she should know what happened.
- [ ] Validate the config at startup: unknown tool ids and malformed entries fail loudly in
      development, and are ignored with a console warning in production. A typo must never
      silently disable a tool she is about to teach with.
- [ ] Treat an id missing from the config as enabled by default, so adding a tool does not
      require editing config in two places.
- [ ] Test: a disabled tool is absent from the home page, is unreachable by direct URL, and
      its absence breaks nothing else.
- [ ] Document the file in the README, including how to turn a tool off without a developer.

**Open question:** should this be build-time (disabled tools excluded from the bundle) or
runtime (shipped but hidden)? Runtime is simpler and allows a config-only redeploy;
build-time gives smaller bundles and keeps unfinished work off the wire. Recommendation:
**runtime**, unless bundle size becomes a real problem on the school network.

## 7. Tier 1 tools `[ ]`

The three Tier 1 tools in [tools.md](tools.md), chosen because each proves a distinct
technical pattern. Build all three before Tier 2 — they de-risk everything that follows.

- [ ] **`periodic-table`** — build to the design in [tools.md](tools.md#periodic-table).
      Proves the data-driven pattern. Ship the state-at-temperature mode; it is the feature
      that justifies the tool.
- [ ] **`molar-mass`** — build to the design in [tools.md](tools.md#molar-mass). Proves the
      formula parser against real input, including hydrates and nested parentheses.
- [ ] **`gas-laws`** — build to the design in [tools.md](tools.md#gas-laws). Proves the
      simulation pattern.
  - [ ] **Establish and document the canvas/framework boundary convention here.** Every
        later simulation copies this file's structure, so get it right once and write down
        why it is shaped that way.
  - [ ] Profile particle count against frame rate on the actual classroom hardware.
- [ ] After the first tool ships, demo it before continuing. The feedback will reshape the
      design system, and that is cheaper to absorb after one tool than after three.

## 8. URL-encoded state `[ ]`

- [ ] Serialize each tool's full configuration into the query string.
- [ ] Restore state from the URL on load.
- [ ] A "copy link to this setup" button on every tool, provided by `ToolShell`.
- [ ] Decide the encoding format (see questions.md #25) and whether randomized tools need a
      shareable seed (questions.md #26).

Why this matters: it gives shareable, bookmarkable scenarios with **no backend at all** —
she can prepare five titrations as bookmarks before class — and it is the migration path to
a student-facing app later without rearchitecting.

## 9. Deploy `[ ]`

- [ ] Choose the host (GitHub Pages, Netlify, or Cloudflare Pages).
- [ ] CI: on push to `main`, run tests, build, and deploy. Fail the deploy if tests fail —
      wrong chemistry must not reach the classroom.
- [ ] Verify the deployed site on the actual classroom projector, on the actual school
      network, before relying on it in a lesson.
- [ ] Confirm it works on whatever devices students would use (questions.md #12).

## 10. Tier 2 tools `[ ]`

Designs in [tools.md](tools.md#tier-2). **Build order should follow the unit she teaches
next** (questions.md #6), not the order listed here.

- [ ] `equation-balancer` — highest correctness stakes on the site; must fail loudly rather
      than answer wrongly.
- [ ] `stoichiometry` — build after the balancer and molar mass, since it composes both.
- [ ] `titration` — check PhET coverage first (questions.md #7) before committing to it.
- [ ] `vsepr-viewer` — evaluate `3Dmol.js` before building on raw Three.js.
- [ ] `electron-configuration`
- [ ] `heating-curve`
- [ ] `emission-spectra`

## 11. Tier 3 tools — drills and bell-ringers `[ ]`

Designs in [tools.md](tools.md#tier-3--drills-and-bell-ringers). Individually small, and
collectively likely the most-used pages on the site.

- [ ] `nomenclature-drill` — confirm her naming convention first (questions.md #22).
- [ ] `sig-figs` — promote to Tier 2 if she grades sig figs (questions.md #19).
- [ ] `dimensional-analysis`
- [ ] `solutions-dilution`
- [ ] `half-life`
- [ ] `le-chatelier` — confirm it is in her curriculum at all (questions.md #5).
- [ ] `lab-measurement`

## 12. Polish and accessibility `[ ]`

- [ ] Keyboard navigation on every tool, verified.
- [ ] Screen reader labels on all controls; numeric readouts announced on change.
- [ ] Audit every tool against the "no meaning in color alone" convention.
- [ ] Reduced-motion support for the animated simulations.
- [ ] Print stylesheet, if printable worksheets turn out to be wanted (questions.md #9).
- [ ] Offline support via a service worker, if the school network is unreliable
      (questions.md #14).

## 13. Possible future work — explicitly out of scope for now

- [ ] Backend API: saved student progress, teacher-assigned problem sets, class scoreboards.
- [ ] LMS embedding (Canvas, Google Classroom) if that is how it would be assigned.
- [ ] Content authoring, so the teacher can add her own problem sets without writing code.
- [ ] The tools deferred at the end of [tools.md](tools.md#deferred-with-reasons), each with
      the reason it was deferred.
