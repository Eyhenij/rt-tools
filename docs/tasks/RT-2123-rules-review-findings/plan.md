# Plan

**Task:** RT-2123 · **Branch:** RT-2123-rules-review-findings
**Behaviour:** unchanged — владелец: правки текстов правил дерева, кода приложений нет

## Task footprint

| What  | Where                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rules | `.claude/skills/dependencies/implementation.md`, `.claude/skills/ui-component-tests-visual/SKILL.md`, `.claude/rt-kit/overrides/pitfalls/task-flow.md` |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/work-conduct.md`                                                                                   |

## What counts as done

- Четыре находки дерева из RT-2123 применены: границы вне peer-диапазонов, вшитое число
  переопределений убрано, визуальные проверки в «What this is checked by», две ловушки
  визуальных проверок, ловушка о `task:new --slug`, строка о PR dependabot.
- Проверки документов, глоссария и веса зелёные; раскладка сходится с пакетом.

## Stages

### 1. Файл привязок правила зависимостей

- **What is done:** число переопределений заменено способом его спросить; раздел о границах,
  которых не объявляет ни один peer-диапазон; визуальные проверки в «What this is checked by»;
  строка о PR dependabot, перекрытом задачей.
- **Readiness sign:** проверки документов и глоссария без расхождений.
- **Verified by:** `npm run check:docs` — `no divergences`; `node tools/check-glossary.mjs` —
  `no divergences`.

### 2. Ловушки визуальных проверок и ведения работы

- **What is done:** две ловушки в «Traps» паттерна `ui-component-tests-visual`; ловушка о
  `task:new --slug` в надстройке ловушек `task-flow` — дописана в конец раздела.
- **Readiness sign:** раскладка сходится, вес файлов в пределе.
- **Verified by:** `pnpm run agent-kit:check` — `сходится`; `node tools/check-file-size.mjs` —
  `no new ones`.

### 3. Разбор папки

- **What is done:** папка задачи в архив; четыре предложения в пакет названы в записи как
  ждущие слова владельца.
- **Readiness sign:** проверка документов зелёная.
- **Verified by:** `npm run check:docs` — `no divergences`.

## What this work does not do

- Не отправляет четыре предложения в пакет: они ждут слова владельца в карточке.
