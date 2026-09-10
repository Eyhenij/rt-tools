# Plan

**Task:** RT-2037 · **Branch:** RT-2037-misc-rules-fixes
**Behaviour:** unchanged — the work edits the rules layer and one of its hooks; no application
code is touched, and the owner ordered the whole epic as a walk over the intake.

## Task footprint

| What  | Where                                                                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/dev-server/`, `docs/specs/agent-kit/delivery-gate/`, `docs/specs/agent-kit/rules/`, `docs/specs/agent-kit/patterns/`, `docs/specs/agent-kit/laws/`, `docs/specs/agent-kit/texts/`, `docs/specs/agent-kit/rule-article/` |
| Laws  | `docs/constitution/verifiability.md`                                                                                                                                                                                                          |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/lib-layers/`, `.claude/skills/doc-style/`, `.claude/skills/testing/`, `.claude/skills/task-flow-close/`; the procedure pattern is dropped by this tree and lives only as a package source     |
| Code  | `projects/agent-kit/assets/hooks/dev-server-guard.sh`, `projects/agent-kit/assets/hooks/skill-gate.sh`, `projects/agent-kit/tests/dev-server-guard.test.sh`                                                                                   |
| Plan  | `docs/plans/cargo-intake.md` — row 9 of the makeup                                                                                                                                                                                            |

## What counts as done

- Each of the eleven cargo records of the grill has an outcome on disk: an edit of its resource,
  or a written reason why the resource is right.
- The dev server guard asks the tree who raises the stands and refuses on a taken port under both
  values of the key; a tree that sets nothing keeps today's behaviour.
- `docs/specs/agent-kit/dev-server/` names the new behaviour by articles, bindings and a scenario,
  and the scenario has a probe with its number in the title.
- The eleven records are marked in the intake, each with the text of what closed it.
- The makeup row of the epic plan names eleven records and the state of this work.

## Stages

### 1. The dev server guard asks the tree who raises the stands

- **What is done:** a profile key next to the stand list — `owner` keeps today's refusal on any
  raising, `session` leaves only the refusal on a taken port, an unset key reads as `owner`; the
  articles, the bindings and the scenario of `docs/specs/agent-kit/dev-server/` are written by the
  same change.
- **Readiness sign:** the guard refuses raising under `owner` and lets it through under `session`
  while the port is free, and under both refuses over a taken port.
- **Verified by:** `bash projects/agent-kit/tests/dev-server-guard.test.sh` — the last line says
  no failures, and the count of probes is higher than the 24 standing there now.

### 2. Three articles of the delivery rule

- **What is done:** records 1 and 6 — the working tree is emptied before the PR opens, a push into
  a branch with an open PR is followed by rereading its body, and the last sentence of the article
  about a chain's base is replaced by what the host actually does with a live lower branch.
- **Readiness sign:** `rules/git-workflow.github.md` holds the three statements, and the article
  about a chain no longer promises that the host retargets the base by itself.
- **Verified by:** `npm run check:specs` — the `delivery-gate` area has no divergences.

### 3. The law article and four articles of rules

- **What is done:** record 8 into `laws/verifiability.md`, record 9 into `rules/doc-style.md`,
  record 3 into `rules/lib-layers.md`, record 11 into `rules/testing.md`, and record 10 into the
  header of `hooks/skill-gate.sh` — the promise of one refusal per session is completed by the
  re-arming on compaction.
- **Readiness sign:** each of the five resources holds its statement, and the law article stands
  before the article about a red check, which it is the premise of.
- **Verified by:** `npm run check:specs` — the `laws`, `texts`, `rules` and `rule-article` areas
  have no divergences.

### 4. Two patterns

- **What is done:** record 4 — a fourth place where stale text lies, and the search line for
  companions under it; record 7 — two misses in declaring a right of a procedure.
- **Readiness sign:** `patterns/task-flow-close.md` names four places and its command searches
  companions; `patterns/ts-procedure.md` holds the two misses.
- **Verified by:** `npm run check:specs` — the `patterns` area has no divergences.

### 5. Delivery: layout, checks, the intake and the makeup

- **What is done:** the package is built and laid out, the whole set of checks is run, the eleven
  records are marked in the intake with the text of what closed each, row 9 of the epic plan is
  corrected to eleven records, the folder is taken apart into the description of the past and the
  PR opens as a draft.
- **Readiness sign:** the laid-out files match the package, the checks are green, and the intake
  holds no record of this work in the state `new`.
- **Verified by:** `pnpm run agent-kit:check && npm run check:specs && npm run check:docs && node tools/check-file-size.mjs`
  — every one of the four says no divergences.

## What this work does not do

- It does not reverse the re-arming of the rules gate on compaction. Record 10 asks for that, and
  the reason against it is written in the grill; only the promise in the header is completed.
- It does not touch the records about opening a PR ready instead of a draft — they are row 10 of
  the epic plan, `RT-2038`, and it waits for the owner's word.
- It does not publish a new edition of the package: that is the owner's decision and a run of
  their own.
