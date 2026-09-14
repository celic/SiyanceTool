# SiyanceTool

A collection of interactive chemistry tools for a high school classroom, hosted as a static
website. One page per tool.

The primary use is **a student, alone, on their own device**: reviewing a lab they did in
class, or making up a lab they missed without using class time. The site stands in for the
lab equipment they do not have at home; the paper worksheet stays the record. So every tool
explains itself, keeps its place across reloads, asks for the student's answer before
revealing the worked one, and makes every measurement the worksheet asks for producible on
the page. The secondary use is the teacher driving a tool on the projector during a lesson,
so every tool is also **legible from the back of a room**.

There is no backend. Everything runs in the browser. Nothing is handed in through the site
and nobody logs in.

## Documentation

| Document                               | What it holds                                                        |
| -------------------------------------- | -------------------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)           | The actionable build sequence — only the work still ahead.           |
| [docs/tools.md](docs/tools.md)         | Design entries for every tool: what each does, and why.              |
| [docs/questions.md](docs/questions.md) | Open questions, with the blocking ones marked.                       |
| [reference/](reference/)               | Material from the teacher — labs, worksheets — tools are built from. |

Start with `docs/plan.md`. It consults `docs/tools.md` for what to build. Finished plan
items are removed from the plan and recorded in the [decision record](#decision-record) at
the end of this file.

Tools come in two kinds. **Requested** tools trace back to something in `reference/` and
build first; **proposed** tools were suggested by the planning docs and follow. The
distinction is marked ★ in both documents.

## Requirements

Node.js 24 LTS or newer.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script               | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload.                                           |
| `npm run build`      | Typecheck, then build static files into `dist/`.                      |
| `npm run preview`    | Serve the production build locally.                                   |
| `npm test`           | Run the test suite once.                                              |
| `npm run test:watch` | Run tests in watch mode.                                              |
| `npm run lint`       | Lint with oxlint.                                                     |
| `npm run format`     | Format with Prettier.                                                 |
| `npm run check`      | Lint, format check, typecheck, and test — run this before committing. |

## Stack

Vite 8 + React 19 + TypeScript 6, with Vitest for tests, oxlint for linting, and Prettier
for formatting. Styling is plain CSS with custom properties — no CSS framework.

The reasoning behind this choice, and the options rejected, are in the
[decision record](#framework-vite--react--typescript). In short: ~17 tools sharing one set
of controls makes component reuse the dominant cost, and wrong chemistry shown to a class is
the worst failure mode, so a typed, testable, component-based stack wins.

Two conventions worth knowing up front:

- **SVG for charts and diagrams. Canvas 2D for particle simulations.** Do not render
  hundreds of particles as SVG elements.
- **Simulations run their animation loop outside React**, owning their own `<canvas>`, with
  React managing only the surrounding controls.

## Layout

```
src/
  core/      chem-core: pure chemistry logic, no UI, fully tested
  ui/        shared components (ToolShell, Slider, RevealAnswer, …)
  tools/     one folder per tool, named for its id
  data/      element and molecule datasets
  styles/    global styles and design tokens
docs/        planning and design documents
reference/   source material from the teacher (labs, worksheets); read-only input to docs/
```

Imports use the `@/` alias for `src/`, e.g. `import { parseFormula } from '@/core/formula'`.
The alias is declared in both `vite.config.ts` and `tsconfig.app.json`; changing it means
editing both.

## Styling and the projector theme

All colour, type, spacing, line weight and focus values live in
[src/styles/tokens.css](src/styles/tokens.css). Components reference tokens and never
hard-code a value — a raw pixel size will look fine on a laptop and break in projector mode,
which is the one place nobody looks.

There are two independent axes:

- **Light / dark** follows the operating system.
- **Normal / projector** is chosen explicitly, from the control in the header, and
  remembered. It sets `data-display="projector"` on the root element.

Projector mode is about the room rather than the time of day: roughly 1.5x type, doubled
line weights, and contrast pushed to pure black or white, because classroom projectors are
often low-resolution, wash out mid-tones, and get read from twenty feet away. Both axes
combine, so **all four combinations have to work** — check them when changing anything
visual.

For charts, use the categorical palette (`--data-1` … `--data-8`). It is the Okabe–Ito
colourblind-safe set, identical in every mode so a chart never changes meaning when the
display mode changes. Always pair a colour with a label or shape; colour alone never carries
meaning on this site.

## Testing

Vitest, with [React Testing Library](https://testing-library.com/react) for components.
Tests live beside the code they cover, named `<name>.test.ts` or `<name>.test.tsx`.

There are two test projects, because the two kinds of test want different environments:

| Project | Covers                         | Environment |
| ------- | ------------------------------ | ----------- |
| `core`  | `src/core/**/*.test.ts`        | `node`      |
| `ui`    | `src/{ui,tools}/**/*.test.tsx` | `jsdom`     |

Keeping `chem-core` in a `node` environment is deliberate: it is fast, and it fails loudly
if a module that is supposed to be pure chemistry quietly grows a DOM dependency.

```bash
npm test                 # everything, once
npm run test:watch       # watch mode
npx vitest --project ui  # just the component tests
```

### Write the test first

**Each new feature is developed test-first wherever practical.** Write the failing test,
watch it fail for the reason you expect, then write the smallest thing that passes it. A
test that has never been seen to fail proves nothing.

This is easier here than in most projects, because both halves of the codebase hand you the
expected answer before the code exists:

- **`chem-core`** — chemistry has known-correct answers. Use textbook problems as fixtures.
- **Components** — the requirements are already phrased as behavior. "The answer stays
  hidden until she clicks" is a test. `src/ui/RevealAnswer.test.tsx` is the worked example.

Test what a user of the tool can observe — roles, labels, visible text — not internal state
or implementation details. Query by accessible role wherever possible: it verifies the
component is reachable by keyboard and screen reader at the same time as verifying it works,
which matters for a site driven from across a classroom.

Where TDD genuinely does not fit — visual polish, canvas rendering, animation feel, layout on
a projector — say so and verify by looking at it. Do not write a hollow test to claim
coverage of something a test cannot judge.

## Turning tools on and off

`tools.config.json`, at the repository root, controls which tools appear. It needs no
programming — it is a plain list of tool names with a true/false switch:

```json
{
  "tools": {
    "gas-laws": { "enabled": false },
    "titration": { "enabled": true, "options": { "pressureUnit": "kPa" } }
  }
}
```

- **A tool you don't list is on.** You only need an entry to switch something off or to
  change one of its settings.
- **`"enabled": false` hides it completely.** It disappears from the menu and the home page,
  and typing its address shows a page saying it is turned off — not a confusing "not found".
- **`options`** overrides that tool's own defaults, for classroom preferences like which
  pressure units to show. Each tool's available options are listed in
  [docs/tools.md](docs/tools.md).

Use it to hide tools for units you haven't taught yet, so the home page only shows what is
relevant this week, and to park a half-finished tool without deleting it.

**If you misspell a tool name**, the site refuses to start in development and names the bad
entry, rather than silently ignoring it — a typo must never leave a tool switched on that
you meant to switch off. A deployed site keeps working and logs a warning instead, so a bad
edit can't take the site down mid-lesson.

> Changing this file currently requires rebuilding the site, because it is compiled in. If it
> needs to be editable on a live site without a developer, it moves to `public/` and gets
> fetched at runtime — see [docs/questions.md](docs/questions.md) #27 and #28.

## Adding a tool

1. Give it a design entry in [docs/tools.md](docs/tools.md) first, with a stable `id`. That
   id is the route, the folder name, and the config key. If it comes from something in
   `reference/`, say so in the entry — requested tools build ahead of proposed ones.
2. Create `src/tools/<id>/`.
3. Write the tests before the tool, working from the behavior its design entry describes.
4. Export a `ToolDefinition` from the folder and add one line to `src/tools/index.ts`. The
   component is rendered with `{ options }` — its `defaultOptions` with any overrides from
   `tools.config.json` merged in — so classroom preferences reach it without a code change.
   `src/tools/mass-balance/` is the worked example.
5. Put any chemistry it needs in `src/core/`, with its own tests — not in the tool folder.

Step 4 is the only wiring. Routing, the navigation panel, and the home page all derive from
that list, so none of them need editing — and the tool is switchable from
`tools.config.json` without any further work.

## Shared components

Everything in `src/ui/` exists because it repeats on nearly every tool. Use these rather than
rebuilding them per tool; if one does not fit, change it for everyone.

- **`ToolShell`** — title, description, controls area, output area, and the actions that are
  always in the same place. Controls and output are separate labelled landmarks, so a screen
  reader user can jump between "the knobs" and "the answer" without walking the page.
- **`Slider`** — a native range input, so keyboard stepping, touch, and announcements come for
  free. The value is always shown as text as well: a knob position is unreadable from the
  back of a room, and the number is the thing being taught.
- **`RevealAnswer`** — hides a result until clicked. This one component is what makes the
  site teachable rather than merely informative. Hidden content is not rendered at all rather
  than merely `display: none`, so it cannot be read out of the DOM.
- **`NumberField`** — units-aware, and explains bad input instead of swallowing it.
  Deliberately `type="text"` with a decimal input mode rather than `type="number"`: number
  inputs silently discard characters they dislike, so a student typing `12o` just sees `12`
  with nothing to explain the loss, and they change value on scroll, which is a hazard when
  the page is scrolled in front of a class.
- **`ResetButton`** and **`RandomizeButton`** — Randomize is labelled "New problem", which is
  what it means to the person pressing it.

Site-wide keyboard conventions: every control is a real button or field, so Tab reaches it
and Space or Enter works it, with nothing beyond what the elements do natively. **There are
deliberately no keyboard shortcuts.** An `R`-to-reset binding existed briefly and was removed
(2026-09-10): hidden logic is a liability in front of a class, where a stray keystroke that
wipes the page is worse than any convenience. Do not add one.

Components size themselves from tokens rather than pixels — the burger bars use `em`, the
navigation panel's top offset is computed from the type scale — so switching to projector
mode reflows everything rather than overlapping it. Any new component needs the same
discipline.

## Decision record

Finished items from [docs/plan.md](docs/plan.md) land here, with the reasoning that went
into them, so the plan only ever holds what is still ahead. Dates are when the item closed.

### Framework: Vite + React + TypeScript — 2026-09-07

The only decision that was expensive to reverse, so it was made first. It had to serve five
things: ~17 tools sharing one look and one set of controls (reuse is the dominant cost);
correctness of the chemistry (the core has to be testable); two opposite rendering needs
(data-driven pages and 60fps particle simulations); static hosting with no server; and
maintainability by someone who is not the original author.

| Option                                   | Verdict                                                                                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain HTML + CSS + JS, no build step     | Zero tooling and works from a USB stick, but no component model — the shell and controls get copy-pasted ~17 times — and no type checking, so a wrong atomic mass fails silently. Viable for three tools, painful at seventeen. |
| **Vite + React + TypeScript** — _chosen_ | Component reuse addresses the dominant cost directly; TypeScript makes element data and units checkable; largest ecosystem; the build is plain static files; most likely known by a future maintainer.                          |
| SvelteKit, static adapter                | The closest runner-up. Smaller output and a reactivity model that suits slider-driven simulations, but a smaller ecosystem (3D, charting) and a smaller pool of people who know it.                                             |
| Astro with islands                       | Its main advantage — shipping no JavaScript — is wasted on a site where nearly every page is an interactive app.                                                                                                                |
| Next.js                                  | Mostly server rendering, API routes, and caching: machinery for a project whose defining constraint is that there is no server.                                                                                                 |
| Python (Streamlit / Shiny / Jupyter)     | Needs a running server, breaking the core constraint; slider interactions round-trip to it; not projector-polished. Ruled out.                                                                                                  |

React's one real cost is that its re-render model is a poor fit for per-frame animation.
The mitigation is a deliberate convention rather than something to discover halfway through:
**simulations own a `<canvas>` and run their loop outside React**, with React managing only
the surrounding controls. It becomes a documented pattern when the first simulation is built.

Sub-decisions that followed: SVG for charts and diagrams, Canvas 2D for particles, Three.js
only for the 3D viewer; hand-rolled SVG charts for full control over projector legibility;
plain CSS with custom properties so the projector theme is a token swap; Vitest — originally
for `chem-core` only, widened on 2026-09-08 to components and tools as well, written
test-first (see "Write the test first" above). The 3D library and the host are still open in
the plan.

### Scaffold — 2026-09-08

Vite 8, React 19, TypeScript 6, on Node 24 LTS. Two things worth knowing:

- The Vite template now ships **oxlint** rather than ESLint, and the project kept it: faster,
  less configuration, one less thing to maintain. Prettier was added separately.
- **Vitest 5**, not 3 — Vitest 3 pulls its own copy of Vite and conflicts with Vite 8's types.

The `@/` alias, the directory layout, `npm run check`, and `.claude/launch.json` for the dev
server all date from here. Typecheck, lint, tests, and production build all passed, and the
built site rendered with no console errors.

### Design system and shared components — 2026-09-09

Tokens in `src/styles/tokens.css`, the projector theme as a second axis independent of
light/dark (see "Styling and the projector theme" above), the Okabe–Ito categorical palette,
and the components listed under "Shared components". All four light/dark x normal/projector
combinations were checked. `RevealAnswer` was built test-first as the first exercise of the
component test setup. What remains — checking the palette on the actual projector, and the
shell at 1024x768 — is in the plan as foundation leftovers.

### App shell, navigation, and routing — 2026-09-08

React Router, one route per tool id. Navigation is a burger control opening a side panel.
The panel is unmounted when closed rather than hidden with CSS, so nothing inside it is
tabbable or readable while a lesson is on screen; Escape closes it, clicking away closes it,
and focus moves into the panel on open and back to the burger on close — she is driving this
from across a room and cannot afford to lose the tab order. Unknown routes get a calm page
with a way back, since the likeliest way to land there is a stale bookmark opened in front of
a class. The home page is a grid of tool cards grouped by unit, meant to be scannable in
about three seconds, with an honest empty state until the first tool ships.

**Verified in the browser, not just in tests:** the panel's stacking initially covered the
burger, so the close control was unclickable while the panel was open. jsdom has no layout,
so the test asserting "closes from the same control" passed the whole time. Fixed by lifting
the header above the panel. Worth remembering the next time a component's tests are green
but the thing has never been looked at.

### Pivot to students — 2026-09-13

The site was planned for a teacher driving tools on a projector. The plan changed: the
primary user is now **a student, alone, on their own device**, reviewing a lab done in class
or making up a lab without class time. The teacher on the projector is the secondary use.

Nothing built so far is wasted — a walkthrough that follows the hands and refuses to
record the wrong thing is exactly what an unattended student needs — but the priorities
changed shape. Deploying moved from near the end of the plan to item 2, because nothing
matters until a student can open a URL. A new item 3 holds what every tool needs before it
can be left alone with a student: a phone-width layout, a place that survives a reload, an
opening that explains itself, a self-check before every reveal, and the student's own
numbers with a reproducible seed. Proposed tools were re-ranked by review value — drills
and reference pages ahead of simulations — and every lab in `reference/` is now a make-up
lab to build.

**The site is the equipment, not the worksheet** (same day, questions #37 and #41): the
student keeps the paper worksheet and fills it in by hand; the site stands in for the
balance they do not have at home. So nothing is handed in through the site, nobody logs
in, and the test of a make-up lab is that every blank on the worksheet that needs equipment
can be filled in from the page — for `mass-balance`, that means Task 1's questions about the
balance, the sphere's describable properties, and a pencil on the sandbox bench (item 4).

### The `mass-balance` tool — 2026-09-10, iterated through 2026-09-13

The first tool, and the first **requested** one: built from the teacher's "Measuring Mass"
lab in `reference/labs/`, ahead of every proposed tool. It went first for two reasons beyond
being requested: it needs no element data and no formula parser, so it did not wait on
`chem-core`, and it was the first tool to run end to end through the shell, registry, config
and reveal gate with real content. Design entry: [docs/tools.md](docs/tools.md).

- **The balance is a pure model in `chem-core`** (`src/core/balance.ts`), built test-first
  with the lab's own numbers as fixtures. One rule drives everything: the reading is
  `round(load − tareOffset, decimals)`. Masses are held to three decimals and rounded only on
  the readout, so Task 2A's subtraction gives 5.12 g while 2B's tare method gives 5.13 g —
  the "slightly different" the lab asks about, from rounding alone. Illegal moves are refused
  with a reason in the lab's words.
- **The page is a walkthrough from the teacher's side of the projector.** It was first
  built with a task picker and a free bench, then restructured after the first look: the
  lab's steps are listed with the current one marked, the marker moves on by itself when a
  step's action is taken, and each "Record" step carries its own Record button, which is a
  forced wait — disabled, with the reason beside it, until the balance holds what the step
  describes. No checkboxes, no keyboard shortcuts.
- **Bench continuity.** Choosing a task does not reset the balance, because the lab's
  tasks run on continuously (2B starts with the sphere still in the boat). Only Reset clears
  the bench; New problem re-rolls every mass within a small spread of its nominal value.
- **What the balance reads, not what is true.** The inflated balloon reads a few tenths of
  a gram more than the empty one, not the 3–4 g the air inside actually masses, because
  buoyancy cancels the rest; water defaults to exactly 1 g/mL because that is what the lab
  teaches. Both are open questions for the teacher (questions.md #33, #34).
- **One registry change:** `AppRoutes` now renders each tool with `{ options }`, which it
  had not been doing, so `tools.config.json` options actually reach a tool.

Verified in the browser in dark/normal, dark/projector and light/projector at 1024x768.
Component tests are behavioural: hidden until revealed, refusals visible, display blank
while off, the marker following the action, Record waiting for the bench.

### Tool registry and `tools.config.json` — 2026-09-08

Every tool is switchable on or off from one config file without touching its source or the
home page: half-finished tools can live on `main` without appearing in class, tools for
untaught units can be hidden, and a broken tool can be disabled in one commit rather than
reverted. How to use the file is under "Turning tools on and off" above.

**Decision: runtime, not build-time** — disabled tools ship but are unreachable. The
practical limit is that the file is imported, so it is compiled into the bundle and editing
it needs a rebuild; if she needs to edit it on a live site without a developer, it moves to
`public/` and is fetched at runtime (questions.md #27, #28).

**Verified end to end in the browser** with a throwaway tool, since with no real tools yet
nothing else would have exercised the wiring: enabled, it appeared on the home page grouped
by unit, in the navigation panel, and at its own route; disabled, it vanished from both and
its URL explained itself; misspelled in config, the site refused to start and named the bad
entry. The throwaway tool was then removed.

**Known rough edge:** the development-mode failure is a thrown error, so the page goes blank
and the explanation is in the console rather than on screen. Loud enough for a developer,
but if this file ever becomes something the teacher edits directly, it needs to render the
problem on the page instead.
