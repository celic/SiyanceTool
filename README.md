# SiyanceTool

A collection of interactive chemistry tools for a high school classroom, hosted as a static
website. One page per tool.

The primary use case is the teacher sharing her screen and driving a tool live during a
lesson, so every tool is built to be **legible on a projector** and **driveable from the
keyboard**, and to hide its answers until she chooses to reveal them.

There is no backend. Everything runs in the browser.

## Documentation

| Document                               | What it holds                                              |
| -------------------------------------- | ---------------------------------------------------------- |
| [docs/plan.md](docs/plan.md)           | The actionable build sequence, and the framework decision. |
| [docs/tools.md](docs/tools.md)         | Design proposals for every tool: what each does, and why.  |
| [docs/questions.md](docs/questions.md) | Open questions, with the blocking ones marked.             |

Start with `docs/plan.md`. It consults `docs/tools.md` for what to build.

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

The reasoning behind this choice, and the options rejected, are recorded in
[docs/plan.md](docs/plan.md) item 1. In short: ~17 tools sharing one set of controls makes
component reuse the dominant cost, and wrong chemistry shown to a class is the worst
failure mode, so a typed, testable, component-based stack wins.

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
```

Imports use the `@/` alias for `src/`, e.g. `import { parseFormula } from '@/core/formula'`.
The alias is declared in both `vite.config.ts` and `tsconfig.app.json`; changing it means
editing both.

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

## Adding a tool

1. Give it a design entry in [docs/tools.md](docs/tools.md) first, with a stable `id`. That
   id is the route, the folder name, and the config key.
2. Create `src/tools/<id>/`.
3. Write the tests before the tool, working from the behavior its design entry describes.
4. Register it, so it appears on the home page and gets a route.
5. Put any chemistry it needs in `src/core/`, with its own tests — not in the tool folder.

Tools can be switched on and off without touching their source; see `tools.config.json`.

> Registration and `tools.config.json` are not built yet — they are plan.md item 6. Until
> then, this section describes the intended shape rather than working code.
