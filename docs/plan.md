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

## 1. ★ `mass-balance` — the first tool `[ ]`

**Requested.** Source:
[`reference/labs/LAB Measuring Mass Inquiry.md`](../reference/labs/LAB%20Measuring%20Mass%20Inquiry.md).
Design: [tools.md](tools.md#mass-balance--using-a-balance). Lab Tasks 2A, 2B, 3, 4 and 5
must be possible on the page.

This goes first for two reasons beyond being requested: it needs no element data and no
formula parser, so it does not wait on `chem-core` (item 3), and it is the first tool to run
end to end through the shell, registry, config, and reveal gate — which the throwaway tool
used to verify the registry never did with real content.

- [ ] **Balance model in `chem-core`**, `src/core/balance.ts`, test-first in the `node`
      project. Pure state and pure functions, no DOM.
  - [ ] State: `powered`, `decimals` (1 or 2), `tareOffset`, and the set of items on the
        pan, each with a true mass held to three decimals.
  - [ ] `reading()` returns `round(load − tareOffset, decimals)`; the readout string is
        exactly what a balance shows — `-2.35`, `0.00`, and _nothing_ while powered off.
  - [ ] `tare()` sets the offset to the current load. Tare while powered off does nothing.
        Power off then on clears the tare, as a real balance does.
  - [ ] Containment: the sphere and balloons go in the weigh boat, the weigh boat and the
        cup go on the pan, water goes in the cup and only while the cup is off the pan. The
        model refuses an illegal move with a reason, so the UI can show the lab's own warning
        rather than inventing one.
  - [ ] Water: `massOfWater(mL, density)` with density defaulting to exactly 1.000 g/mL.
  - [ ] Item dataset with realistic mass ranges and a `randomize()`: weigh boat 1–3 g,
        marble ~5 g, cup 5–15 g, empty balloon 2–3 g, inflated balloon = empty + a few
        tenths of a gram (the _balance reading_, not the air's true mass — see the tool's
        design entry for why, and questions.md #34).
  - [ ] **Fixtures from the lab itself.** Task 2A: boat 2.35, boat + sphere 7.47, sphere
        5.12. Task 2B on the same true masses: tare, then sphere reads 5.13 — one unit in
        the last place different from 2A, from rounding alone. That discrepancy is the test
        that the model holds three decimals internally and rounds only on display. Task 3:
        cup tared, cup lifted off reads negative the cup's mass. Task 4: subtraction of two
        readings. Task 5: 73 mL reads 73.00 g at the default density.
- [ ] **The balance in SVG**, `src/tools/mass-balance/`. Pan, readout, Power, Tare. The
      readout is the biggest thing on the page — it is what the back row needs to read.
      Sized from tokens, not pixels, so projector mode reflows it. Items on the pan are drawn
      on the pan, so the picture and the number agree.
- [ ] **Bench and items.** Each item is a button that moves it between bench and pan, with
      its current location in the accessible name ("Weigh boat — on the balance"). The
      graduated cylinder is a `NumberField` in mL plus a "Pour into cup" action. Illegal
      moves show the model's reason inline, in the lab's own words.
- [ ] **Record table.** One row per blank in the chosen task, a "Record" button capturing
      the current readout, and the task's calculation behind `RevealAnswer` with the recorded
      numbers substituted in, at the balance's precision and no more. For 2B, the reveal
      compares with 2A's result and says whether they match and why they might not.
- [ ] **Task picker** with the five tasks plus Sandbox. Choosing a task lays out the bench,
      resets the balance, and shows the task's steps as a checklist. Task 5 adds four
      "day of the month" fields whose sum sets the cylinder volume. Stretch: steps tick
      themselves as the state matches.
- [ ] **Options** read from `tools.config.json`: `decimals`, `tareLabel`, `waterDensity`.
      Documented in the tool's design entry.
- [ ] **Register** it in `src/tools/index.ts`; delete `src/core/scaffold.ts` and its test
      now that a real core module exists.
- [ ] **Component tests**, test-first: the answer stays hidden until revealed; recording
      captures what the readout shows; pouring into a cup on the balance is refused and the
      refusal is visible; the readout is empty while powered off; `R` resets; every control is
      reachable by keyboard.
- [ ] **Verify by eye** — this is where TDD stops: all four display modes, the readout
      legible at 1024x768, and a keyboard-only walk through all five tasks. Look at it
      before calling it done; the navigation panel's tests were green while its close
      button was unclickable.
- [ ] **Demo it to the teacher before building anything else.** Bring questions.md #30–#36
      — they are all about matching her actual balances and balloons, and the answers may
      change the defaults.

## 2. Foundation leftovers `[ ]`

What remains of the design system and app shell. Everything else in those areas is done
and recorded in the README. None of this blocks item 1.

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
[tools.md](tools.md) lists which of these it needs. The balance model from item 1 is the
first module to land here.

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
