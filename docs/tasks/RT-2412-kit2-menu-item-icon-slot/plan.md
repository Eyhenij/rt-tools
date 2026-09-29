# План

**Задача:** RT-2412 · **Ветка:** RT-2412-kit2-menu-item-icon-slot
**Spec:** `projects/ui-kit-v2/src/lib/components/menu/CONTEXT.md`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа уходит в ход работ решением по пути.

## След задачи

| Что        | Где                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Описание   | `projects/ui-kit-v2/src/lib/components/menu/CONTEXT.md`, `projects/ui-kit-v2/src/lib/components/menu/Overview.mdx` |
| План эпика | `docs/plans/one-kit-part-2.md`                                                                                     |
| Правила    | `.claude/skills/component-structure/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-styling/`    |
| Код        | `projects/ui-kit-v2/src/lib/components/menu/`                                                                      |

## Что считается сделанным

- Значок из `<ng-template rtMenuItemIcon>` рисуется на месте значка пункта его размером и цветом
  тона, в том числе у опасного пункта и пункта-согласия.
- `icon` и `glyph` работают как раньше.
- `glyph` без пары и без своего значка в режиме разработки пишет предупреждение в консоль.

## Этапы

### 1. Свой значок пункта

- **Steps:**
    1. Директива `rtMenuItemIcon` и место значка в пункте
    2. Размер и цвет своего значка
    3. Предупреждение о значке Material без пары
    4. Тесты своего значка и предупреждения
- **Readiness sign:** тесты меню зелёные, среди них свой значок, тон и предупреждение.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=menu` — «Tests:» без failed.

### 2. Описание и витрина

- **Steps:**
    1. Описать директиву в `CONTEXT.md` и `Overview.mdx` меню
    2. Снять кадр своего значка на витрине
- **Readiness sign:** описание сходится с компонентом, кадр просмотрен.
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — «no divergences».

### 3. Сдача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** ветка на GitHub, PR открыт.
- **Verified by:** `gh pr view --json state` — «OPEN».

## Чего эта работа не делает

- Своя карта соответствий имён Material через провайдер приложения.
- Шаблон всего содержимого пункта.
