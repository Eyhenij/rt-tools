# Grill

## The owner request

> Сделай ревизию проверок хуков и гардов в проекте, нужно серьезно уменьшить количество времени которое уходит на отправку ветки в ремоут ... первым делом нужно полностью удалить ui kit v1 и связанный код и проверки

14.11.2026, after the role `goal-critic` named what the first kit left behind:

> Вторая задача в эпике

> заведи задачу в эпике 3232 и добавь knip

## What the tree already has

Read on the epic branch `origin/RT-3232-remove-ui-kit-v1`.

- `tools/check-icon-map.mjs` checks the second kit's map of Material icon names,
  `projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts`. The map is a feature of the
  second kit: a consumer names an icon by its Material name, and the kit draws its own glyph. The
  check runs in CI, step «Icon map», and in the push set. Only its header comment calls the names
  "the first kit's".
- The preset `first-kit-theme` of the showcase is the violet Material preset of the second kit:
  `projects/ui-kit-v2/.storybook/preview.ts`, `projects/ui-kit-v2/src/styles/_preset-material.scss`.
  Five story files of the data list and the data table use it.
- `data-list-first-kit.stories.ts`, `test-data-list-first-kit.component.ts` with its template and
  four snapshots `*--first-kit-*.png` are stories of the second kit drawn in that preset.
- The specs `docs/specs/ui-kit-v2/table-full-port/`, `side-menu/`, `side-menu-options/` and
  `expansion-panel/` describe both features in the words "first-kit name" and "first-kit preset".
- `projects/agent-kit/assets/checks/signals/ui-kit.json` is a set of signs for the removed package.
  The package of rules still publishes it, and this tree drops it by `skip` in `.claude/rt-kit.json`.
- `tools/doc-paths-allowlist.json` holds the paths of removed files.

Most of what carries the words "first kit" is not code of the removed package. It is the second
kit's support for a consumer who moves from Material: icon names and a violet preset.

## What the rules already say

- A visible kit edit needs a mockup and the owner's approval first — the rule `kit-approval`.
  Removing a preset or a story changes the showcase.
- A scenario number is not reused, and a removed scenario takes its test with it — the rule
  `spec-driven`.

## Questions and answers

**Вторая задача в эпике или PR эпика сейчас?**
Вторая задача в эпике.

**Имена значков Material и фиолетовая тема — оставить под своими именами или удалить?**
Бери RT-3308, возможности оставить.

**Одобряете план RT-3308 (третья версия после двух кругов ролей)?**
Одобряю план RT-3308.

## Decisions

- **The Material icon names and the violet preset stay; the word "first kit" leaves their names**
  — the owner's word. Rejected: removing them — it breaks the applications that use them.
- **The move guides, the history notes and `tokens.coexist.css` stay** — the removed package is
  still published, and its users move by them; the owner approved the plan that names this.
- **knip enters no push set** — the owner's goal is a shorter push.

## What is left unclear

- Nothing blocks the work.
