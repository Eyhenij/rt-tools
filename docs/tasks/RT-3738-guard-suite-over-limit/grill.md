# Grill

**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/guard/`

## The owner request

> заводи задачу в этот эпик и правь

The owner's word of 27.11.2026, after the first one of that day: «поправь конфликты
https://github.com/Eyhenij/rt-tools/pull/3689».

## What the tree already has

- After the merge of the main branch into the epic branch the suite
  `projects/agent-kit/tests/flow-step-guard.test.sh` holds 519 lines; the file length check counts 520
  at a limit of 500 for code. The epic branch added the cases of the time limiter to it, the main
  branch the cases of the merge of a reviewed base.
- The cases of the time limiter are one closed section of 88 lines: the command directories, the
  fixture `RT-11-limits` and 24 cases titled «SC-AK-2021 —». It takes from the rest of the file only
  the name of the guard, the list of temporary directories and the helpers of
  `projects/agent-kit/tests/flow-step-guard-lib.sh`.
- The runner `tools/tests/run.sh` takes every `*.test.sh` of the directory: a new file needs no
  registration.
- The helpers of the suite already moved out once for the same limit, into `flow-step-guard-lib.sh`.

## What the rules already say

- `doc-style`: a document is no longer than the length limit; the limit stays.
- `spec-driven`: a scenario and its test title change together; the scenario names its suite.

**Tasks of the grill:** 1

## Questions and answers

**Файл набора стража после слияния длиннее предела; как идти дальше?** (27.11.2026)
«заводи задачу в этот эпик и правь»

## Decisions

- **The limiter cases move to a suite of their own, `flow-step-guard-limits.test.sh`** — the section
  is closed and names one scenario. Rejected: a line in the allowlist of the length check — the check
  itself says to split.

## What is left unclear

- None.
