# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The threshold check
- **Done:** steps 1.1–2.2 measured and matched; 2.4 and 3.1 are done in the tree and matched by `step`, their marks wait for 2.3; the step is in the pipeline and the push set
- **Next step:** the owner's word about step 2.3, whose check cannot match as written
- **Uncommitted:** nothing after the stage commit
- **Waiting for the owner:** the way out for step 2.3
- **PR:** not open yet

## Steps

- [x] 1.1 Add Angular Doctor 0.3.0 to devDependencies by an exact version
- [x] 1.2 Remove the animations package of Angular from devDependencies
- [x] 1.3 Write the config file with the report path in tmp and nothing else
- [x] 2.1 Write the check that reads the JSON of the tool from stdin and compares the score with the threshold
- [x] 2.2 Write its scenario set: equal, lower, higher, empty input, broken input
- [>] 2.4 Add the step to check:all
- [ ] 3.1 Name the command and its place in check:all in CLAUDE.md

## Decisions along the way

- **The step goes into the pipeline and the push set as well.** The owner's word of 21.11.2026,
  asked together with the plan approval: «Да, и в CI». The push set is never narrower than the
  pipeline, so the push set names the step too. Affected stage of the plan: 2 — done after step
  2.4, before the texts.
- **The code graph is not read for this task.** The work adds a tool and edits the root manifest;
  the graph answers relations between files of the projects, and no project file is touched.
  Affected stage of the plan: 1.
- **The score is fractional, and the check compares it exactly.** After stage 1 the JSON carries
  32.5, while the tool shows a person 33 in `--score-only` and in the report. The threshold is
  32.5; the last line prints the score rounded, as the tool shows it, so the check line of step 2.1
  matches. Rounding before the comparison would miss a drop of 0.75 from 32.25 to 31.5. Affected
  stage of the plan: 2.
- **Step 2.3 has nothing to do, and its check cannot match.** `tools/tests/select.sh` prints `all`
  for any changed path under `tools/` that is not a test, so every set runs, the new one with them.
  A set file is picked by name only for texts and the harness. The check line waits for the set
  name and gets `all`. Affected stage of the plan: 2.
- **2026-11-21. Step 2.3 is removed from the plan.** The owner's word: «Убрать шаг 2.3 из плана».
  The plan lost the step and its check line; the numbering of the rest is kept.
- **2026-11-21. knip red on main becomes a task of the epic right after this one.** The owner's
  word: «В эпик, перед RT-3478».

## What the work found beside the subject

- **knip is red on main.** `pnpm run check:unused` on a clean copy of `origin/main` at 0c1f35410
  names two unused devDependencies (`d3-hierarchy`, `d3-shape`), nine unused exports and ten
  unused exported types in the rules package and the chart of the kit. Not caused by this branch;
  `check:all` stops at knip before it reaches `check:ngdoctor`.

## Sessions

### 2026-11-21

- The first scan ran on the local `main` at eeebbb935, 442 commits behind `origin/main`, not at
  0c1f35410 as the epic plan says: score 31. On the fresh base after stage 1 the score is 32.5
  (74 errors, 1186 warnings, 200 info); four warnings came with the fresh code of main, and the
  deprecated animations error left. A local run takes 5 s.
- The epic card RT-3476 and the cards RT-3477…RT-3490 are created and linked as sub-issues (14).
- Two roles read the plan before the approval: goal-critic and product-strategist. Taken in: the
  threshold equal to the measured score, a red verdict on a failed run of the tool, a config that
  turns nothing off, the description of `check:all` in `CLAUDE.md`.
- Live check on the real output of the tool: threshold 32.5 green with «score 33 = threshold 33»;
  33.25 red, «a new finding appeared»; 31.75 red, «write THRESHOLD = 32.5»; an empty pipe exit 1;
  the report lands in `tmp/`, `git status` clean of it. The scenario set: 10 ok.
- `node tools/check-push-gate.mjs`: pipeline steps 40, closed by the set 30, exclusions 10.
