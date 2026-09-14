# Tool Design

Design proposals for every tool on the site. [plan.md](plan.md) is the actionable build
sequence and consults this document for _what_ to build; this document holds the _why_ and
the _what it does_, and does not track scheduling.

Everything here is **proposed** until reviewed with the teacher — see
[questions.md](questions.md), which has several questions that could remove tools from this
list entirely.

Each tool has a stable `id`. That id is the route (`/gas-laws`), the source folder
(`src/tools/gas-laws/`), and the key in the tool config file that turns it on or off.

## Where tools come from

Every tool is one of two kinds, and the kind decides its priority:

- **★ Requested** — traced to material in [`reference/`](../reference/): a lab, worksheet,
  or note supplied by the teacher. The entry names its source file. A requested tool builds
  before any proposed tool, regardless of tier.
- **Proposed** — suggested here, on the reasoning in "what makes a tool worth a page". Every
  entry below is proposed unless it says otherwise.

When new material lands in `reference/`, it is read for tools the same way: what in it a
student could do again on a screen, and which parts a page can actually capture. Not every
part of a lab can — a page cannot teach what a weigh boat feels like — and the entry says
what it leaves out.

---

## What makes a tool worth a page

A tool earns a page if it is **better on a screen than on paper** for a student working
alone — a lab they can redo without the equipment, a drill that checks their answer
instantly, something too slow, too expensive, too dangerous, or too invisible to do at home
— or, for the teacher, better on a projector than on a whiteboard: something where instant
recalculation lets her run ten "what ifs" in the time one would take by hand.

A calculator with a text box does not earn a page on its own. If a tool's whole value is
producing a number, it should be folded into a tool that also _shows_ something.

## Who the tools are for

Since 2026-09-13 the primary user is **a student, alone, on their own device** — reviewing
a lab they did in class, or making one up without using class time. **The site stands in
for the equipment; the paper worksheet stays the record.** The student reads numbers off
the page and writes them on the sheet, as they would from the real balance. The teacher
driving a tool on the projector is the secondary use. The tools are the same; the difference
is that nobody is beside the student to explain the page. Every convention below is read
with that person in mind.

## Conventions every tool follows

These are built once in the design system and are not repeated in each tool below.

- **Explains itself.** A tool opens with what it is for and what to do first, addressed to
  "you". Nobody is narrating.
- **Self-check, then reveal.** Any final answer is hidden until asked for — so a teacher can
  ask the class first, and so a student alone commits to their own answer first. The reveal
  invites the student's answer, then shows the worked one beside it.
- **Keeps its place.** State survives a reload or a closed tab, on the device, so a student
  mid-task is not sent back to step 1.
- **Every equipment blank is answerable.** For a tool built from a lab, anything the
  worksheet asks that a student would answer by looking at or using the equipment can be
  answered from the page. The worksheet itself stays on paper; the page is never a form.
- **Their own numbers, reproducibly.** Randomized tools roll on first open and carry the
  seed in the URL, so two students do not share an answer and the teacher can reopen
  exactly what a student saw.
- **Reset and randomize.** Always present, always in the same place.
- **Works on the student's screen.** Single column on a phone, touch targets, nothing that
  needs hover. Projector legibility — readable from the back of the room — stays as the
  secondary requirement.
- **Keyboard driveable, with no shortcuts.** Every control is a real button or field, so
  Tab reaches it and Space or Enter works it. There are deliberately no hidden key
  bindings: in front of a class, a stray keystroke that resets the page is worse than any
  convenience.
- **No meaning in color alone.** Every color is paired with a label or pattern.
- **Registry entry.** Every tool registers itself with an id, title, unit, and one-line
  description, and can be switched off in config without touching its source.

## Priority tiers

**Tier 1** proves a distinct technical pattern and is worth building first.
**Tier 2** is high classroom value once the foundations exist.
**Tier 3** is drills and bell-ringers — individually small, collectively the things she'd
use most often.

Tier is _not_ build order, and since the pivot to students it is not priority either: the
plan ranks proposed tools by **review value** — what a student opens alone before a test —
which puts the Tier 3 drills and the reference tools ahead of the simulations. Requested
tools come first regardless: every lab in `reference/` is a make-up lab to build.

---

# ★ Requested

## `mass-balance` — Using a balance

**Unit:** states of matter, lab skills · **Source:** ★ requested —
[`reference/labs/LAB Measuring Mass Inquiry.md`](../reference/labs/LAB%20Measuring%20Mass%20Inquiry.md)
· **Pattern proved:** interactive SVG apparatus, and the first tool end to end

The lab puts four students around a $1200 balance most of them have never used, and asks
them to mass a solid, a liquid, and a gas. The page is a simulated digital balance she can
drive on the projector to rehearse the whole procedure with the class before anyone touches
the real one.

**Why it earns a page.** The things that break balances or wreck data all happen in the first
minute: pressing on the pan, pouring into a container while it sits on the balance, forgetting
to tare, and lifting a tared cup off and panicking at a negative number. A simulation lets
the class make those mistakes for free. It also holds still on moments a real balance cannot:
the readout going negative when the tared cup comes off, and the subtraction method and the
tare method landing on the same sphere — or, sometimes, on numbers 0.01 g apart, which is
exactly the question Task 2B asks.

**What it models.** A digital top-loading balance: a pan, a power button, a Tare/Zero
button, and a readout in grams to one or two decimal places. Tare is an offset, not magic —
the reading is always `round(load − tareOffset, decimals)` — and every task below falls out of
that one rule. Masses are held to three decimals internally and rounded only on the readout,
so two readings subtracted can legitimately differ from one tared reading by a unit in the
last place, with no artificial noise added.

**Controls**

- **Walkthrough.** The page is built from the teacher's side of the projector: the current
  task's steps are listed in the lab's own words with the current one marked, and **the
  marker moves on by itself when a step's action is taken** — press Power and it moves to
  "place the weigh boat"; record the reading and it moves again. Steps the page cannot
  detect ("measure out 10 mL", "compare with Task 2A") are passed when a later step's action
  is taken, and a state that already holds counts as done: starting Task 3 with a clear pan,
  one Tare press completes both "remove everything" and "press Tare". **Back** and **Next**
  are still there for stepping through by hand. The last step of one task runs on into the
  first step of the next, the way the lab does, and Next says which task it is handing off
  to. A task picker
  (2A, 2B, 3, 4, 5, then Sandbox last) jumps straight to a task's first step. Choosing a task
  does not touch the balance: the lab's tasks run on continuously (2B starts with the sphere
  still in the boat from 2A), so only Reset clears the bench, and anything still on the
  balance from an earlier task stays visible.
- **The balance:** Power, Tare (label configurable to Zero), in a housing directly under
  the pan so it reads as one object.
- **Bench items**, each a button that moves it between the bench and the pan: weigh boat,
  sphere, cup, empty balloon, inflated balloon. The sphere and the balloons sit in the weigh
  boat; the weigh boat and the cup sit on the pan.
- **Graduated cylinder:** a volume field in mL, and "pour into cup" and "empty the cup"
  actions that are only allowed while the cup is on the bench. Pouring in while the cup is
  on the balance is refused in the lab's own words — _never pour into a container on the
  balance_ — and pouring out is refused for the same reason.
- **Task 5 inputs:** four "day of the month" fields whose sum becomes the volume to measure.
- **New problem** re-rolls every item's mass within a small spread of its usual value —
  a few tenths of a gram, at most a quarter of the mass — so the numbers stay close to the
  worked example while no two problems share an answer. **Reset** clears the
  pan, powers the balance off, empties the records, and returns to the task's first step.

**Display**

- The pan drawn in SVG with what is on it, over an HTML housing holding the display and the
  buttons, so the reading is a live region rather than a picture of a number. The display
  shows exactly what a real balance shows — including `-12.34` after lifting a tared cup
  off, `0.00` after a tare, and nothing at all while powered off.
- Every step that says "Record" carries its own **Record** button, so the number lands next
  to the instruction that asked for it. Record is a **forced wait**: it stays disabled until
  the balance holds exactly what the step describes — powered on, the weigh boat on and the
  sphere off, tared with the cup alone — and says what is still missing, so "weigh boat" can
  never be recorded with the boat still on the bench. A **Data** table under the steps collects the task's
  readings, and the calculation the worksheet asks for — `(boat + sphere) − boat`,
  `(boat + balloon + air) − (boat + balloon)`, mass versus volume — is shown behind the
  **reveal gate** with the recorded numbers substituted in, so she can ask the class first.
  Readings persist across tasks, because 2B compares against 2A.

**What it has to get right**

- Tare and negative readings, as above. This is the core of the tool and is unit-tested in
  `chem-core` as a pure model with no UI.
- Rounding to the balance's precision, and showing calculations at that same precision —
  never more digits than the balance gave.
- **Water.** The lab teaches `1 mL of pure water = 1 g`, so the default density is exactly
  1.000 g/mL and Task 5 comes out matching. Real water at room temperature is 0.998 g/mL,
  which is worth a 0.2 g difference on a 100 mL sample; configurable, see questions.md #33.
- **The balloon.** A balance does **not** read the full mass of the air inside a balloon —
  the balloon displaces its own volume of room air, and buoyancy cancels all but the small
  excess from the balloon's overpressure. A real inflated party balloon reads only a few
  tenths of a gram more than an empty one, not the 3–4 g the air actually masses. The tool
  must show a balance reading (a small positive difference), not the true air mass, or the
  class will get a different number on the real balance and trust neither. The range needs
  checking against her balloons: questions.md #34.
- Item masses that are plausible: a plastic weigh boat around 2 g ("Is it LIGHT or
  Heavy?"), a glass marble around 5 g, a plastic cup around 8 g, an empty balloon around
  2.6 g, each with a small spread for New problem.

**Options** (`tools.config.json`)

| Option         | Default  | What it does                                                      |
| -------------- | -------- | ----------------------------------------------------------------- |
| `decimals`     | `2`      | Readout precision, `1` or `2`, to match the classroom's balances. |
| `tareLabel`    | `"Tare"` | `"Tare"` or `"Zero"`, whichever her balances say.                 |
| `waterDensity` | `1`      | g/mL used when water is poured. `0.998` for realism.              |

**How the lab maps onto the page**

| Lab task                             | On the page                                                                                                                                                                                                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2A — solid by subtraction            | Boat on pan, record; sphere into boat, record; reveal `(boat + sphere) − boat`.                                                                                                                                                                                                         |
| 2B — solid by Tare                   | Sphere out, boat stays; Tare shows `0.00`; sphere in, record; compare with 2A — the tool says whether the two agree, and why they may not.                                                                                                                                              |
| 3 — liquid in a cup                  | Clear pan, Tare; cup on, record; Tare; cup **off** — the readout goes negative and the page says why; measure, pour on the bench; cup back on, record the water alone. The page puts "measure out 10 mL" after "cup off", where the hands actually are; the worksheet lists it earlier. |
| 4 — gas in a balloon                 | Boat + empty balloon, record; swap for inflated balloon, record; reveal the subtraction.                                                                                                                                                                                                |
| 5 — metric is amazing                | Four dates sum to a volume; then Task 3's bench steps in Task 3's order — clear the pan, cup on and Tare, cup off, measure, pour, cup back — since the lab gives Task 5 no bench steps of its own; reveal mass beside volume and how close they are.                                    |
| 1 — parts of the balance             | Partly: power-on, decimals, units, and the weigh boat's mass are all there. The lid and "do not press the pan" are not — see below.                                                                                                                                                     |
| 6 — think (pencil, soda can, gas)    | The Sandbox: every item, a log of readings, and the difference of the last two behind the reveal gate — the shape of every Task 6 answer. The writing itself stays on paper.                                                                                                            |
| Roles, equipment match, units circle | Not captured. Paper.                                                                                                                                                                                                                                                                    |

**For a student making the lab up** (plan.md item 4). The student has the paper
worksheet and this page instead of the bench, so the page must make every
equipment-dependent blank answerable. Most already are — every "record the mass" comes
off the display. Three do not yet: Task 1's questions about the balance (lid, decimals,
units, light or heavy), which need a "your balance" note stating what this balance is; 2A's
"describe 3 properties of your sphere", which needs the sphere to be a describable object;
and Task 6's "Do it! Record the mass" of a pencil, which needs a pencil on the sandbox
bench. The worksheet is never reproduced on the page, and nothing is handed in through it
(questions.md #37).

**Still not captured.** A page cannot teach what "light" feels like or stop a hand pressing
on a pan, so those warnings stay on the worksheet — though "is it light or heavy" becomes a
question the student answers from the page. Reading a graduated cylinder's meniscus is
`lab-measurement`'s job, so here the cylinder is just a number field. The balance lid is
left out; it becomes a question if she wants it (questions.md #35).

**Depends on:** a `chem-core` balance model (`src/core/balance.ts`) — the tare arithmetic,
rounding, item dataset, and water conversion. No element data, no formula parser, which is
why it can be the first tool built.

**Risks.** The balloon number and the water density are both places where "what the lab
says", "what the balance reads", and "what is physically true" differ, and the tool has to
pick the one that matches what her class will see on the real bench. The record table
partly duplicates the paper worksheet; whether that is wanted or noise is questions.md #36.

---

# Tier 1

## `periodic-table` — Interactive periodic table

**Unit:** atomic structure, periodic trends · **Pattern proved:** data-driven UI

The hub of the site. Every other tool can link back into it, and it is the page most likely
to be open by default.

**Why it earns a page.** Periodic trends are taught as a list of rules to memorize. Recoloring
the whole table by a property turns each trend into a shape you can see at a glance, and
comparing two properties becomes a toggle instead of two board drawings.

**Controls**

- Color-by mode: block, group, electronegativity, atomic radius, ionization energy, state.
- Temperature slider for the state mode.
- Search by symbol, name, or atomic number.
- Trend overlay: pick a property and a period or group to plot.

**Display**

- Full table including lanthanides and actinides.
- Detail panel on click: all properties for the selected element.
- Trend plot as a line chart beside the table, sharing its highlight.

**The standout feature.** _State at temperature_ — drag a temperature slider and the table
recolors as elements melt and boil. It makes "melting point" a physical property of a
substance rather than a number in a cell, and there is no non-digital way to show it.

**Depends on:** element dataset.

**Risks.** The dataset is the whole tool; it needs a citable, correctly licensed source
(questions.md #23). Layout on a phone is genuinely hard — decide whether that matters first
(questions.md #12).

---

## `molar-mass` — Molar mass and percent composition

**Unit:** the mole · **Pattern proved:** the formula parser

**Why it earns a page.** Borderline on its own — it is close to being a calculator with a
text box. It earns the page through the **visual composition breakdown** and by showing its
working, and it is worth building early regardless because it is the cheapest way to prove
the formula parser against real input.

**Controls**

- Formula input with live parse feedback and helpful errors.
- Toggle between mass percent and mole fraction.

**Display**

- Stacked bar of each element's contribution to total mass, labeled with percentages.
- Step-by-step working behind the reveal gate — count atoms, multiply by atomic mass, sum.
- Must handle parentheses and hydrate notation (`Ca(NO3)2`, `CuSO4·5H2O`).

**Depends on:** formula parser, element dataset, molar mass, significant figures.

**Risks.** Molar mass values must match her textbook's rounding, or students will trust the
textbook and distrust the site (questions.md #20).

---

## `gas-laws` — Gas law sandbox

**Unit:** gases · **Pattern proved:** canvas simulation

**Why it earns a page.** You cannot show molecular motion on a whiteboard, and you cannot
safely compress a gas in a classroom. This is the clearest case on the list where the
simulation is not a convenience but the only way to see the thing being taught.

**Controls**

- Sliders for pressure, volume, temperature, and moles.
- Pick which two variables to hold fixed; the rest follow.
- Presets for Boyle's, Charles's, and Gay-Lussac's laws.

**Display**

- Canvas particle box with elastic collisions; particle speed tracks temperature and wall
  collision frequency visibly tracks pressure.
- Live `PV = nRT` readout with the changing terms highlighted.
- Optional live plot (P vs V, V vs T) beside the box, so the animation and the graph are
  visibly the same event.

**Depends on:** gas law solver, significant figures.

**Implementation note.** This tool sets the convention for every later simulation: the
simulation owns its `canvas` and runs its loop outside the framework's render cycle, with
the framework managing only the surrounding controls. Document that boundary here.

**Risks.** Particle count versus frame rate on a low-end school machine — test on the real
classroom hardware, not a dev laptop. Defaults should use her preferred pressure unit
(questions.md #17).

---

# Tier 2

## `equation-balancer` — Equation balancer and practice

**Unit:** chemical reactions

**Why it earns a page.** Plenty of sites give the balanced answer. None of them teach. The
value here is the **live atom-count table** — as coefficients change, the per-element counts
on each side update, so balancing becomes a visible search for equality rather than trial
and error.

**Controls**

- Equation input, unbalanced.
- Mode switch: _demonstrate_ (tool balances, steps through its reasoning) or _practice_
  (student enters coefficients, tool checks without revealing).
- Randomize a practice equation, with a difficulty setting.

**Display**

- Atom-count table, one row per element, one column per side, updating live and coloring
  matched rows.
- The balanced equation with smallest integer coefficients.
- Reaction type classification (synthesis, decomposition, single/double replacement,
  combustion) as a secondary readout.

**Depends on:** equation parser, balancer, element dataset.

**Risks.** Must fail clearly on unbalanceable or malformed input rather than returning a
wrong answer with confidence. This is the single highest-stakes correctness case on the site.

---

## `stoichiometry` — Stoichiometry and limiting reagent workbench

**Unit:** stoichiometry

**Why it earns a page.** The hardest unit in the course, and the one where the failure is
almost always structural rather than arithmetic — students lose track of _where they are_ in
the conversion chain. A persistent visual mole map fixes exactly that.

**Controls**

- Reaction input (auto-balanced via the balancer).
- Starting amount for each reactant, in grams, moles, or liters at STP.
- Optional actual yield, for percent yield.

**Display**

- **Mole map**: grams → moles → moles → grams laid out as a horizontal chain, each arrow
  labeled with the conversion factor actually being used. The chain stays on screen; the
  numbers change.
- Limiting reagent highlighted, with the comparison that determined it shown explicitly.
- Excess reagent remaining, theoretical yield, and percent yield.
- Each step individually reveal-gated, so she can walk the class through one arrow at a time.

**Depends on:** equation parser, balancer, molar mass, stoichiometry engine, significant
figures.

**Risks.** The most complex tool on the list. Worth building only after the balancer and
molar mass tools are solid, since it composes both.

---

## `titration` — Acid-base titration simulator

**Unit:** acids and bases

**Why it earns a page.** A real titration eats a full class period and consumes reagents, so
students see one, once. The simulation runs several in minutes — and, critically, lets a
strong acid and a weak acid run side by side, which is the comparison that explains why the
curve has the shape it has.

**Controls**

- Analyte and titrant selection, with concentration and volume.
- Indicator choice, with its transition range shown.
- Add titrant by increment or continuously; adjustable drip rate.

**Display**

- Burette and flask, with the flask changing color at the indicator's transition.
- pH curve plotting live as titrant is added, with equivalence point and buffer region
  marked once revealed.
- Numeric readout: volume added, current pH, moles of each species.
- Side-by-side mode overlaying a second curve for comparison.

**Depends on:** acid/base math, titration curve generation, solution math.

**Risks.** Weak acid and polyprotic curves need real care to be quantitatively right, not
just qualitatively curve-shaped. Check PhET first — it may already cover this well enough to
drop the tool (questions.md #7).

---

## `vsepr-viewer` — VSEPR and 3D molecular geometry

**Unit:** bonding

**Why it earns a page.** This is where a screen beats a whiteboard hardest. Molecular shape
is inherently three-dimensional and is taught with flat drawings and hand-waving; rotating a
real model makes bond angles and polarity obvious.

**Controls**

- Pick a molecule from a curated library.
- Rotate, zoom; toggle lone pairs, bond angles, and the polarity dipole arrow.
- Toggle between ball-and-stick and electron-domain views.

**Display**

- 3D model, rotatable by drag.
- Geometry name, electron and molecular geometry, bond angle, polarity verdict.
- The corresponding Lewis structure beside the 3D model, so the two representations connect.

**Scope decision.** Start with a **curated library of about 40 molecules** covering every
VSEPR geometry, not a general Lewis-structure solver. The general solver is a research
project; the library covers the curriculum. Revisit only if she asks for arbitrary input.

**Depends on:** a molecule dataset with 3D coordinates (separate from the element dataset).

**Risks.** Evaluate `3Dmol.js` before building on raw Three.js — it is chemistry-specific and
may provide most of this directly (questions.md #24).

---

## `electron-configuration` — Electron configuration and orbital filling

**Unit:** atomic structure

**Why it earns a page.** The aufbau diagonal rule is a procedure students memorize without
seeing why it produces the periodic table's shape. Filling orbitals interactively while the
periodic table highlights the corresponding block connects the two directly.

**Controls**

- Pick an element, or fill orbitals manually and let the tool identify the element.
- Toggle noble-gas shorthand.
- Toggle orbital-box (Hund's rule) versus `1s2 2s2` notation.

**Display**

- Orbital diagram with clickable boxes and arrows for electron spin.
- Aufbau diagonal path shown as a guide.
- A mini periodic table highlighting the block being filled as electrons are added.
- Flags the known irregulars (Cr, Cu) explicitly rather than quietly showing them.

**Depends on:** element dataset.

---

## `heating-curve` — Heating curve and phase changes

**Unit:** thermochemistry, states of matter

**Why it earns a page.** The plateau on a heating curve is genuinely counterintuitive —
adding energy without raising temperature. Seeing particle behavior change _while the
temperature line stays flat_ is the explanation, and it needs both views at once.

**Controls**

- Substance selection (water first, then others).
- Mass, starting temperature, and rate of energy input.
- Play, pause, and scrub through the curve.

**Display**

- Temperature versus energy-added curve, drawing live.
- Particle view alongside, showing solid, melting, liquid, boiling, gas.
- Live math for the current segment: `q = mcΔT` on the slopes, `q = mHf` or `q = mHv` on the
  plateaus, with the active formula highlighted.
- Running total of energy added.

**Depends on:** thermochemistry math, substance property dataset.

---

## `emission-spectra` — Emission spectra and flame tests

**Unit:** atomic structure, light

**Why it earns a page.** Flame tests need equipment, supervision, and a darkened room, and
the whole class crowds around one burner. Line spectra are otherwise a picture in a textbook.
The identification mode turns both into an actual puzzle.

**Controls**

- Pick an element for its flame color and line spectrum.
- Mystery mode: the tool shows an unknown spectrum, the class identifies it.
- Overlay two spectra to compare.

**Display**

- Line spectrum rendered at correct wavelengths against a visible-spectrum background.
- Flame color swatch, with the caveat that a screen approximates it.
- Wavelength readout on hover, with the corresponding electron transition.

**Depends on:** emission line data in the element dataset.

**Risks.** Colorblind students cannot use color as the identifying channel — wavelength
labels must carry the information independently (questions.md #15).

---

# Tier 3 — drills and bell-ringers

Individually small. Collectively these are probably the most-used pages on the site, because
they fill the first five minutes of class.

## `nomenclature-drill` — Naming practice

**Unit:** nomenclature

Endless generated problems for ionic, covalent, and acid naming, both directions (formula to
name and name to formula). Instant feedback, streak counter, difficulty selection by
compound type. Projected as a warm-up with the class calling out answers, or run
individually.

**Depends on:** ion and polyatomic-ion tables, formula parser.

**Risks.** Must match her naming convention — Stock (iron(III)) versus classical (ferric),
or both (questions.md #22).

## `sig-figs` — Significant figures trainer

**Unit:** measurement

Count sig figs in a given value; round to a specified count; propagate through a calculation
and see which rule governs. Generated problems with instant feedback.

Priority depends entirely on whether she grades sig figs (questions.md #19). If she does,
this moves up to Tier 2.

## `dimensional-analysis` — Unit conversion railroad

**Unit:** measurement

Drag conversion factors onto a "railroad track" layout; units visibly **cancel** diagonally
as they match, and the tool refuses to let an incorrect factor cancel. The cancellation
animation is the teaching, not the answer.

Generalizes beyond chemistry, so it may get used in other courses too.

## `solutions-dilution` — Molarity and dilution

**Unit:** solutions

Solve molarity and `M1V1 = M2V2` in any direction, with a beaker whose color intensity
tracks concentration so dilution is visible rather than only arithmetic. Small, quick,
frequently needed.

**Depends on:** solution math, molar mass.

## `half-life` — Radioactive decay

**Unit:** nuclear chemistry

A grid of nuclei decaying **stochastically**, with the decay curve plotting beside it. The
point is watching randomness at the individual level resolve into a smooth, predictable
curve at the population level — an idea that is hard to convey any other way and that
students routinely misunderstand as "half the atoms take turns."

Controls for isotope, initial count, and speed; readout of elapsed half-lives and remaining
fraction.

## `le-chatelier` — Equilibrium stress sandbox

**Unit:** equilibrium

Apply a stress — add reactant or product, change temperature, change volume — and watch
concentrations shift and re-establish equilibrium on a live graph. Highly abstract topic,
large payoff from seeing it move.

May be out of scope for a first-year course; confirm against her curriculum
(questions.md #5).

## `lab-measurement` — Reading instruments

**Unit:** measurement, lab skills

Practice reading a graduated cylinder meniscus, a burette, and a triple-beam balance, with
sig figs enforced including the estimated digit. Randomized values, instant feedback.

Pairs naturally with `sig-figs`, and is the most directly transferable to actual lab work.
Reading an instrument is this tool's job; the _procedure_ for using a digital balance —
tare, containers, subtraction — is [`mass-balance`](#mass-balance--using-a-balance).

---

## Deferred, with reasons

- **General Lewis structure solver** — the checking logic for arbitrary student-drawn
  structures is a project in itself. The curated `vsepr-viewer` library covers the
  curriculum at a fraction of the cost.
- **Reaction kinetics / collision theory sim** — good tool, but overlaps `gas-laws`
  mechanically and PhET likely covers it. Reconsider after questions.md #7 is answered.
- **Electrochemistry / redox balancer** — usually beyond a first-year course. Add only if
  she teaches AP.
- **Anything requiring saved student progress** — needs a backend. Out of scope by
  constraint, noted in plan.md's future work.
