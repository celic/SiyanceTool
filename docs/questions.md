# Open Questions

Questions raised while writing [plan.md](plan.md) and [tools.md](tools.md), grouped by who
can answer them. Most are
not blocking — the plan can start without them — but the ones marked **blocking** change
work that would otherwise have to be redone.

Answer format: add the answer inline under the question and mark it `ANSWERED`.

---

## For you (project decisions)

1. **Which framework?** — **blocking on item 1.** The plan recommends Vite + React +
   TypeScript, with SvelteKit as the runner-up. Do you already know one of these well? Your
   familiarity should outweigh the recommendation.
2. **Who maintains this in a year?** If the answer is "a student" or "the teacher," that
   argues for the simplest possible stack, even at the cost of duplication.
3. **Is "SiyanceTool" the real name?** It affects the repo, the page titles, and any domain.
   Is there a domain already, or will this live on a `github.io` subdomain?
4. **How much do you want to build before showing her?** Recommendation: build the
   `periodic-table` tool alone (plan.md item 7) and demo it, before committing to items 2
   through 6 in full. The feedback will reshape the design system.

## For the teacher (classroom reality)

These are the highest-value questions in this file. Several of them can invalidate work.

5. **Which course, and which curriculum?** First-year chemistry, honors, AP, or IB? AP adds
   equilibrium, kinetics, and thermodynamics depth that changes the tool list. Is she
   teaching to NGSS, a state standard, or her own sequence?
6. **What is her unit order, and what is she teaching next?** — **blocking on build order.**
   Building the tool for the unit she teaches next month is worth far more than building the
   "best" tool for a unit that already passed. This should drive plan.md items 10 and 11 entirely.
7. **What does she already use, and what is missing from it?** PhET simulations cover gas
   laws and pH well and are free. If PhET already solves a tool on this list, that tool
   should be dropped and the effort moved to something PhET does not do — the mole map, the
   nomenclature drill, and the projector-first reveal-answer flow are all candidates.
8. **Is this teacher-driven only, or will students open it themselves?** — affects plan.md
   item 12 heavily. If students use it, mobile layout and offline support become real
   requirements rather than nice-to-haves.
9. **Does she want printable worksheets** generated from the drill tools, or is everything
   on screen?
10. **Does she want any kind of "show your work" output** she can put on an assessment, or
    are these purely for live demonstration?

## Classroom and IT constraints

11. **What is the projector's resolution and aspect ratio?** Older classroom projectors are
    often 1024x768 and wash out low-contrast colors badly. This sets the floor for plan.md item 3.
12. **What devices would students use?** School Chromebooks, personal phones, or nothing?
    Chromebooks are fine; phones would force a serious mobile rethink of the periodic table
    and any canvas simulation.
13. **How locked down is the school network?** Are arbitrary domains blocked? Some districts
    block anything not on an allowlist, which would make hosting choice (plan.md item 9) a real
    constraint rather than a free pick.
14. **Is the classroom internet reliable?** If not, offline support moves from plan.md item 12's
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
    site? Needs a citable source before plan.md item 4 starts.
24. **Does `3Dmol.js` cover the VSEPR tool well enough** to skip building on raw Three.js?
    Worth an hour of evaluation before the Tier 2 work in plan.md item 10 starts.
25. **How complex should the URL state encoding be?** Plain query parameters stay readable
    and hand-editable; compressed encoding stays short. Readable is probably better here,
    since a teacher may want to hand-tweak a bookmarked scenario.
26. **Do any tools need a random seed** so a "randomized" problem set can be reproduced from
    a shared link? Relevant to plan.md items 8 and 11 together.
27. **Should the tool on/off config be build-time or runtime?** Runtime (ship everything,
    hide what is disabled) is simpler and lets a config-only change redeploy in seconds.
    Build-time gives smaller bundles and keeps unfinished tools off the wire entirely. The
    plan recommends runtime unless bundle size becomes a real problem on the school network.
28. **Who is expected to edit `tools.config.json`?** If the teacher edits it herself, the
    format has to survive a hand edit — which argues for plain JSON with comments in the
    README, or possibly a simple settings page in the site itself rather than a file. If
    only a developer touches it, the format can be terser.
29. **Should tools be toggleable per class period rather than globally?** She may teach two
    different courses from the same laptop. If so, config needs named presets ("Chem 1",
    "AP Chem") and a way to switch between them quickly, which is a meaningfully bigger
    feature than a single on/off list.
