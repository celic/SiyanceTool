# Tool Design

Design proposals for every tool on the site. [plan.md](plan.md) is the actionable build
sequence and consults this document for *what* to build; this document holds the *why* and
the *what it does*, and does not track scheduling.

Everything here is **proposed** until reviewed with the teacher — see
[questions.md](questions.md), which has several questions that could remove tools from this
list entirely.

Each tool has a stable `id`. That id is the route (`/gas-laws`), the source folder
(`src/tools/gas-laws/`), and the key in the tool config file that turns it on or off.

---

## What makes a tool worth a page

A tool earns a page if it is **better on a projector than on a whiteboard** — too slow, too
expensive, too dangerous, or too invisible to do live, or something where instant
recalculation lets her run ten "what ifs" in the time one would take by hand.

A calculator with a text box does not earn a page on its own. If a tool's whole value is
producing a number, it should be folded into a tool that also *shows* something.

## Conventions every tool follows

These are built once in the design system and are not repeated in each tool below.

- **Reveal gate.** Any final answer is hidden until clicked, so she can ask the class first.
- **Reset and randomize.** Always present, always in the same place.
- **URL-encoded state.** The full configuration serializes to the query string, so a
  scenario can be bookmarked before class and shared as a link.
- **Projector legibility.** Readable from the back of the room, not just on a laptop.
- **Keyboard driveable.** Arrows adjust the focused control, `R` resets, `Space` reveals.
- **No meaning in color alone.** Every color is paired with a label or pattern.
- **Registry entry.** Every tool registers itself with an id, title, unit, and one-line
  description, and can be switched off in config without touching its source.

## Priority tiers

**Tier 1** proves a distinct technical pattern and is worth building first.
**Tier 2** is high classroom value once the foundations exist.
**Tier 3** is drills and bell-ringers — individually small, collectively the things she'd
use most often.

Tier is *not* build order. Build order should follow the unit she teaches next
(questions.md #6).

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

**The standout feature.** *State at temperature* — drag a temperature slider and the table
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
- Mode switch: *demonstrate* (tool balances, steps through its reasoning) or *practice*
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
almost always structural rather than arithmetic — students lose track of *where they are* in
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
adding energy without raising temperature. Seeing particle behavior change *while the
temperature line stays flat* is the explanation, and it needs both views at once.

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
