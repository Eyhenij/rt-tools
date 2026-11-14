# Plan

**Task:** RT-3315 · **Branch:** RT-3315-setting-tile
**Spec:** `docs/specs/ui-kit-v2/form-dictionary/spec.md`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Points

- **A:** плитка настройки в форме кита нажимается только по выключателю; название и пояснение
  одного размера, 14.
- **This task reaches:** в панели админки плитка с выключателем нажимается целиком и
  подсвечивается при наведении; название 16, пояснение 12 — как в кадре `Setting Tile`.
- **Sign:** история витрины `Foundation/Design Tokens/Form Dictionary` — плитка в четырёх
  состояниях и в узкой ширине; строка совпадения `node tools/kit-match.mjs numbers` N из N;
  владелец видит её на показе и в админке после подъёма версии.
- **Milestone G of the epic:** вне эпика, по слову владельца, переданному сессией приложения.
- **Metric:** нет: правка вида по макету.

## Task footprint

| What  | Where                                                                                                                                   |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/form-dictionary/`                                                                                                 |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md`                                                             |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/styles/_form.scss`, `projects/ui-kit-v2/src/showcase/stories/`                                                  |

## What counts as done

- `<label>` записи в рамке показывает указатель, фон `bg-hover` при наведении и рамку фокуса при
  фокусе клавиатурой на выключателе; запись на `div` указателя и фона не получает.
- Название записи в рамке — 16, medium, высота строки 1.5; пояснение — 12, muted, 1.5.
- `span` с `rtElem="label"` рисуется как `label`.
- История витрины показывает плитку вкл/выкл × покой/наведение и в узкой ширине.
- Совпадение с кадрами `Setting Tile` — N из N чисел, наложение без расхождений геометрии.
- Владелец ответил «одобряю» по витрине; PR влит; `@rt-tools/ui-kit-v2` выпущен patch.

## Stages

### 1. Стили плитки

- **Steps:**
    1. Правило нажимаемой записи `label` в `_form.scss`: указатель, наведение, фокус, скругление
    2. Типографика записи в рамке: название 16, пояснение 12
    3. Строка нажимаемой записи не переносится, название сжимается
    4. Проверки собранного CSS в `rt-form.styles.spec.ts`
    5. Правила и сценарии в описании `form-dictionary`
- **Readiness sign:** спека стилей словаря зелёная вместе с новыми проверками.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/styles/rt-form.styles.spec.ts` — `Tests: … passed`, ни одного failed

### 2. История витрины

- **Steps:**
    1. Плитка в обвязке истории словаря: четыре состояния и узкая ширина
    2. Эталонные снимки истории пересняты
- **Readiness sign:** история открывается в витрине, снимок совпадает с эталоном.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/showcase` — истории без ошибок

### 3. Сверка с макетом и показ

- **Steps:**
    1. Числа кадров `Setting Tile` и витрины в два файла JSON
    2. Сверка чисел и наложение кадров
    3. Показ витрины владельцу и запись одобрения
- **Readiness sign:** строка совпадения N из N, одобрение витрины записано в approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — ни одной недостающей строки

### 4. Поставка и выпуск

- **Steps:**
    1. Папка задачи разобрана в запись архива
    2. Push, PR в main, слияние владельцем
    3. Выпуск `@rt-tools/ui-kit-v2` patch
- **Readiness sign:** версия patch опубликована в реестре.
- **Verified by:** `npm view @rt-tools/ui-kit-v2 version` — номер новой версии

## What this work does not do

- Перевод разметки плитки в админке на `<label>` и подъём версии кита — сессия приложения после
  выпуска.
- Типографика значений `control-sub-item--value` в записях рамки — поручение её не называет.
