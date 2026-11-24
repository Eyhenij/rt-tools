# code-design — how it is arranged here

The names of this tree next to the rule `SKILL.md` beside it.

## Where it lives

- **the layer that brings the rule** — `.claude/hooks/skill-gate-layers.sh`, called by `.claude/hooks/skill-gate.sh`
- **the check of import cycles** — `tools/check-cycles.mjs` over the `.ts` files under `projects/`
- **the borders of libraries** — `tools/check-lib-layers.mjs` and `@nx/enforce-module-boundaries` in `eslint.config.mjs`
- **the second copy** — `tools/check-dupes.mjs`; **the unused export** — `knip.json`
- **the size of a module** — `max-lines` in `eslint.config.mjs` and `tools/check-file-size.mjs`
- **the plan and the progress** — `docs/tasks/<branch>/`

## Where the articles are carried out

- **The executor chooses modules, bounds, terms and patterns before the code and writes them in the plan.** — `.claude/hooks/skill-gate-layers.sh:code-design-choose` — the rule and the table come on the grill and the plan; the section itself is not demanded by any check yet, that is RT-3610.
- **A chosen pattern is written with its place, its problem and the simpler way dropped.** — **Not checked by anything.** The place is compared with the code by RT-3610 and RT-3611.
- **Code is read first: who imports the module and whom it imports.** — **Not checked by anything.** The code graph answers relations; reading leaves no trace.
- **Coupling is counted before and after the edit.** — **Not checked by anything.** The command is RT-3609; until then the count is made by a search over imports.
- **A module has one duty, said in one sentence without «and».** — **Not checked by anything.** A reader of the plan and of the diff judges it.
- **Isolation: a module is called through its entry and tested without its neighbours.** — `eslint.config.mjs:enforce-module-boundaries` — between packages; inside a package nothing holds it until RT-3609.
- **An import goes from the detail to the decision.** — `tools/check-lib-layers.mjs:domainLibs` — between the layers of the libraries; inside the rules package nothing holds it.
- **Only what a neighbour calls is exported.** — `knip.json:ignoreIssues` — `pnpm run check:unused`: an export nobody imports turns the check red.
- **A third copy of a condition becomes a function or a table.** — **Not checked by anything.** `tools/check-dupes.mjs` sees repeated exports and settings, not a repeated condition.
- **A cycle is broken by moving the shared part out.** — `tools/check-cycles.mjs:edgesOf` — a cycle turns it red; how it was broken is seen by a reader.
- **Each input form is named and has a test case, a refused one too.** — **Not checked by anything.** The refusal of a plan without the cases is RT-3610.
- **Bounds are written: the contracts, versions and safety that stay.** — **Not checked by anything.** A reader of the plan judges it.
- **The priority is named: which of speed, memory, simplicity and reliability wins.** — **Not checked by anything.** A reader of the plan judges it.
- **The budget is a number before the code: files, lines, dependencies.** — **Not checked by anything.** The comparison with the diff is RT-3611.
- **The diff holds only what the steps need.** — `tools/task-flow/measure/footprint.mjs:touched` — the end of the stages asks whether every declared path was touched; a path or a line beside the plan is seen by a reader.
