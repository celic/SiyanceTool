# SiyanceTool

Interactive chemistry tools for a high school class, as a static website. One page per
tool.

**Live site:** https://celic.github.io/SiyanceTool/

## What it is for

The tools stand in for lab equipment a student does not have at home. A student who missed
a lab, or wants to redo one before a test, opens the tool with the paper worksheet in front
of them and works through the lab's steps on the page — placing things on a simulated
balance, reading the display, writing the numbers on their sheet — the way they would at
the real bench. The site never does the arithmetic for them: where the worksheet asks for
a calculation, the page shows the formula with their recorded values and a blank, and they
work it out on their own calculator.

The same tools work on a classroom projector, so a teacher can walk a class through a
procedure before anyone touches the real equipment.

There is no backend. Everything runs in the browser; nothing is handed in through the site
and nobody logs in.

## Tools

| Tool                                      | What it does                                                                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Using a balance](src/tools/mass-balance) | A simulated digital balance that runs the "Measuring Mass" lab: massing a solid by subtraction and by tare, a liquid in a cup, a gas in a balloon, and water by volume. |

Each tool has a design entry in [docs/tools.md](docs/tools.md) describing what it does and
why it is built the way it is.

## Requirements

Node.js 24 LTS or newer.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Script               | What it does                                                             |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run dev`        | Dev server with hot reload.                                              |
| `npm run build`      | Typecheck, build static files into `dist/`, add the `404.html` fallback. |
| `npm run preview`    | Serve the production build locally.                                      |
| `npm test`           | Run the test suite once.                                                 |
| `npm run test:watch` | Run tests in watch mode.                                                 |
| `npm run lint`       | Lint with oxlint.                                                        |
| `npm run format`     | Format with Prettier.                                                    |
| `npm run check`      | Lint, format check, typecheck, and test — run this before committing.    |

## Stack

Vite 8 + React 19 + TypeScript 6, with Vitest and React Testing Library for tests, oxlint
for linting, and Prettier for formatting. Styling is plain CSS with custom properties — no
CSS framework.

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
docs/        design documents
reference/   source material the tools are built from (labs, worksheets)
```

Imports use the `@/` alias for `src/`, e.g. `import { parseFormula } from '@/core/formula'`.
The alias is declared in both `vite.config.ts` and `tsconfig.app.json`; changing it means
editing both.

## Conventions every tool follows

- **Explains itself.** A tool opens with what it is for and what to do first. Nobody is
  narrating.
- **Formula, never the answer.** Where a worksheet asks for a calculation, the page shows
  the formula with the recorded values substituted in and a blank for the result.
- **Every equipment blank is answerable.** Anything a worksheet asks that a student would
  answer by looking at or using the equipment can be answered from the page.
- **Works on a phone.** Single column, touch targets, nothing that needs hover; a live
  readout stays pinned while the rest scrolls under it.
- **Legible on a projector.** See the projector theme below.
- **No keyboard shortcuts.** Every control is a real button or field. A stray keystroke
  that resets a page mid-lab is worse than any convenience.
- **No meaning in colour alone.** Every colour is paired with a label or pattern.

## Styling and the projector theme

All colour, type, spacing, line weight and focus values live in
[src/styles/tokens.css](src/styles/tokens.css). Components reference tokens and never
hard-code a value — a raw pixel size will look fine on a laptop and break in projector mode.

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
display mode changes.

## Shared components

Everything in `src/ui/` exists because it repeats on nearly every tool. Use these rather than
rebuilding them per tool; if one does not fit, change it for everyone.

- **`ToolShell`** — title, description, controls area, output area, and the Reset and New
  problem actions, always in the same place. Controls and output are separate labelled
  landmarks for assistive technology.
- **`Slider`** — a native range input, with the value always shown as text as well.
- **`RevealAnswer`** — hides content until clicked, so a teacher can ask the class first.
  Hidden content is not rendered at all, so it cannot be read out of the DOM.
- **`NumberField`** — units-aware, and explains bad input instead of swallowing it. It is
  `type="text"` with a decimal input mode on purpose: number inputs silently discard
  characters and change value on scroll.

Components size themselves from tokens rather than pixels, so projector mode reflows
everything rather than overlapping it. Any new component needs the same discipline.

## Testing

Vitest, with [React Testing Library](https://testing-library.com/react) for components.
Tests live beside the code they cover, named `<name>.test.ts` or `<name>.test.tsx`.

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

**Write the test first.** Write the failing test, watch it fail for the reason you expect,
then write the smallest thing that passes it. Chemistry has known-correct answers — use
textbook and worksheet problems as fixtures — and component requirements are already
phrased as behaviour. Test what a user can observe (roles, labels, visible text), not
implementation details. Where a test genuinely cannot judge something — layout on a phone
or a projector — say so and verify by looking at it.

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
  and its address shows a page saying it is turned off — not a confusing "not found".
- **`options`** overrides that tool's own defaults. Each tool's available options are listed
  in its design entry in [docs/tools.md](docs/tools.md).

A misspelled tool name makes the site refuse to start in development and name the bad
entry; a deployed site keeps working and logs a warning instead, so a bad edit cannot take
the site down. Changing the file requires a rebuild, because it is compiled in.

## Adding a tool

1. Give it a design entry in [docs/tools.md](docs/tools.md) first, with a stable `id`. That
   id is the route, the folder name, and the config key.
2. Create `src/tools/<id>/`.
3. Write the tests before the tool, working from the behaviour its design entry describes.
4. Export a `ToolDefinition` from the folder and add one line to `src/tools/index.ts`. The
   component is rendered with `{ options }` — its `defaultOptions` with any overrides from
   `tools.config.json` merged in. `src/tools/mass-balance/` is the worked example.
5. Put any chemistry it needs in `src/core/`, with its own tests — not in the tool folder.

Step 4 is the only wiring. Routing, the navigation panel, and the home page all derive from
that list.

## Deploying

The site deploys itself to **GitHub Pages** on every push to `main`, from
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow runs
`npm run check` first and only builds and deploys if it passes, so a failing test never
reaches a student. Pull requests run the check alone.

One-time setup on GitHub: **Settings → Pages → Build and deployment → Source: GitHub
Actions.** (With the default "Deploy from a branch", Pages serves the raw repository and the
site is a blank page.)

Two things make a project-site URL work, and both are wired up:

- **Base path.** `vite.config.ts` reads `BASE_PATH` (the workflow sets it to `/<repo>/`),
  and the router uses the same value as its `basename`, so a tool's path stays
  `/mass-balance` in code. For a custom domain, set a repository variable `BASE_PATH` to
  `/` — nothing else changes.
- **Direct links.** Pages has no rewrite rules, so `npm run build` copies `dist/index.html`
  to `dist/404.html`; Pages serves that for unknown paths, the app loads, and the router
  shows the right tool.

To see the Pages build locally, build with `BASE_PATH=/SiyanceTool/ npm run build` and run
the `preview-pages` configuration in `.claude/launch.json`.
