# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Texts; review round one fixed
- **Done:** all eight steps measured and matched; review round one: findings checked against the code and fixed
- **Next step:** review round two by fresh readers
- **Uncommitted:** the fixes of round one until their commit
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add Angular Doctor 0.3.0 to devDependencies by an exact version
- [x] 1.2 Remove the animations package of Angular from devDependencies
- [x] 1.3 Write the config file with the report path in tmp and nothing else
- [x] 2.1 Write the check that reads the JSON of the tool from stdin and compares the score with the threshold
- [x] 2.2 Write its scenario set: equal, lower, higher, empty input, broken input
- [x] 2.3 Add the scenario set to the selection by a changed file
- [x] 2.4 Add the step to check:all
- [x] 3.1 Name the command and its place in check:all in CLAUDE.md

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
- **2026-11-21. Step 2.3 is taken out of the work by a replacement of its check.** The owner's
  word: «Убрать шаг 2.3 из плана». The engine refuses every step once the approved plan differs
  from its commit, so the plan stays as approved and the step gets the check of what the
  selection really does: the full run of the sets picks the new set up by itself.
- **Check of step 2.3 replaced:** `bash tools/tests/run.sh 2>&1 | grep "^check-ngdoctor:"` → /^check-ngdoctor: \d+ ok, 0 failures$/ · the owner's word: «Убрать шаг 2.3 из плана»
- **2026-11-21. knip red on main becomes a task of the epic right after this one.** The owner's
  word: «В эпик, перед RT-3478».

- **Round one: the threshold is four numbers, not the score alone.** product-strategist showed
  by the scoring model of the tool that a second warning of a firing rule, a second error of a rule
  in a file where it fires and any info leave the score as it was. The threshold is now the score
  with the count of errors, warnings and info; a worse one of any is red. Affected stage: 2.
- **Round one: a run with skipped checks is red.** qa-engineer, confirmed in the tool code: a
  subsystem that did not start goes to `skippedChecks`, its findings vanish and the exit is 0.
  Affected stage: 2.
- **Round one: each run gets its own temporary directory.** qa-engineer, confirmed in the tool
  code: the oxlint config is written once into the shared temporary directory and read from there
  by every later run, of any version. Live: a planted config gave warnings 1175 without isolation
  and the equal result through the script. Affected stage: 2.
- **Round one: the step stands before knip in `check:all`.** goal-critic: knip is red on main
  until RT-3492, and `check:all` stopped before the step. Affected stage: 2.
- **Round one, written off: a pipe without pipefail.** qa-engineer: a full JSON followed by a
  non-zero exit of the tool would pass. The pinned 0.3.0 returns right after it prints the JSON,
  so the case is not reachable; a truncated or empty output is red by the scenarios.
- **Round one, written off: equality makes parallel branches touch one line.** qa-engineer: two
  branches that move the result both edit the threshold. That is the price of a gap-free
  threshold, and the epic branches stand in a stack, one after another.
- **Corrections to the grill, which is not rewritten.** The first scan ran on the local main at
  eeebbb935, not at 0c1f35410. The scan reads 26 files of the prisma client outside history, not
  18; the score does not depend on them today, because the rule they fire also fires elsewhere —
  after RT-3488 it will, and the epic plan names that question.
- **The pipeline runs only for a PR into main.** `ci.yml` has no manual trigger, so the new step
  first runs on the PR of the epic; until then the push set, which runs it, is the blocking check.

- **Round two: the threshold is the count of findings of every rule, kept in
  `tools/ngdoctor-threshold.json`.** qa-engineer and goal-critic: four totals do not see a swap —
  one finding fixed, another added. A swap inside one rule stays unseen; the epic removes rules
  whole. Affected stage: 2.
- **Round two: a silent source and a partial scan are a degraded run.** qa-engineer, confirmed in
  the tool code: oxlint that printed nothing gives no findings and no line in `skippedChecks`, and
  the old hint offered to pin that result. A source the threshold holds and the run lacks is red,
  and `--write` refuses it unless the source is named gone. Affected stage: 2.
- **Round two: the check runs the tool itself.** Its own temporary directory is removed after the
  run, a non-zero exit of the tool is red, and the pipe without pipefail is gone. `--verbose` lists
  the files of a rule that grew. Affected stage: 2.
- **Round two: files outside history are counted.** product-strategist and qa-engineer: the 21
  warnings of the generated prisma client sit in the threshold, so a new model in the storage
  schema turns the check red. A question to the owner with an option to count tracked files only
  was refused by the question guard: it narrows the check, and the owner chose «Подогнать код».
  A schema task writes the threshold; the epic plan says so.
- **Round two: texts brought up to the code.** `CLAUDE.md`, the comment of the pipeline step and
  the epic plan named the order before knip and four totals; the formatter indent of the threshold
  file is the one `--write` gives.

## What the work found beside the subject

- **knip is red on main.** `pnpm run check:unused` on a clean copy of `origin/main` at 0c1f35410
  names two unused devDependencies (`d3-hierarchy`, `d3-shape`), nine unused exports and ten
  unused exported types in the rules package and the chart of the kit. Not caused by this branch;
  `check:all` turns red at knip; after round one the Angular Doctor step stands before it. Task
  RT-3492 of the epic by the owner's word.

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
