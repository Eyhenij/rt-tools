# code-design — how it is arranged here

The names of this tree next to the rule `SKILL.md` beside it.

## Where it lives

- **the layer that brings the rule** — `.claude/hooks/skill-gate-layers.sh`, called by `.claude/hooks/skill-gate.sh`; the demonstration components of the showcase and the linter settings are lifted by `skill_layer_skip` in `.claude/rt-kit/gate-map.sh`
- **the check of coupling** — `tools/check-coupling.mjs`: `--module=<path>` gives the numbers for the plan, `--base=origin/<base>` gives «was → became» of the branch; the roots, the declared blocks and the harness are in `coupling` of `.claude/rt-kit/checks.json`
- **the old cycles and imports past an entry** — `tools/coupling-allowlist.json`, each with its reason and task; a new one is lifted only by a reason that begins with the owner's words
- **the borders of libraries** — `@nx/enforce-module-boundaries` in `eslint.config.mjs` with `eslint/boundaries/domains/`
- **the second copy** — `tools/check-dupes.mjs`; **the unused export** — `knip.json`
- **the size of a module** — `max-lines` in `eslint.config.mjs` and `tools/check-file-size.mjs`
- **the plan and the progress** — `docs/tasks/<branch>/`

## Where the articles are carried out

- **The executor chooses modules, bounds, terms and patterns before the code and writes them in the plan.** — `.claude/hooks/skill-gate-layers.sh:code-design-choose` — a grill and a plan are refused until the rule and the table are loaded; the section itself is not demanded by any check yet, that is RT-3610. In the plan mode of the host the gate is silent: the file of the plan lies outside the tree.
- **A chosen pattern is written with its place, its problem and the simpler way dropped.** — **Not checked by anything.** The place is compared with the code by RT-3610 and RT-3611.
- **Code is read first: who imports the module and whom it imports.** — **Not checked by anything.** The code graph answers relations; reading leaves no trace.
- **Coupling is counted before and after the edit.** — `tools/check-coupling.mjs:growthLeft` — the push set refuses outgoing links grown past the first plan of the branch; scenario SC-AK-1960. Incoming links are printed. A link through a template, a name in a variable and a script started from code are not counted.
- **A module has one duty, said in one sentence without «and».** — **Not checked by anything.** A reader of the plan and of the diff judges it.
- **Isolation: from outside a module is called through its entry and tested without its neighbours.** — `tools/check-coupling.mjs:structureLeft` — a new import past an entry is refused; between packages and libraries `eslint.config.mjs:enforce-module-boundaries` holds it too. The folders of the package scripts have no entry, and for the test without neighbours nothing holds it.
- **An import goes from the detail to the decision.** — `eslint.config.mjs:enforce-module-boundaries` — the direction between libraries; inside a package only a reverse link is seen, as a cycle of blocks by `tools/check-coupling.mjs`, and for a decision without disk and network nothing holds it.
- **Only what a neighbour calls is exported.** — `knip.json:entry` — `pnpm run check:unused`, where the file is not an entry itself: the exports of `tools/`, of the package assets and of the kit components are judged by nothing, and the functions of scripts neither.
- **A decision lives in one module.** — **Not checked by anything.** `tools/check-dupes.mjs` sees repeated exports and settings, not a repeated condition.
- **A cycle between modules is broken by moving the shared part out.** — `tools/check-coupling.mjs:structureLeft` — a new cycle of modules or of blocks is refused, scripts included; scenario SC-AK-1958. The old ones lie in the list with their task.
- **Each input form is named with its source and an example and has a test case, a refused one too.** — **Not checked by anything.** The refusal of a plan without the cases is RT-3610.
- **Bounds are written: contracts, versions and safety that stay, imports that are forbidden.** — **Not checked by anything.** A reader of the plan judges it.
- **The priority is named: which of speed, memory, simplicity and reliability wins.** — **Not checked by anything.** A reader of the plan judges it.
- **The budget is a number before the code: files, lines, dependencies.** — **Not checked by anything.** The comparison with the diff is RT-3611.
- **The diff holds only what the steps need.** — **Not checked by anything.** The end of the stages asks whether every declared path was touched; a path or a line beside the plan is seen by a reader.
