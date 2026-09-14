# Plan

**Task:** RT-2086 · **Branch:** RT-2086-archive-prune
**Behaviour:** unchanged — removal of expired archive records, no application code. Подтверждено владельцем: «актуализируй состояние всех задач».

## Task footprint

| What  | Where                            |
| ----- | -------------------------------- |
| Rules | `.claude/skills/archive-record/` |
| Code  | `docs/archive/`                  |

## What counts as done

- `node tools/check-archive-age.mjs` prints `divergences 0`.

## Stages

### 1. Expired records removed

- **What is done:** `node tools/archive-prune.mjs --apply` run; the seven records leave the tree.
- **Readiness sign:** the age check is green.
- **Verified by:** `node tools/check-archive-age.mjs` — the line `check-archive-age: divergences 0`.

## What this work does not do

- Does not touch records younger than the term.
- Does not change the term or the grace: they are the owner's numbers in the checks config.
