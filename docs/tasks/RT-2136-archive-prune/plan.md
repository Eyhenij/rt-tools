# Plan

**Task:** RT-2136 · **Branch:** RT-2136-archive-prune
**Behaviour:** unchanged — правило doc-style: удаление записей прошлого по сроку — работа со своей задачей, кода приложений нет

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Rules | `.claude/skills/doc-style/`, `.claude/skills/archive-record/` |
| Laws  | `docs/constitution/project-documentation.md`                  |
| Code  | `docs/archive/` — the overstayed records only                 |

## What counts as done

- `node tools/check-archive-age.mjs` exits zero on the branch.
- The removed records are exactly those the dry run named: twenty-three, none younger than the term.

## Stages

### 1. Remove the overstayed records

- **What is done:** `node tools/archive-prune.mjs --apply`, the removal committed.
- **Readiness sign:** the age check exits zero; the commit removes twenty-three files under
  `docs/archive/` and nothing else.
- **Verified by:** `node tools/check-archive-age.mjs; echo $?` — the last line is `0` (before the
  stage it is `1` with one record named). `git show --stat --format= HEAD | tail -1` — «23 files
  changed», all deletions.

## What this work does not do

- It does not change the term or the grace: those are the owner's numbers in the checks config.
- It does not touch the two open changes (RT-2130, RT-1896): each merges main in after this one
  lands, by its own author.
