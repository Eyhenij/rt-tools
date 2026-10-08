# План — RT-2694: обёртки витрины держат шаблон в своём .html

**Behaviour:** unchanged — шаблоны обёрток витрины переезжают в файлы без изменений; пакет и
приложения не меняются.

## След задачи

- восемь `test-*.component.ts` в `stories/component/` компонентов `ai-run-status`, `copy-value`,
  `prompt-suggestion`, `ai-chat` второго кита и восемь `.html` рядом с ними
- `docs/plans/cargo-shell-edits-prose.md` — строка задачи в составе эпика

## Этапы

### 1. Перенос

- 1.1 Шаблоны обёрток ai-run-status и copy-value в .html
- 1.2 Шаблоны обёрток prompt-suggestion и ai-chat в .html

Готово, когда `node tools/check-reuse.mjs` даёт 0 расхождений.

### 2. Проверка

- 2.1 Типы и сборка витрины второго кита

Готово, когда `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` и
`pnpm run build-storybook:ui-kit-v2` зелёные.

### 3. Сдача

- 3.1 Строка задачи в плане эпика, проверки перед push
- 3.2 Папка задачи разобрана, PR в ветку эпика
