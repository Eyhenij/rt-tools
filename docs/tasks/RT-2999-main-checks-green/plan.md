# План

**Task:** RT-2999 · **Branch:** RT-2999-main-checks-green
**Behaviour:** unchanged — правятся тест, таблицы входов в описаниях витрины, объём стилей вкладок без смены вида, имя константы и шаблоны историй. Владелец: «заведи задачу на исправление всех ошибок в текущем main».

## След задачи

| Что     | Где                                                                                          |
| ------- | -------------------------------------------------------------------------------------------- |
| Спеки   | `docs/specs/ui-kit-v2/`                                                                      |
| Законы  | `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                     |
| Правила | `.claude/skills/testing/`, `.claude/skills/reuse-first/`, `.claude/skills/rt-tools-styling/` |
| Код     | `projects/ui-kit-v2/`                                                                        |

## Что считается сделанным

- На ветке зелёные `pnpm exec nx run-many -t lint typecheck test build verify --all` и
  `pnpm run lint:styles`.
- Набор перед отправкой (`rt_push_checks`) проходит целиком, push не отказан.
- CI на PR проходит без пропущенных шагов.

## Этапы

### 1. Типы теста чата и дубль константы

- **Steps:**
    1. Исправить четыре ошибки типов в `rt-chat.component.spec.ts`
    2. Переименовать `DAY_MS` чата в имя, которым кит уже называет длину суток
- **Readiness sign:** typecheck второго кита без ошибок, `check-dupes` без расхождений.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — выход 0; `node tools/check-dupes.mjs` — выход 0.

### 2. Таблицы входов и шаблоны историй

- **Steps:**
    1. Описать пять входов в таблицах «Входы» описаний витрины
    2. Вынести шаблоны двух компонентов историй чата в свои `.html`
- **Readiness sign:** verify второго кита зелёный, `check-reuse` без расхождений.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:verify` — выход 0; `node tools/check-reuse.mjs` — выход 0.

### 3. Бюджет стилей вкладок

- **Steps:**
    1. Уменьшить собранные стили `rt-tabs.component.scss` ниже 8 kB без смены вида
    2. Собрать три приложения
- **Readiness sign:** сборки приложений без ошибки бюджета, кадры вкладок совпадают с эталонами.
- **Verified by:** `pnpm exec nx run-many -t build -p auth-example-admin message-bus-admin chat-talks-page` — выход 0.

### 4. Полный набор

- **Steps:**
    1. Прогнать весь набор nx и stylelint
    2. Прогнать набор перед отправкой
- **Readiness sign:** всё зелёное.
- **Verified by:** `pnpm run check:all` — выход 0.

## Чего эта работа не делает

- Не включает защиту ветки main в настройках репозитория — это решение владельца.
- Не трогает предупреждения бюджета (4 kB) у других компонентов: они не роняют сборку.
