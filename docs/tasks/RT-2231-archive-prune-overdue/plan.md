# Plan

**Task:** RT-2231 · **Branch:** RT-2231-archive-prune-overdue
**Behaviour:** unchanged — удаляются записи описания прошлого, кода работа не касается; владелец велел брать эпик RT-2228 в работу сразу, а его ветка стоит на этой проверке.

## Task footprint

| What  | Where                                   |
| ----- | --------------------------------------- |
| Specs | none                                    |
| Laws  | none                                    |
| Rules | `.claude/skills/archive-record/` — read |
| Code  | `docs/archive/` — records over the term |

## What counts as done

- `node tools/check-archive-age.mjs` is green on the branch, and main takes the branch.

## Stages

### 1. The records over the term leave the tree

- **What is done:** `node tools/archive-prune.mjs --apply` removes every record the command names; the removal is committed.
- **Readiness sign:** the age check names no divergence.
- **Verified by:** `node tools/check-archive-age.mjs` — exit code 0, no line `divergences`.

## What this work does not do

- Nothing else: the epic RT-2228 waits for this branch to reach main.
