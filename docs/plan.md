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

Above both: **bugfixes**. Item 1 is always the list of things found wrong in use, because
a bug in front of a class outranks any new feature.

Items are ordered by priority below. Requested tools are marked ★ in their headings.

---

## 1. Bugfixes `[~]`

Problems found by using the tools — in rehearsal, in demos, in class. This item stays at
the top of the plan: a bug in front of a class outranks any new feature. Each entry says
where it was seen and what the fix was. Fixed entries stay listed until the next plan
review clears them into the README.

- [x] **`mass-balance` — Task 3 steps out of order** (found and fixed 2026-09-13). The page
      followed the worksheet, which lists "measure out 10 mL" before "place the empty cup on
      the balance". The balance is used the other way round: cup on, record, Tare, cup off,
      and only then measure and pour. Reordered on the page; the worksheet's wording is
      otherwise unchanged. Covered by the test "runs Task 3 in the order a balance is
      actually used".
- [x] **`mass-balance` — Task 5 never cleared the pan** (found and fixed 2026-09-13, in the
      same review). Arriving from Task 4 with the boat and balloon still on, Task 5 went
      straight to "place the cup and press Tare", so the tare included the boat and "Record
      mass of water" waited forever. Task 5 now starts "take everything off the balance",
      then runs Task 3's bench steps in Task 3's order: cup on and Tare, cup off, measure,
      pour, cup back.
- [x] **`mass-balance` — Task 3 poured the cup out on the balance** (same review). Step 9
      emptied the cup while it sat on the pan. Pouring out over the pan is as bad as pouring
      in, so the step now takes the cup off first and the model refuses otherwise, with a
      reason, the way it refuses pouring in.
- [x] **`mass-balance` — Record did not check the other container** (same review). The boat
      tasks' Record buttons did not require the cup to be off, nor the cup tasks the boat.
      Every readiness rule now does.
- [x] **`mass-balance` — Task 5 recorded the wrong volume** (found and fixed 2026-09-13).
      "Record volume" captured the cylinder field, not what was poured, so a birthday changed
      after pouring made the reveal compare the wrong volume. It now records the water in the
      cup.
- [x] **`mass-balance` — "Press Tare first" could loop** (same day). A tare taken with water
      already in the cup can never be fixed by pressing Tare again, yet that was the advice.
      The message now says how to get to the right tare — "tare with the empty cup alone on
      the balance first: pour the water out, cup on, press Tare, cup off, pour again" — and
      the steps that assume a zeroed empty pan (2A, the cup in Task 3, Task 4) now require
      it, so a stale tare from an earlier task can no longer record "weigh boat 0.00 g".
- [x] **`mass-balance` — the sandbox had nowhere to record** (same day). It was a one-line
      "step" with a walkthrough marker and a dead Next button, and no way to note a reading,
      so Task 6 — a pencil, the soda in a can, the gas from a reaction, all subtractions of
      two readings — could not be acted out. It is now free play: a log of readings and the
      difference of the last two behind the reveal gate.
- [ ] _Log new ones here as they are found._

## 2. ★ `mass-balance` — what remains `[~]`

The tool is built (2026-09-10) and iterated on after first use; the build record is in the
README's decision record. Design: [tools.md](tools.md#mass-balance--using-a-balance).
Source: [`reference/labs/LAB Measuring Mass Inquiry.md`](../reference/labs/LAB%20Measuring%20Mass%20Inquiry.md).

- [~] **Verify by eye.** Done in the browser: dark/normal, dark/projector, light/projector,
  all at 1024x768 with no horizontal overflow. Still to do: light/normal by eye,
  1920x1080, and a keyboard-only walk through all five tasks.
- [ ] **Demo it to the teacher before building anything else.** Bring questions.md #30–#36
      — they are all about matching her actual balances and balloons, and the answers may
      change the defaults. Anything she trips over goes into item 1.

## 3. Foundation leftovers `[ ]`

What remains of the design system and app shell. Everything else in those areas is done
and recorded in the README.

- [ ] Verify the categorical palette on real classroom hardware. The colour choices are
      theoretically sound, but "readable from the back of the room" is a claim about a
      specific projector and has not been tested on one (questions.md #11).
- [ ] **3D library:** `three.js` directly, or `3Dmol.js`. Deferred — evaluate when
      `vsepr-viewer` comes up (questions.md #24).
- [ ] **Hosting:** GitHub Pages via Actions, Netlify, or Cloudflare Pages — all free, all
      static. Deferred to item 7.

## 4. Build `chem-core`, the shared chemistry library `[ ]`

Pure functions, no UI, fully unit-tested. Most tools depend on this, and retrofitting it
later is painful — which is why it comes before the proposed tools. Each tool's entry in
[tools.md](tools.md) lists which of these it needs. The balance model built for
`mass-balance` (`src/core/balance.ts`) is the first module here.

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

## 5. Tier 1 tools — proposed `[ ]`

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

## 6. URL-encoded state `[ ]`

- [ ] Serialize each tool's full configuration into the query string.
- [ ] Restore state from the URL on load.
- [ ] A "copy link to this setup" button on every tool, provided by `ToolShell`.
- [ ] Decide the encoding format (see questions.md #25) and whether randomized tools need a
      shareable seed (questions.md #26). `mass-balance` is the first tool with randomized
      values, so it is the first to need an answer.

Why this matters: it gives shareable, bookmarkable scenarios with **no backend at all** —
she can prepare five titrations as bookmarks before class — and it is the migration path to
a student-facing app later without rearchitecting.

## 7. Deploy `[ ]`

- [ ] Choose the host (GitHub Pages, Netlify, or Cloudflare Pages).
- [ ] CI: on push to `main`, run tests, build, and deploy. Fail the deploy if tests fail —
      wrong chemistry must not reach the classroom.
- [ ] Verify the deployed site on the actual classroom projector, on the actual school
      network, before relying on it in a lesson.
- [ ] Confirm it works on whatever devices students would use (questions.md #12).

## 8. Tier 2 tools — proposed `[ ]`

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

## 9. Tier 3 tools — drills and bell-ringers, proposed `[ ]`

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

## 10. Polish and accessibility `[ ]`

- [ ] Keyboard navigation on every tool, verified.
- [ ] Screen reader labels on all controls; numeric readouts announced on change.
- [ ] Audit every tool against the "no meaning in color alone" convention.
- [ ] Reduced-motion support for the animated simulations.
- [ ] Print stylesheet, if printable worksheets turn out to be wanted (questions.md #9).
- [ ] Offline support via a service worker, if the school network is unreliable
      (questions.md #14).

## 11. Possible future work — explicitly out of scope for now

- [ ] Backend API: saved student progress, teacher-assigned problem sets, class scoreboards.
- [ ] LMS embedding (Canvas, Google Classroom) if that is how it would be assigned.
- [ ] Content authoring, so the teacher can add her own problem sets without writing code.
- [ ] The tools deferred at the end of [tools.md](tools.md#deferred-with-reasons), each with
      the reason it was deferred.
