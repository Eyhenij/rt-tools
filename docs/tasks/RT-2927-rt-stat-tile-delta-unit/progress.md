# Progress

## Where we stand

- **State:** `договорённость-записана`
- **Stage:** 0 — the plan is not written yet
- **Done:** the task is taken, the branch stands on RT-3041, the grill is closed with the owner's
  answers; the mockup is compared with the application's analytics mockups and fixed; the product
  agreement lies in `docs/specs/ui-kit-v2/proposed/stat-tile-delta-unit/`
- **Next step:** after the owner's word on the mockup — the plan
- **Uncommitted:** nothing
- **Waiting for the owner:** the approval of the mockup on the Stat Tile page of the second kit file:
  the variant property Growth=better|worse, six report tiles (points, zero points and «growth is
  worse»), two dark tiles
- **PR:** not open yet

## Decisions along the way

- **The branch is taken from RT-3041, not from the main branch** — the owner's mail in the signature
  list and the guard fix live there until it merges; from the main branch every commit of this task
  is refused.

## Sessions

### 2026-11-02

- The tile and the application's copy of it are read; four answers of the owner are in the grill.

### 2026-11-03

- The kit mockup is compared with the block «Примеры разницы» of the application's analytics
  mockups. Percent in the kit mockup is now written with a space, as the kit code writes it; a
  zero-points tile is added.
- The product agreement is written: scenarios SC-UKV-1125…1132.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2927-rt-stat-tile-delta-unit

### Where we stand at the minute of the compaction

- **State:** `разбор-закрыт`
- **Stage:** 0 — the plan is not written yet
- **Next step:** after the owner's word on the mockup — the product agreement and the plan
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2927-rt-stat-tile-delta-unit/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
ad9d494f1 docs: макет плитки RT-2927 ждёт слова владельца
4bffa468e docs: разбор RT-2927 — единица разницы и признак «рост хуже» у плитки
27c69ab0a docs(rt:agent-kit): сценарии заведения ветки укладываются в предел длины файла
b65558967 docs: папка RT-3041 разобрана в запись архива
861468d41 chore: адрес владельца в списке людей, подписывающих коммиты
37dd58795 fix(rt:agent-kit): заведение ветки принимает подпись человека из RT_HUMAN_EMAILS
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
