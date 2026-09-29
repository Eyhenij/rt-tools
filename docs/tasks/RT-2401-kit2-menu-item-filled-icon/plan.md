# План

**Задача:** RT-2401 · **Ветка:** RT-2401-kit2-menu-item-filled-icon
**Spec:** `projects/ui-kit-v2/src/lib/components/menu/CONTEXT.md`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа уходит в ход работ решением по пути.

## След задачи

| Что      | Где                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Описание | `projects/ui-kit-v2/src/lib/components/menu/CONTEXT.md`, `projects/ui-kit-v2/src/lib/components/menu/Overview.mdx` |
| Правила  | `.claude/skills/component-structure/`, `.claude/skills/ui-component-tests/`                                        |
| Код      | `projects/ui-kit-v2/src/lib/components/menu/`                                                                      |

## Что считается сделанным

- Пункт с `fill` передаёт заливку значку, и под материальным набором значок залитый.
- Без `fill` значок пункта контурный, как раньше.
- В витрине меню есть кадр с залитыми значками.

## Этапы

### 1. Заливка значка пункта

- **Steps:**
    1. Вход `fill` у пункта меню
    2. Тесты заливки значка пункта
- **Readiness sign:** тесты меню зелёные, среди них заливка и её отсутствие.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=menu` — «Tests:» без failed.

### 2. Описание и витрина

- **Steps:**
    1. Описать вход в `CONTEXT.md` и `Overview.mdx` меню
    2. Снять кадр залитых значков на витрине
- **Readiness sign:** описание входов сходится с компонентом, кадр просмотрен.
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — «no divergences».

### 3. Сдача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** ветка на GitHub, PR открыт.
- **Verified by:** `gh pr view --json state` — «OPEN».

## Чего эта работа не делает

- Заливка для всего меню одной настройкой.
