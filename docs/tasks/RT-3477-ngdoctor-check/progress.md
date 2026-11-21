# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `замысел-записан`
- **Stage:** 1 of 3 — The package and its settings
- **Done:** the plan is approved by the owner; all eight step checks were red before the work
- **Next step:** add Angular Doctor 0.3.0 to devDependencies
- **Uncommitted:** the progress
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Add Angular Doctor 0.3.0 to devDependencies by an exact version
- [ ] 1.2 Remove the animations package of Angular from devDependencies
- [ ] 1.3 Write the config file with the report path in tmp and nothing else
- [ ] 2.1 Write the check that reads the JSON of the tool from stdin and compares the score with the threshold
- [ ] 2.2 Write its scenario set: equal, lower, higher, empty input, broken input
- [ ] 2.3 Add the scenario set to the selection by a changed file
- [ ] 2.4 Add the step to check:all
- [ ] 3.1 Name the command and its place in check:all in CLAUDE.md

## Decisions along the way

- **The step goes into the pipeline and the push set as well.** The owner's word of 21.11.2026,
  asked together with the plan approval: «Да, и в CI». The push set is never narrower than the
  pipeline, so the push set names the step too. Affected stage of the plan: 2 — done after step
  2.4, before the texts.
- **The code graph is not read for this task.** The work adds a tool and edits the root manifest;
  the graph answers relations between files of the projects, and no project file is touched.
  Affected stage of the plan: 1.

## Sessions

### 2026-11-21

- The scan on main at 0c1f35410: score 31; a `--score-only` run took 29 s.
- The epic card RT-3476 and the cards RT-3477…RT-3490 are created and linked as sub-issues (14).
- Two roles read the plan before the approval: goal-critic and product-strategist. Taken in: the
  threshold equal to the measured score, a red verdict on a failed run of the tool, a config that
  turns nothing off, the description of `check:all` in `CLAUDE.md`.
