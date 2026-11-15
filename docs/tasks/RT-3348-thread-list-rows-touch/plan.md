# Plan

**Task:** RT-3348 · **Branch:** RT-3348-thread-list-rows-touch
**Draft:** `docs/specs/ui-kit-v2/proposed/thread-list-rows-touch/`
**Behaviour:** changes

## Points

- **A:** в списке разговоров вида `messenger` на телефоне тень знака строки срезана краем
  прокрутки, а после касания строка остаётся серой, будто выбрана.
- **This task reaches:** на телефоне тень знака у́же и видна целиком у каждой строки; касание не
  оставляет серого фона, выбранная строка — со своим фоном.
- **Sign:** история витрины Organisms/Chat/ThreadList при 375 px и спека собранного CSS; в
  приложении — его сквозной тест после выпуска версии.
- **Milestone G of the epic:** работа вне эпика.
- **Metric:** нет: сломан вид строк списка на телефоне.

## Task footprint

| What  | Where                                                |
| ----- | ---------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                              |
| Laws  | `docs/constitution/mockups.md`                       |
| Rules | `.claude/skills/kit-approval/`                       |
| Code  | `projects/ui-kit-v2/src/lib/components/thread-list/` |
| Code  | `projects/ui-kit-v2/src/styles/`                     |

## What counts as done

- До 768 по месту тень знака строки вида `messenger` размывается на 10; шире — прежние 24.
- Фон наведения строки стоит только под `@media (hover: hover)`; `--active` не меняется.
- Витрина совпадает с одобренным кадром, оба одобрения записаны, PR открыт и влит в main.

## Stages

### 1. Договорённость и макет

- **Steps:**
    1. Записать договорённость в docs/specs/ui-kit-v2/proposed/thread-list-rows-touch
    2. Получить одобрение макета владельцем
- **Readiness sign:** договорённость лежит, цитата одобрения макета в approvals.md.
- **Verified by:** `node tools/check-kit-approval.mjs` — строка макета найдена.

### 2. Код и спека

- **Steps:**
    1. Завести ступень тени знака в строке узкого списка
    2. Править стили списка: тень знака на узком месте и фон наведения под запросом наведения
    3. Добавить сценарии в спеку собранного CSS
    4. Добавить историю витрины: список `messenger` со знаками в узком окне
- **Readiness sign:** спека зелёная, линтер стилей и проверка ступеней чистые.
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/thread-list` — все наборы проходят.

### 3. Сверка и сдача

- **Steps:**
    1. Сравнить витрину с кадром числами и наложением
    2. Получить одобрение витрины владельцем
    3. Влить договорённость в спеку, разобрать папку, открыть PR
- **Readiness sign:** совпадение N из N, обе цитаты в записи, PR открыт.
- **Verified by:** `node tools/kit-match.mjs numbers <figma.json> <showcase.json>` — N из N.

## What this work does not do

- Выпуск версии кита — его делает приложение.
- Тень знака в виде `default` (знак `xs`, тень 16): заказ только про `messenger`.
