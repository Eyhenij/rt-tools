# Plan

**Task:** RT-2994 · **Branch:** RT-2994-service-block-canon
**Behaviour:** unchanged — владелец одобрил макет панели по канону асайда 02.11.2026: «Одобряю». Правка возвращает подвал кита к раскладке, которая уже описана в спеке, и меняет только историю витрины.

## Task footprint

| What     | Where                                                                 |
| -------- | --------------------------------------------------------------------- |
| Specs    | `docs/specs/ui-kit-v2/`                                               |
| Laws     | `docs/constitution/entity-editing.md`, `docs/constitution/mockups.md` |
| Rules    | `.claude/skills/entity-aside/`, `.claude/skills/kit-approval/`        |
| Code     | `projects/ui-kit-v2/src/lib/components/aside/footer/`                 |
| Showcase | `projects/ui-kit-v2/src/lib/components/service-block/stories/`        |

## What counts as done

- У подвала кита нет раскладки `start`: «Закрыть» в рамке слева, «Сохранить» залитая справа.
- История панели подключения совпадает с одобренным кадром 7202:849: заголовок «Настройка
  подключения», надзаголовок «Оплата тарифов», «Закрыть и не сохранять» и «Сохранить» без значка.
- Кнопки подвала в витрине стоят в 24 от краёв панели при ширине 1440, 768 и 375.

## Stages

### 1. Подвал без раскладки start

- **Steps:**
    1. Убрать вход `layout` и тип `TRtAsideFooterLayout` из компонента подвала
    2. Убрать правила `--start` из стилей подвала
    3. Убрать случаи `start` из спеки компонента и матрицы витрины
    4. Убрать раскладку `start` из `CONTEXT.md` подвала
- **Readiness sign:** в пакете не осталось упоминаний раскладки, спека подвала зелёная.
- **Verified by:** `git grep -n "TRtAsideFooterLayout\|rt-aside-footer--start\|layout=\"start\"" -- projects` — пустой вывод (сейчас 8 строк).

### 2. История панели по макету

- **Steps:**
    1. Поменять заголовок и надзаголовок шапки в истории панели
    2. Подписать кнопку закрытия «Закрыть и не сохранять» и убрать значок у «Сохранить»
- **Readiness sign:** история не держит старых подписей.
- **Verified by:** `git grep -n "Закрыть без сохранения\|icon=\"check\"" -- projects/ui-kit-v2/src/lib/components/service-block` — пустой вывод (сейчас 4 строки вместе с заголовком).

### 3. Проверка витрины

- **Steps:**
    1. Прогнать спеку подвала и линтер пакета
    2. Измерить кнопки подвала истории панели в витрине на 1440, 768 и 375
    3. Переснять эталонные кадры историй подвала и панели
- **Readiness sign:** спека и линтер зелёные, замеры совпали с кадром.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/aside/footer/rt-aside-footer.component.spec.ts` — все тесты прошли.

## What this work does not do

- Девять находок первого разбора, кроме раскладки `start`, ждут ответа владельца в `grill.md`.
- Отступ подвала 48 → 24 для всех панелей остаётся, как было одобрено в первой задаче.
