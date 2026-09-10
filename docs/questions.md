# Open Questions

Questions raised while writing [plan.md](plan.md) and [tools.md](tools.md), grouped by who
can answer them. Most are
not blocking — the plan can start without them — but the ones marked **blocking** change
work that would otherwise have to be redone.

Answer format: add the answer inline under the question and mark it `ANSWERED`.

---

## For you (project decisions)

1. **Which framework?** — `ANSWERED (2026-09-07)`: **Vite + React + TypeScript**, along with
   the recommended sub-decisions — SVG for charts, Canvas 2D for particle simulations, plain
   CSS with custom properties, Vitest for tests. The 3D library and the host remain deferred
   (#24 and plan.md item 2). Test scope was later widened beyond `chem-core` to components
   and tools, written test-first — see plan.md "How we work".
2. **Who maintains this in a year?** If the answer is "a student" or "the teacher," that
   argues for the simplest possible stack, even at the cost of duplication.
3. **Is "SiyanceTool" the real name?** It affects the repo, the page titles, and any domain.
   Is there a domain already, or will this live on a `github.io` subdomain?
4. **How much do you want to build before showing her?** Recommendation: build the
   requested `mass-balance` tool alone (plan.md item 1) and demo it before anything else.
   It came from her own lab, so the feedback will be specific, and it is the first tool to
   exercise the whole shell with real content. (The original recommendation was
   `periodic-table`; it was displaced when the lab arrived in `reference/`.)

## For the teacher (classroom reality)

These are the highest-value questions in this file. Several of them can invalidate work.

5. **Which course, and which curriculum?** First-year chemistry, honors, AP, or IB? AP adds
   equilibrium, kinetics, and thermodynamics depth that changes the tool list. Is she
   teaching to NGSS, a state standard, or her own sequence?
6. **What is her unit order, and what is she teaching next?** — **blocking on build order.**
   Building the tool for the unit she teaches next month is worth far more than building the
   "best" tool for a unit that already passed. This should drive plan.md items 7 and 8 entirely.
7. **What does she already use, and what is missing from it?** PhET simulations cover gas
   laws and pH well and are free. If PhET already solves a tool on this list, that tool
   should be dropped and the effort moved to something PhET does not do — the mole map, the
   nomenclature drill, and the projector-first reveal-answer flow are all candidates.
8. **Is this teacher-driven only, or will students open it themselves?** — affects plan.md
   item 9 heavily. If students use it, mobile layout and offline support become real
   requirements rather than nice-to-haves.
9. **Does she want printable worksheets** generated from the drill tools, or is everything
   on screen?
10. **Does she want any kind of "show your work" output** she can put on an assessment, or
    are these purely for live demonstration?

## Classroom and IT constraints

11. **What is the projector's resolution and aspect ratio?** Older classroom projectors are
    often 1024x768 and wash out low-contrast colors badly. This sets the floor for plan.md item 2.
12. **What devices would students use?** School Chromebooks, personal phones, or nothing?
    Chromebooks are fine; phones would force a serious mobile rethink of the periodic table
    and any canvas simulation.
13. **How locked down is the school network?** Are arbitrary domains blocked? Some districts
    block anything not on an allowlist, which would make hosting choice (plan.md item 6) a real
    constraint rather than a free pick.
14. **Is the classroom internet reliable?** If not, offline support moves from plan.md item 9's
    optional list into the core requirements, which affects the framework choice slightly.
15. **Any accessibility requirements in the room** — colorblind students, IEP or 504
    accommodations, screen reader users? Colorblindness in particular is directly relevant,
    since indicator colors and flame tests are the entire point of two of these tools.
16. **Is any Spanish-language or other translation support needed?**

## Chemistry and content conventions

Getting these wrong makes the tools subtly wrong for her class, which is worse than not
having them.

17. **Which pressure units does she teach in** — atm, kPa, mmHg, or torr? The gas law tool
    should default to whatever she uses and offer the rest.
18. **Celsius or Kelvin as the default display** in the gas law and heating curve tools?
19. **Does she enforce significant figures in graded answers?** If yes, every tool's output
    needs to respect sig figs, and the sig-fig trainer becomes higher priority. If no, the
    tools can display full precision and the trainer drops down the list.
20. **Which molar mass values does her textbook use?** Different sources round differently
    (for example, 12.01 vs 12.011 for carbon), and a tool that disagrees with the textbook by
    0.01 will generate student confusion and undermine trust in the whole site.
21. **What textbook or reference is she using?** Matching its notation and worked-example
    format makes the tools feel like part of the course rather than a separate thing.
22. **For nomenclature: which naming system?** Stock notation (iron(III)) versus classical
    (ferric) — does she teach one, or both?

## Technical questions to resolve during the build

23. **Where does the element dataset come from,** and is its license compatible with a public
    site? Needs a citable source before plan.md item 3 starts.
24. **Does `3Dmol.js` cover the VSEPR tool well enough** to skip building on raw Three.js?
    Worth an hour of evaluation before the Tier 2 work in plan.md item 7 starts.
25. **How complex should the URL state encoding be?** Plain query parameters stay readable
    and hand-editable; compressed encoding stays short. Readable is probably better here,
    since a teacher may want to hand-tweak a bookmarked scenario.
26. **Do any tools need a random seed** so a "randomized" problem set can be reproduced from
    a shared link? Relevant to plan.md items 5 and 8 together — and to `mass-balance` (item 1), the first tool with randomized values.
27. **Should the tool on/off config be build-time or runtime?** — `ANSWERED (2026-09-08)`:
    **runtime** — disabled tools ship but are unreachable. One caveat that turns into
    question #28: `tools.config.json` is imported, so it is compiled into the bundle and
    editing it needs a rebuild. Moving it to `public/` and fetching it at runtime is the
    upgrade if that becomes a problem.
28. **Who is expected to edit `tools.config.json`?** If the teacher edits it herself, the
    format has to survive a hand edit — which argues for plain JSON with comments in the
    README, or possibly a simple settings page in the site itself rather than a file. If
    only a developer touches it, the format can be terser.
29. **Should tools be toggleable per class period rather than globally?** She may teach two
    different courses from the same laptop. If so, config needs named presets ("Chem 1",
    "AP Chem") and a way to switch between them quickly, which is a meaningfully bigger
    feature than a single on/off list.

## For the teacher — `mass-balance` (★ requested)

Raised while designing the tool from `reference/labs/LAB Measuring Mass Inquiry.md`. All of
these are about matching what her class will see on the real bench, so the simulated balance
and the real one agree. Bring them to the first demo (plan.md item 1).

30. **Do her balances read to one decimal place or two?** Task 1 asks students to find out,
    which suggests she knows. This sets the default for the tool's `decimals` option; the
    wrong default makes every number on the projector disagree with every number on the
    bench.
31. **Does the button say Tare or Zero?** Task 2B asks the students which; the tool's
    `tareLabel` option should say whatever her balances say.
32. **Are all the group balances the same model?** If it is a mixed set, the decimals
    switch belongs on the page itself rather than only in config, so she can show both.
33. **Should 10 mL of water mass exactly 10.00 g, or 9.98 g?** The lab teaches
    `1 mL = 1 g`, so the tool defaults to exactly 1.000 g/mL and Task 5 comes out matching.
    Real room-temperature water is 0.998 g/mL, which a two-decimal balance shows on anything
    over 25 mL. Which does she want the class to see — the rule, or the reason it is only
    approximately true?
34. **What does an inflated balloon actually read on her balance?** — **affects the
    tool's numbers.** A balance does not read the full mass of the air inside a balloon:
    buoyancy cancels all but the small excess from the balloon's overpressure, so a real
    party balloon reads only a few tenths of a gram more than an empty one, not 3–4 g. The
    tool models the balance reading, but the range it randomizes over should come from a
    real measurement on her balloons and her balance, not a guess. Asking her to mass one
    pair and report the two numbers is enough.
35. **Should the balance have a lid?** Task 1 asks whether the students' balance has one.
    The first version leaves it out; if she wants "open the lid" rehearsed as a step, it is
    a small addition.
36. **Is the on-page record table wanted, or is it noise?** The tool mirrors the
    worksheet's blanks so she can fill them in live on the projector and reveal the
    subtraction. If the class always has the paper in front of them, a simpler readout may
    serve better.
