# SiyanceTool — Build Plan

A static website hosting a collection of interactive chemistry tools for a high school
classroom. Primary use case: the teacher shares her screen and drives a tool live during a
lesson. Secondary (future) use case: students open the same tools themselves.

**Constraint:** no backend API for now. Everything runs in the browser. The architecture
should not make adding a backend later painful.

This document is the **actionable build sequence**. It does not describe what the tools do —
[tools.md](tools.md) is the design document for that, and every tool item below consults it.
Open questions raised along the way live in [questions.md](questions.md).

**Completed items are removed from this document** and recorded in the README under
"Decision record", so this file only ever holds work that is still ahead. Item numbers
shift when that happens; references elsewhere are updated at the same time.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked on a decision

---

## How we work

**Test-driven wherever practical.** For each new feature: write the failing test first, watch
it fail for the reason you expect, then write the smallest thing that passes it. A test that
has never been seen to fail is not evidence of anything.

This applies to both halves of the codebase, for different reasons:

- **`chem-core`** — because wrong chemistry shown to a class is the worst failure this
  project can produce, and because chemistry has known-correct answers. Textbook problems
  make excellent fixtures: the expected value exists before the code does.
- **Components and tools** — because their requirements are behavioral and phrased the way a
  test already is. "The answer stays hidden until she clicks" is a test. Writing it first
  keeps the component honest about what it actually promises.

Where TDD does not fit — visual polish, canvas rendering, animation feel, layout on a
projector — say so and verify it by looking at it instead. Do not write a hollow test to
claim coverage of something a test cannot judge.

**Every feature ships with its tests**, in the same commit. `npm run check` (lint, format,
typecheck, test) must pass before committing.

## Priority

Tools are one of two kinds, and the kind decides where they sit in this plan:

- **★ Requested** — traced to material the teacher supplied in [`reference/`](../reference/).
  These build first, ahead of anything proposed, whatever tier the proposal was given. The
  tool's entry in [tools.md](tools.md) names its source file.
- **Proposed** — suggested by the planning docs. Ordered by tier, then by the unit she
  teaches next (questions.md #6).

Items are ordered by priority below. Requested tools are marked ★ in their headings.

---

## 1. ★ `mass-balance` — the first tool `[~]` — built 2026-09-10, awaiting demo

**Requested.** Source:
[`reference/labs/LAB Measuring Mass Inquiry.md`](../reference/labs/LAB%20Measuring%20Mass%20Inquiry.md).
Design: [tools.md](tools.md#mass-balance--using-a-balance). Lab Tasks 2A, 2B, 3, 4 and 5
must be possible on the page.

This went first for two reasons beyond being requested: it needs no element data and no
formula parser, so it did not wait on `chem-core` (item 3), and it is the first tool to run
end to end through the shell, registry, config, and reveal gate with real content.

- [x] **Balance model in `chem-core`**, `src/core/balance.ts`, test-first in the `node`
      project — 31 tests, fixtures taken from the lab's own numbers, including the one-unit
      disagreement between the subtraction and tare methods that Task 2B asks about.
- [x] **The balance in SVG**, `src/tools/mass-balance/`, with the display as HTML so the
      reading is a live region rather than a picture of a number.
- [x] **Bench and items**, with each item's location in its accessible name. **Deviation
      from the design:** choosing a task does _not_ reset the balance. The lab's tasks run on
      continuously — 2B starts with the sphere still in the boat from 2A, and Task 3 begins
      "remove the weigh boat and sphere" — so the bench keeps continuity and only Reset
      clears it. Items from a previous task that are still on the balance stay visible.
- [x] **Data table** with the calculation behind the reveal gate; 2B compares with 2A.
      The visible button text is just "Record" (the step says what), because the full
      wording wrapped to four lines at projector type on a 1024-wide screen.
- [x] **Walkthrough** (restructured 2026-09-10 after the first look): the steps are shown
      with the current one marked, and the marker moves on by itself when a step's action is
      taken — each step carries a condition on the action and the balance state; steps with
      no condition are passed over, and consecutive satisfied steps complete together. Back
      and Next remain for stepping by hand and run on into the next task. Each "Record" step
      carries its own Record button. No checkboxes. Sandbox is listed last. The balance was redrawn as one object — pan, shroud and stem in SVG,
      landing on an HTML housing with the display and buttons.
- [x] **Options** `decimals`, `tareLabel`, `waterDensity`, read leniently so a bad value in
      config falls back to the default. This needed one registry change: `AppRoutes` now
      renders each tool with `{ options }`, which it had not been doing.
- [x] **Registered**; `src/core/scaffold.ts` deleted.
- [x] **Component tests**, 18 of them, behavioural: hidden until revealed, refusals visible,
      display blank while off, options honoured and bad options survived.
- [~] **Verify by eye.** Done in the browser: dark/normal, dark/projector, and
  light/projector at 1024x768 (no horizontal overflow, 64px display, doubled strokes,
  single-line table rows). Still to do: light/normal by eye, 1920x1080, and a
  keyboard-only walk through all five tasks.
- [ ] **Demo it to the teacher before building anything else.** Bring questions.md #30–#36
      — they are all about matching her actual balances and balloons, and the answers may
      change the defaults.

## 2. Foundation leftovers `[ ]`

What remains of the design system and app shell. Everything else in those areas is done
and recorded in the README.

- [ ] Verify the categorical palette on real classroom hardware. The colour choices are
      theoretically sound, but "readable from the back of the room" is a claim about a
      specific projector and has not been tested on one (questions.md #11).
- [ ] Confirm the shell and the first tool work at both 1024x768 and 1920x1080.
- [ ] **3D library:** `three.js` directly, or `3Dmol.js`. Deferred — evaluate when
      `vsepr-viewer` comes up (questions.md #24).
- [ ] **Hosting:** GitHub Pages via Actions, Netlify, or Cloudflare Pages — all free, all
      static. Deferred to item 6.

## 3. Build `chem-core`, the shared chemistry library `[ ]`

Pure functions, no UI, fully unit-tested. Most tools depend on this, and retrofitting it
later is painful — which is why it comes before the proposed tools. Each tool's entry in
[tools.md](tools.md) lists which of these it needs. The balance model from item 1
(`src/core/balance.ts`) is the first module here.

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
- [ ] Significant figures: counting, rounding, and propagation through operations. The
      balance model's fixed-decimal rounding is the seed of this module.
- [ ] Ion and polyatomic-ion tables for nomenclature.
- [ ] **Tests for every one of the above**, using known textbook problems with known answers
      as fixtures.

## 4. Tier 1 tools — proposed `[ ]`

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

## 5. URL-encoded state `[ ]`

- [ ] Serialize each tool's full configuration into the query string.
- [ ] Restore state from the URL on load.
- [ ] A "copy link to this setup" button on every tool, provided by `ToolShell`.
- [ ] Decide the encoding format (see questions.md #25) and whether randomized tools need a
      shareable seed (questions.md #26). `mass-balance` is the first tool with randomized
      values, so it is the first to need an answer.

Why this matters: it gives shareable, bookmarkable scenarios with **no backend at all** —
she can prepare five titrations as bookmarks before class — and it is the migration path to
a student-facing app later without rearchitecting.

## 6. Deploy `[ ]`

- [ ] Choose the host (GitHub Pages, Netlify, or Cloudflare Pages).
- [ ] CI: on push to `main`, run tests, build, and deploy. Fail the deploy if tests fail —
      wrong chemistry must not reach the classroom.
- [ ] Verify the deployed site on the actual classroom projector, on the actual school
      network, before relying on it in a lesson.
- [ ] Confirm it works on whatever devices students would use (questions.md #12).

## 7. Tier 2 tools — proposed `[ ]`

Designs in [tools.md](tools.md#tier-2). **Build order should follow the unit she teaches
next** (questions.md #6), not the order listed here — and any newly requested tool jumps
ahead of all of these.

- [ ] `equation-balancer` — highest correctness stakes on the site; must fail loudly rather
      than answer wrongly.
- [ ] `stoichiometry` — build after the balancer and molar mass, since it composes both.
- [ ] `titration` — check PhET coverage first (questions.md #7) before committing to it.
- [ ] `vsepr-viewer` — evaluate `3Dmol.js` before building on raw Three.js.
- [ ] `electron-configuration`
- [ ] `heating-curve`
- [ ] `emission-spectra`

## 8. Tier 3 tools — drills and bell-ringers, proposed `[ ]`

Designs in [tools.md](tools.md#tier-3--drills-and-bell-ringers). Individually small, and
collectively likely the most-used pages on the site.

- [ ] `nomenclature-drill` — confirm her naming convention first (questions.md #22).
- [ ] `sig-figs` — promote to Tier 2 if she grades sig figs (questions.md #19).
- [ ] `dimensional-analysis`
- [ ] `solutions-dilution`
- [ ] `half-life`
- [ ] `le-chatelier` — confirm it is in her curriculum at all (questions.md #5).
- [ ] `lab-measurement` — reading instruments; the balance _procedure_ is already covered
      by `mass-balance`, so this one is about reading the scale.

## 9. Polish and accessibility `[ ]`

- [ ] Keyboard navigation on every tool, verified.
- [ ] Screen reader labels on all controls; numeric readouts announced on change.
- [ ] Audit every tool against the "no meaning in color alone" convention.
- [ ] Reduced-motion support for the animated simulations.
- [ ] Print stylesheet, if printable worksheets turn out to be wanted (questions.md #9).
- [ ] Offline support via a service worker, if the school network is unreliable
      (questions.md #14).

## 10. Possible future work — explicitly out of scope for now

- [ ] Backend API: saved student progress, teacher-assigned problem sets, class scoreboards.
- [ ] LMS embedding (Canvas, Google Classroom) if that is how it would be assigned.
- [ ] Content authoring, so the teacher can add her own problem sets without writing code.
- [ ] The tools deferred at the end of [tools.md](tools.md#deferred-with-reasons), each with
      the reason it was deferred.
