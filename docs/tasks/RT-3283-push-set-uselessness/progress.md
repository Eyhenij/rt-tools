# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The texts
- **Done:** grill, agreement SC-AK-1657…1668, plan approved by the owner: «Одобряю plan.md RT-3283
  (Recommended)»; stages 1 and 2.
- **Next step:** step 3.1 — the agreement merges into the package spec with its bindings.
- **Uncommitted:** nothing.
- **PR:** not open yet. RT-3270 (PR #3369) is merged into the epic branch; this PR goes into the
  epic branch.

## Steps

- [x] 1.1 `push-inputs.mjs subject <base>` prints per step `touched`, `idle`, `unknown` or `not-run`, by the push inputs table and by the subject the profile declares with `rt_push_subject`
- [x] 1.2 The profile of this tree declares the subject of the package hook scenarios — the hooks, the checks and the scenarios of the package — and of the steps the table does not record
- [x] 1.3 `rt_run_note` writes the moment, the base checksum and the subject mark, and takes the command checksum with the base replaced by a mark
- [x] 1.4 Both runners of the set write a line of seven fields for every step, a step `select` dropped included
- [x] 2.1 `push-set-usefulness.ts` counts per check the runs, the seconds, the refusals, the false and the real refusals, the idle and the not-run steps and the price of a defect, old lines included
- [x] 2.2 `agent-kit metrics` prints the section «Проверки набора» and the two lists of candidates ordered by seconds, one line per check over its bases, narrowed by `--day`
- [x] 2.3 The report over 11–17 November of this machine names the kit snapshots and the admin e2e as falsely refusing
- [>] 3.1 The agreement merges into the package spec as the subdomain `push-set-usefulness` with its bindings
- [ ] 3.2 The README of the package names the table of the push set checks

## Decisions along the way

- **The plan was rewritten by the roles before the owner saw it.** `product-strategist`: the sign
  was met before any code, and the root of the package as the subject of the hook scenarios hides
  the owner's own example. `goal-critic`: one check splits into lines by its base, a step `select`
  dropped never runs idle, the `sed` of check 2.3 does not work on this machine. All four are
  closed in the agreement and the plan. Affected stages: 1, 2.
- **The branch stands on RT-3270, not on the epic branch.** PRs of the epic go as a cascade, each
  from the previous one. Affected stage of the plan: none.
- **The check checksum drops the base entirely, and the report takes it from the hook.** A step
  carrying its base split into one line per base; with the base replaced by a mark, the step
  printed without a base still stood apart. The report calls `rt_check_id` of the laid-out hook
  instead of its own copy of `cksum`: two computations of one value drift apart silently. Old
  lines written with the base inside are joined by the checksum of each base the tree knows.
  Affected stage: 2.
- **The report counts 44 false of 57 for the kit snapshots and 17 of 28 for the admin e2e, not
  45 of 58 and 19 of 30.** The baseline was counted by hand over the raw lines; the report joins
  checks by the current set and leaves the lines of commands it no longer names under their
  checksum. SC-AK-1666 takes the report's numbers at the merge. Affected stage: 3.

## Sessions

### 17.11.2026

- Grill closed by assumption after two «Recommended» answers in a row; agreement and plan written.

### 18.11.2026

- Stages 1 and 2 closed: the run line carries seven fields, the report prints the section and both
  lists; the week of this machine names the kit snapshots and the admin e2e.
