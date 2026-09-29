# План

**Задача:** RT-2349 · **Ветка:** RT-2349-kit2-table-card-activate
**Spec:** `projects/ui-kit-v2/src/lib/components/table/CONTEXT.md`
**Behaviour:** changes

После записи этот файл не правится. Пересмотр этапа уходит в ход работ решением по пути.

## След задачи

| Что        | Где                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Описание   | `projects/ui-kit-v2/src/lib/components/table/CONTEXT.md`, `projects/ui-kit-v2/src/lib/components/table/Overview.mdx` |
| План эпика | `docs/plans/one-kit-part-2.md`                                                                                       |
| Правила    | `.claude/skills/component-structure/`, `.claude/skills/ui-component-tests/`, `.claude/skills/styling-bem/`           |
| Код        | `projects/ui-kit-v2/src/lib/components/table/`                                                                       |

## Что считается сделанным

- Нажатие на карточку и Enter на ней вызывают `(activated)` строки с тем же номером.
- При `clickable` у карточки курсор-рука и кольцо фокуса, она берёт фокус клавишей Tab.
- Нажатие по кнопке, ссылке, полю, `role="button"` или `role="switch"` внутри карточки открытием не считается.
- Находки разбора RT-2397 записаны рядом с планом эпика.

## Этапы

### 1. Находки разбора RT-2397

- **Steps:**
    1. Записать находки разбора в файл находок рядом с планом эпика
- **Readiness sign:** файл находок есть и проходит проверку путей.
- **Verified by:** `pnpm run check:docs` — строка «no divergences».

### 2. Нажатие на карточку

- **Steps:**
    1. Вынести признак «нажатие пришло из интерактивного узла» в чистую функцию и взять её в строке
    2. Передавать нажатие и Enter на карточке спрятанной строке с тем же номером
    3. Вид и фокус карточки при `clickable`
    4. Тесты функции и таблицы в режиме карточек
- **Readiness sign:** тесты таблицы зелёные, среди них нажатие, Enter и нажатие по кнопке внутри карточки.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=table` — «Tests:» без failed.

### 3. Описание и витрина

- **Steps:**
    1. Описать поведение в `CONTEXT.md` и `Overview.mdx` таблицы
    2. Снять кадр карточки с фокусом на витрине
- **Readiness sign:** описание входов сходится с компонентом, кадр просмотрен.
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — «no divergences».

### 4. Сдача

- **Steps:**
    1. Полный набор проверок перед отправкой
    2. Разбор папки задачи и PR в ветку эпика
- **Readiness sign:** ветка на GitHub, PR открыт.
- **Verified by:** `gh pr view --json state` — «OPEN».

## Чего эта работа не делает

- Отбор на узком экране — открытый вопрос описания таблицы, своя работа.
