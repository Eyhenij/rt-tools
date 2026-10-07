# Plan

**Task:** RT-2609 · **Branch:** RT-2609-side-menu-close-delay
**Spec:** `docs/specs/ui-kit/side-menu/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/ui-kit/side-menu/`                   |
| Rules | `.claude/skills/git-workflow/`                   |
| Code  | `projects/ui-kit/src/lib/ui-kit/side-menu/menu/` |

## What counts as done

- Уход указателя с панели закрывает незакреплённое подменю через `subMenuCloseDelay` (500 мс по умолчанию).
- Возврат на панель или наведение на пункт с разделами до истечения задержки закрытие отменяют.
- Подложка, переход и клавиатура закрывают сразу; закреплённое и удержанное подменю не меняются.
- SC-UK-144…147 зелёные, прежние тесты меню зелёные.
- Выпущена новая версия `@rt-tools/ui-kit`.

## Stages

### 1. Задержка закрытия

- **Steps:**
    1. Вход `subMenuCloseDelay` и отложенное закрытие в `rtui-side-menu`
    2. Сценарии SC-UK-144…147 и тесты на поддельных таймерах
    3. Правило в спеке бокового меню и карта реализации
- **Readiness sign:** тесты меню зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit --testPathPattern=side-menu` — все наборы `passed`

### 2. Поставка и выпуск

- **Steps:**
    1. PR в main и слияние
    2. Выпуск `@rt-tools/ui-kit` прогоном публикации
- **Readiness sign:** новая версия видна в реестре.
- **Verified by:** `npm view @rt-tools/ui-kit version` — номер новее 0.11.0
