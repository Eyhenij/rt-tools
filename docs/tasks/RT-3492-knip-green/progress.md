# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `замысел-записан`
- **Stage:** 1 of 3 — Exports nobody imports
- **Done:** the grill, the plan, its reading by both roles and the owner's approval
- **Next step:** drop `export` from the 19 symbols knip names
- **Uncommitted:** this file until its commit
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Drop `export` from the 19 symbols knip names in the agent kit, the chart scene and the link block fixture
- [ ] 2.1 Move `d3-hierarchy`, `d3-shape` and their type packages from the root devDependencies to devDependencies of the kit
- [ ] 2.2 Keep the versions exact in the kit manifest
- [ ] 2.3 Declare all four in the kit manifest
- [ ] 3.1 Run knip over every project
- [ ] 3.2 Mark RT-3492 as done in the epic plan

## Decisions along the way

- **The edit of the chart scene goes without a look.** `rt-chart.scene.ts` is a file the kit
  approval check counts as visible; the edit only drops `export` from three names. The owner's word
  of 21.11.2026, asked by the ready-made question: «Подтверждаю, вид не меняется». It goes into
  `approvals.md` of this folder. Affected stage of the plan: 1.
- **knip goes into the push set and the pipeline in this task.** The owner's word of 21.11.2026:
  «Да, в этой задаче»; a knip run takes 2.7 s. This reverses the earlier decision of RT-3308 and
  RT-3310 to keep knip out of the push set for a shorter push. Done as stage 4 after stage 3:
  `pnpm run check:unused` in `rt_push_checks`, a step in the pipeline, a `pushGate` line in the
  checks settings named the same, and the line in `CLAUDE.md` that says knip is not in the push set.
  Affected stage of the plan: 3, and a stage 4 the plan does not name.
- **The task point gets its measurement.** `pnpm run check:all` → exit 0 is run after stage 4 and
  its result goes into the session entry. Affected stage of the plan: 3.
- **All four d3 versions are checked for exactness, not one.** The check of step 2.2 reads
  `d3-shape` only, and `tools/check-dependencies.mjs` reads only the root manifest; a measurement
  over all devDependencies of the kit manifest goes into the session entry. Affected stage of the
  plan: 2.
- **The dependencies companion names the dev copy of an optional peer.** After the move the kit
  manifest is the first place where a development copy of a package lives outside the root one.
  Affected stage of the plan: 2.

## Sessions

### 21.11.2026

- The grill, the plan with six steps, two role readings, the approval mark written by `plan-red`
  after a third menu: the first menu of three questions wrote a mark the engine never accepted
  (finding in `docs/plans/angular-doctor-findings.md`).
