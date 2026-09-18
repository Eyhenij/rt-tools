# Plan

**Task:** RT-2241 · **Branch:** RT-2241-cargo-mark-tree-sign
**Behaviour:** unchanged — правится команда дерева `tools/cargo-mark.mjs`, её тест и описание домена; приложений работа не касается, владелец завёл эпик по правилам.

## Task footprint

| What  | Where                                                                 |
| ----- | --------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/cargo-mark/` — spec, implementation, scenarios  |
| Laws  | `docs/constitution/work-conduct.md` — read, not edited                |
| Rules | `.claude/skills/cargo-triage/` — read, not edited                     |
| Code  | `tools/cargo-mark.mjs`, `projects/agent-kit/tests/cargo-mark.test.sh` |

## What counts as done

- The dry run of the mark prints the same tree sign as the send: `tree b101ab1c9908`.
- An empty tree sign is refused before the network with a named reason.
- The suite of the mark checks the sign positively and grows by the new scenario; the spec carries the statement, the binding and scenario SC-AK-1130.
- The nine records closed by the edition 0.29.0 stand in the intake as `released` — the mark works on the live intake.

## Stages

### 1. The mark takes the tree sign from the module where it is declared

- **What is done:** `treeSlug` imports `treeSlugOf` from `tree-mark.js` of the built package; `mark` refuses before the network when the sign is empty and names the reason. Test SC-AK-558 checks the sign positively — twelve hex characters — before the equality; test SC-AK-1130 — an empty sign is refused before the network.
- **Readiness sign:** the suite of the mark grows and stays green; the dry run prints the sign.
- **Verified by:** `bash projects/agent-kit/tests/cargo-mark.test.sh` — the last line reads `N ok, 0 провалов` with N above 34 (today 34).

### 2. The spec names the statement, the binding and the scenario

- **What is done:** the spec of the mark gets the statement «An empty sign of the tree is refused before the network», a row of the refusal table, the binding, scenario SC-AK-1130, a history line.
- **Readiness sign:** the spec audit finds no statement without binding and no scenario without a test.
- **Verified by:** `npm run check:specs` — exit code 0, no line about `cargo-mark`.

### 3. The nine closed records are marked on the live intake

- **What is done:** `npm run cargo:mark -- --state fixed` per fix group, then `--state released --release 0.29.0` for all nine; the answers are read.
- **Readiness sign:** the read of the intake filtered by `new` shows the five open records alone.
- **Verified by:** `npm run cargo:pull -- --kind proposal --state new` — `in all 2`; `npm run cargo:pull -- --kind postmortem --state new` — `in all 4`.

## What this work does not do

- The five open records: they are taken into work by the tasks RT-2242…RT-2246 and marked `in_work` by them.
- The intake and the send: only the mark command is edited.
