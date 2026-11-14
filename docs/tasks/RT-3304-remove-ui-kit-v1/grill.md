# Grill

## The owner request

> Сделай ревизию проверок хуков и гардов в проекте, нужно серьезно уменьшить количество времени
> которое уходит на отправку ветки в ремоут, по отчетам видно что реализация изменений занимает в
> 5 раз меньше времени чем пуш ветки в ремоут. Переключисьа свежий мейн в этом дереве, удали все
> прочие ветки и делай анализ, первым делом нужно полностью удалить ui kit v1 и связанный код и
> проверки, на это уже была заведена задача на доске - найди ее

The epic card RT-3232 carries the earlier words of 12.11.2026:

> удали полностью первый кит и весь связанный код

On the order: «После эпика RT-3227» (merged). On the npm package: «Пометить устаревшим».

## What the tree already has

- `projects/ui-kit` — 490 files; no package or application imports `@rt-tools/ui-kit`.
- `docs/specs/ui-kit` — 15 files.
- 83 files outside the kit name it: build configs, two workflows, version scripts, linters, tools
  and their scenarios, the tree profile, rules of this tree, texts.
- The push set holds `node tools/visual-gate.mjs ui-kit`: the first kit's showcase snapshots.

## Questions and answers

**Into how many tasks is the removal split?**
The menu was refused by the grill gate as already answered by the owner's order; the recommended
option is taken: one task, one push.

## Decisions

- **One task** — the removal is whole, and every extra branch is one more push of the full set.
  Rejected: two tasks (code, then texts) — twice the push cost for no gain in review.
- **The npm deprecation is not run** — the owner runs it or gives a separate word for it.

## What is left unclear

- Nothing blocks the work.
