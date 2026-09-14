# SiyanceTool — Build Plan

A static website hosting a collection of interactive chemistry tools for a high school
class. **Primary use case (since 2026-09-13): a student, alone, on their own device** —
reviewing a lab they did in class, or making up a lab they missed without using class
time. Secondary use case: the teacher drives a tool on the projector during a lesson. The
tools are the same; what changes is that nobody is standing next to the student to explain
the page, to keep their work safe, or to collect it.

**Constraint:** no backend API for now. Everything runs in the browser. The architecture
should not make adding a backend later painful — and the pivot to students makes "later"
closer, because saving and handing in work are the first things a backend would do.

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

- **`chem-core`** — because wrong chemistry shown to a student is the worst failure this
  project can produce, and because chemistry has known-correct answers. Textbook problems
  make excellent fixtures: the expected value exists before the code does.
- **Components and tools** — because their requirements are behavioral and phrased the way a
  test already is. "The answer stays hidden until clicked" is a test. Writing it first keeps
  the component honest about what it actually promises.

Where TDD does not fit — visual polish, canvas rendering, animation feel, layout on a phone
or a projector — say so and verify it by looking at it instead. Do not write a hollow test to
claim coverage of something a test cannot judge.

**Every feature ships with its tests**, in the same commit. `npm run check` (lint, format,
typecheck, test) must pass before committing.

## Priority

The audience decides the order. A student alone needs, in this order: a working URL on
their own device; a page that keeps their work and explains itself; and the lab they are
reviewing or making up, complete enough to finish without a teacher. Everything else comes
after.

- **Bugfixes** are always item 1. A student stuck on a broken page at home has nobody to
  ask, so a bug outranks any new feature.
- **★ Requested** tools — traced to material the teacher supplied in
  [`reference/`](../reference/) — build first, ahead of anything proposed. With the pivot,
  `reference/` is not just a source of ideas: **every lab she does in class is a make-up lab
  this site should offer**, so each lab that lands there is a tool to build.
- **Proposed** tools are now ranked by review value — what a student would open the night
  before a test — rather than by what proves a technical pattern. Drills and reference
  tools rise; simulations that are mainly a spectacle for a projector fall.

Items are ordered by priority below. Requested tools are marked ★ in their headings.

---

## 1. Bugfixes `[~]`

Problems found by using the tools — by a student at home, in rehearsal, in demos, in class.
This item stays at the top of the plan. Each entry says where it was seen and what the fix
was. Fixed entries stay listed until the next plan review clears them into the README.

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

## 2. Ship it — a URL students can open `[ ]`

Nothing below matters until a student can open the site on their own device. This was item
7; the pivot moves it up.

- [?] **Which devices?** (questions.md #12) — **blocking.** School Chromebooks are a laptop
  layout; personal phones are not. The answer decides how much of item 3 is layout work.
- [ ] Choose the host (GitHub Pages via Actions, Netlify, or Cloudflare Pages — all free, all
      static) and check the school network does not block it (questions.md #13).
- [ ] CI: on push to `main`, run `npm run check`, build, and deploy. Fail the deploy if
      anything fails — wrong chemistry must not reach a student.
- [ ] Open the deployed site on the actual student device, on the actual school network, and
      on a phone on mobile data, before telling anyone the URL.
- [ ] Give the teacher the URL and a one-line description she can paste into whatever she
      uses to assign work (questions.md #37).

## 3. Built for a student alone `[ ]`

Site-wide work that every tool inherits. Each of these was optional when a teacher was
driving; none is optional for a student at home.

- [ ] **Works on the student's screen.** The shell and `mass-balance` on a phone-width
      viewport and on a Chromebook: single column, touch targets no smaller than the
      existing buttons, nothing that needs hover, and the balance display still the biggest
      thing on the page. `resize_window` to the mobile preset is the test bench until real
      devices are in hand.
- [ ] **Keeps their work.** A reload, a closed tab, or a dead battery must not lose twenty
      minutes of a lab. Persist each tool's state in `localStorage` under the tool's id,
      restore it on load, and give Reset a confirmation now that it destroys real work.
      Nothing leaves the device; this is not a backend.
- [ ] **Explains itself.** Every tool opens with what it is for and what to do first, in the
      student's voice — "you", not "the class" — because nobody is narrating. The
      walkthrough already does most of this for `mass-balance`; the shell should carry the
      pattern so every tool gets it.
- [ ] **Their own numbers, reproducibly.** Randomize on first open so two students at home
      do not share an answer, and put the seed in the URL so the same numbers come back on
      reload and so the teacher can open exactly what a student saw (questions.md #26, #38).
      This absorbs the old "URL-encoded state" item: the URL carries the seed and the
      configuration; `localStorage` carries the progress.
- [ ] **Produces something to hand in.** A completed lab has to leave the page somehow.
      Until there is a backend, that means a print stylesheet that renders a tool's data and
      answers as a clean lab sheet the student can print or save as PDF, plus a "copy as
      text" fallback for pasting into an LMS. What she will accept is questions.md #37.
- [ ] **Self-check before reveal.** The reveal gate was built so a teacher could ask the
      class before telling them. A student alone will just click it. Every reveal should
      first invite the student's own answer — a number field for a calculation, a choice for
      a comparison — and then show the worked answer beside it, marked right or not. The
      component is shared (`RevealAnswer` grows a `check` variant); each tool decides what
      to ask.

## 4. ★ `mass-balance` — the make-up lab `[~]`

The tool is built (2026-09-10) as a rehearsal of the "Measuring Mass" lab; the build record
is in the README's decision record. Design:
[tools.md](tools.md#mass-balance--using-a-balance). Source:
[`reference/labs/LAB Measuring Mass Inquiry.md`](../reference/labs/LAB%20Measuring%20Mass%20Inquiry.md).

For a student making the lab up, rehearsal is not enough: they need to come out the other
end with the worksheet done. Everything the design entry lists as "not captured" comes back
into scope, except what genuinely needs the real bench.

- [ ] **The whole worksheet, on the page.** In the lab's order:
  - [ ] Pre-lab: the objective's blanks, "define mass", the equipment match, and the units
        question — as short self-check questions, answered before the tasks unlock.
  - [ ] Task 1 from the simulated balance: decimals, units, and the weigh boat's mass are
        already there; the lid (questions.md #35) and "is it light or heavy" become questions
        the student answers from the page.
  - [ ] Tasks 2A–5 as now, with the self-check-before-reveal from item 3 on each
        calculation.
  - [ ] Task 6's three procedures as text answers the student writes on the page, kept with
        the rest of their work and included in the hand-in sheet. The sandbox stays as the
        place to try them out.
- [ ] **Hand-in sheet**: the print view from item 3, laid out like the worksheet — every
      blank filled with what the student recorded and wrote, in the worksheet's order, with
      their name and the seed so the teacher can reproduce their numbers.
- [ ] **Two voices, one page.** Keep the projector rehearsal working: a `mode` option
      (`student` by default, `teacher` for the projector) that hides the pre-lab and Task 6
      writing and shows the walkthrough alone. The student mode is the default because that
      is who opens it unattended.
- [~] **Verify by eye.** Done: dark/normal, dark/projector, light/projector at 1024x768.
  Still to do: a phone-width viewport end to end, light/normal, 1920x1080, and a
  keyboard-only walk through all five tasks.
- [ ] **Demo it** — to the teacher with questions.md #30–#36 and #37–#41, and to one
      student, alone, unprompted, watching where they get stuck. The second demo is the one
      that matters now. Anything either trips over goes into item 1.

## 5. Foundation leftovers `[ ]`

What remains of the design system and app shell. Everything else in those areas is done
and recorded in the README.

- [ ] Verify the categorical palette on real classroom hardware (questions.md #11). Lower
      priority now that the projector is the secondary use; still needed before the
      teacher relies on it in a lesson.
- [ ] **3D library:** `three.js` directly, or `3Dmol.js`. Deferred — evaluate when
      `vsepr-viewer` comes up (questions.md #24).

## 6. Build `chem-core`, the shared chemistry library `[ ]`

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

## 7. Proposed tools for review — what a student opens before a test `[ ]`

Designs in [tools.md](tools.md). Reordered for the new audience: the tools a student uses
alone to check their own understanding come first. **Any lab that lands in `reference/`
jumps ahead of all of these.** Build order within the list should follow the unit she is
teaching (questions.md #6).

- [ ] **`periodic-table`** — the reference page every other tool links into; the
      state-at-temperature slider is the review hook.
- [ ] **`molar-mass`** — with the formula parser; shows its working, which is what a student
      checking homework wants.
- [ ] **`nomenclature-drill`** — endless generated practice with instant feedback. Confirm
      her naming convention first (questions.md #22).
- [ ] **`sig-figs`** — promote further if she grades sig figs (questions.md #19).
- [ ] **`dimensional-analysis`**
- [ ] **`equation-balancer`** — its _practice_ mode is the review tool; highest correctness
      stakes on the site, must fail loudly rather than answer wrongly.
- [ ] **`stoichiometry`** — after the balancer and molar mass, since it composes both.
- [ ] **`solutions-dilution`**
- [ ] **`lab-measurement`** — reading instruments; pairs with `mass-balance` for lab
      make-up.
- [ ] **`half-life`**

## 8. Proposed simulations — the projector spectacles `[ ]`

Designs in [tools.md](tools.md). These earn their page by showing what cannot be seen in a
classroom, which is still true — but a student reviewing alone gets less from a spectacle
than from a drill, so they follow item 7 unless a unit's lab needs one.

- [ ] **`gas-laws`** — the first canvas simulation.
  - [ ] **Establish and document the canvas/framework boundary convention here.** Every
        later simulation copies this file's structure.
  - [ ] Profile particle count against frame rate on a Chromebook, not a dev laptop.
- [ ] `titration` — check PhET coverage first (questions.md #7) before committing to it.
- [ ] `heating-curve`
- [ ] `vsepr-viewer` — evaluate `3Dmol.js` before building on raw Three.js.
- [ ] `electron-configuration`
- [ ] `emission-spectra`
- [ ] `le-chatelier` — confirm it is in her curriculum at all (questions.md #5).

## 9. Polish and accessibility `[ ]`

- [ ] Keyboard navigation on every tool, verified.
- [ ] Screen reader labels on all controls; numeric readouts announced on change.
- [ ] Audit every tool against the "no meaning in color alone" convention.
- [ ] Reduced-motion support for the animated simulations.
- [ ] Offline support via a service worker, so a lab started on the bus finishes on the bus
      (questions.md #14). Higher priority than before now that the device is the student's.
- [ ] Projector mode stays and stays checked — it is the secondary use, not a dead one.

## 10. Possible future work — the backend question, now closer

- [ ] **Backend API.** Out of scope by constraint, but the pivot makes it the obvious next
      step: saved progress that follows a student between devices, and a hand-in that goes
      to the teacher instead of a printer. Revisit after the first make-up lab has been
      handed in the manual way (item 3) and it is clear what hurt.
- [ ] LMS embedding (Canvas, Google Classroom) — likely how make-up labs get assigned;
      questions.md #37 decides.
- [ ] Content authoring, so the teacher can add her own problem sets without writing code.
- [ ] The tools deferred at the end of [tools.md](tools.md#deferred-with-reasons), each with
      the reason it was deferred.
