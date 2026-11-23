# План

**Task:** RT-3531 · **Branch:** RT-3531-sheet-rows-close
**Spec:** `docs/specs/ui-kit-v2/popover-sheet/spec.md`
**Behaviour:** changes

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** у шторки кита на телефоне нет кнопки закрытия. Строки выбора в ней те же, что у поля на
  широком экране: у `rt-select` выбранная строка отмечена только фоном, у `rt-multiselect` мелкий
  чекбокс слева, описания у опции нет. Шторки, где человек печатает, открываются на часть высоты.
  Шторка с неприменённым выбором закрывается молча. Шторки `rt-date-picker`, `rt-date-range` и
  отборов `rt-page-bar` не держат прокрутку страницы и не закрываются по Escape.
- **Эта задача доводит до:** у каждой шторки кита слева в шапке кнопка «×», заголовок по центру, а
  справа — действие «Готово» или «Применить», когда оно у шторки есть. Списки выбора в шторке —
  карточки с отметкой справа и необязательным описанием. Шторка, где печатают, занимает всю высоту.
  Шторка с неприменённым выбором перед закрытием спрашивает.
- **Признак:** истории шторки в витрине на ширине 375; владелец одобрил макет и витрину.
- **Веха G эпика:** обе правки эпика влиты в главную ветку и готовы к выпуску кита.
- **Metric:** нет: это новая возможность кита, а не починка правила.

## След задачи

| Что   | Где                                                                                           |
| ----- | --------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/popover-sheet/`, `docs/specs/ui-kit-v2/select/`, `docs/specs/ui-kit-v2/date-panel/`, `docs/specs/ui-kit-v2/date-range/`, `docs/specs/ui-kit-v2/page-header-vertical/` |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/component-structure/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/`: `bottom-sheet/`, `popover/`, `select/`, `multiselect/`, `autocomplete/`, `dynamic-selector/`, `table/filter-header/`, `menu/`, `tabs/`, `checkbox/`, `radio-button/`, `date-picker/`, `date-range/`, `page-header/bar/`, `thread-list/`; `projects/ui-kit-v2/src/lib/options/`; подписи кита; `projects/ui-kit-v2/CHANGELOG.md` |

## Как идёт работа

Видимая правка кита: сначала макет в Figma и одобрение владельца, затем спека со сценариями, код,
витрина, замер совпадения и второе одобрение. Ширина телефона в макете и в витрине — 375.

### Решения владельца 23.11.2026

- Закрытие шторки с неприменённым выбором: «Спрашивает».
- Шапка: «крестик (отменить) слева, применить (готово) справа, это базовый вид но возможны варианты
  с подвалом и доп кнопками».
- Карточки: «Да, всем спискам выбора».
- Список с одним полем поиска: «Во всю высоту».

### Оболочка шторки `rt-bottom-sheet`

- Слева в шапке круглая кнопка «×», заголовок по центру, ручка остаётся над шапкой. Кнопка есть у
  каждой шторки, в том числе у шторок `rt-menu` и меню вкладок, которые собирают шторку своей
  логикой, и у шторок даты, у которых шапки сегодня нет.
- Справа в шапке — действие шторки, когда оно есть: «Готово» у выбора нескольких значений,
  «Применить» у отборов. Подвал с кнопками остаётся вариантом: приложение кладёт в него свои
  кнопки, как сегодня.
- Вход «во всю высоту»: панель занимает экран целиком, верхние углы скруглены. Высота считается от
  видимой области, чтобы экранная клавиатура не закрывала шапку.
- Шторка сама держит прокрутку страницы и закрывается по Escape. Сегодня это делает только мост
  панели выбора; дважды блокировка и Escape не срабатывают.
- При `prefers-reduced-motion` шторка появляется без выезда. Владелец об этом не просил; правка в
  одно правило стилей, PR её называет.

### Вопрос перед закрытием

- Шторка, у которой выбор уходит в приложение только по кнопке, перед закрытием по «×», свайпу,
  подложке или Escape спрашивает: «Применить», «Не применять», «Отмена». Без изменений закрывается
  сразу.
- Таких шторок две: `rt-dynamic-selector` с отметками до кнопки применения и отборы `rt-page-bar`
  с кнопкой «Применить». У отборов изменением считается любой ввод внутри шторки после открытия.
- Остальные шторки закрываются без вопроса: выбор в них пишется сразу, а набранное в поиске — не
  данные.

### Строки выбора

- В шторке списки выбора рисуют строки карточками: название и описание слева, справа кружок (один
  вариант) или отметка нескольких вариантов. Выбранная отметка залита. Форму отметки нескольких
  вариантов показывает макет.
- Списки: `rt-select`, `rt-multiselect`, `rt-dynamic-selector`, подсказки `rt-autocomplete`, вид
  сравнения `rt-table-filter-header`. Свёрнутая `rt-toggle-button-group` рисуется селектом и
  получает карточки вместе с ним.
- У опции появляется необязательное описание. У `rt-checkbox` — вход описания и вид карточки, как
  уже есть у `rt-radio-button`.
- Вид включён в шторке всегда; один вход компонента возвращает прежние строки.
- Мультиселект вида `toggles` сохраняет переключатель справа и получает карточку.
- Строки действий (`rt-menu-item`) не меняются: это действие, а не выбор.

### Каждая шторка по правилам видео

| Шторка                                                         | Что в ней делают  | Высота | Справа в шапке | Вопрос |
| -------------------------------------------------------------- | ----------------- | ------ | -------------- | ------ |
| `rt-select` без поиска                                         | выбор касанием    | часть  | —              | нет    |
| `rt-multiselect` без поиска                                    | выбор касанием    | часть  | «Готово»       | нет    |
| `rt-select`, `rt-multiselect` с поиском (`filter`)             | печатают          | вся    | как без поиска | нет    |
| `rt-autocomplete`                                              | печатают          | вся    | —              | нет    |
| `rt-dynamic-selector`                                          | печатают в поиске | вся    | «Применить»    | да     |
| свёрнутая `rt-toggle-button-group`                             | выбор касанием    | часть  | как у селекта  | нет    |
| `rt-menu`, `rt-split-button`, `rt-speed-menu`, `rt-action-bar` | действие касанием | часть  | —              | нет    |
| меню `rt-tabs` и `rt-page-header`                              | действие касанием | часть  | —              | нет    |
| `rt-color-palette`                                             | выбор касанием    | часть  | —              | нет    |
| вид сравнения `rt-table-filter-header`                         | выбор касанием    | часть  | —              | нет    |
| `rt-date-picker`, `rt-date-range`                              | выбор касанием    | часть  | —              | нет    |
| отборы `rt-page-bar`                                           | поиск и поля      | вся    | «Применить»    | да     |
| отборы `rt-thread-list`                                        | поля приложения   | вся    | —              | нет    |

### Кадры макета

Шапка с «×» и заголовком; шапка с действием справа; шторка без заголовка; список одного варианта
карточками — обычная, выбранная, выключенная, с описанием и без; список нескольких вариантов; вид
`toggles`; список с поиском во всю высоту; отборы во всю высоту с «Применить»; вопрос перед
закрытием; меню действий; шторка даты. Вместе с кадрами владелец видит таблицу выше.

## Что считается сделанным

- У каждой шторки из таблицы на телефоне есть кнопка «×»; она закрывает шторку и возвращает фокус.
- У шторок со значением в столбце «Справа в шапке» стоит это действие.
- Списки выбора в шторке — карточки с отметкой справа; описание опции показано второй строкой; вход
  возвращает прежний вид.
- Шторки из строк «вся» открываются во всю высоту на ширине 375.
- Шторки из строк «да» спрашивают перед закрытием с неприменённым выбором и молчат без него.
- Шторки даты и отборов страницы держат прокрутку страницы и закрываются по Escape.
- У поля на широком экране строки не изменились: прежние снимки витрины зелёные.
- Владелец одобрил макет и витрину; числа витрины совпали с макетом.

## Этапы

### 1. Макет

- **Steps:**
    1. Кадры шторки нарисованы в Figma и одобрены владельцем
       Check: `sh -c 'grep -c "^- \*\*Макет:\*\*" docs/tasks/RT-3531-sheet-rows-close/approvals.md 2>/dev/null || true'` → >= 1
- **Readiness sign:** в записи одобрений стоит строка «Макет» со словами владельца и ссылкой на кадр.
- **Verified by:** `grep "Макет" docs/tasks/RT-3531-sheet-rows-close/approvals.md` — строка с цитатой.

### 2. Спека и сценарии

- **Steps:**
    1. Спека шторки говорит о кнопке закрытия, действии в шапке, карточках, полной высоте и вопросе, сценарии пронумерованы
       Check: `sh -c 'S=docs/specs/ui-kit-v2/popover-sheet; grep -q "close button" $S/spec.md && grep -q "full height" $S/spec.md && grep -q "close button" $S/scenarios.md && echo green || echo red'` → `green`
- **Readiness sign:** правило «вид строк не меняется» снято, новые правила и сценарии записаны.
- **Verified by:** `grep -c "close button" docs/specs/ui-kit-v2/popover-sheet/scenarios.md` — не ноль.

### 3. Оболочка шторки

- **Steps:**
    1. У шторки кнопка закрытия, действие справа, полная высота, блокировка прокрутки, Escape и появление без выезда
       Check: `sh -c 'C=projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component; grep -q bottom-sheet-close $C.html && grep -q bottom-sheet-close $C.spec.ts && grep -q fullHeight $C.spec.ts && grep -q Escape $C.spec.ts || { echo red; exit 0; }; pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=bottom-sheet >/dev/null 2>&1 && echo green || echo red'` → `green`
    2. Шторка с неприменённым выбором спрашивает перед закрытием
       Check: `sh -c 'test -f projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-unsaved.spec.ts || { echo red; exit 0; }; pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=bottom-sheet-unsaved >/dev/null 2>&1 && echo green || echo red'` → `green`
- **Readiness sign:** тесты шторки зелёные, в них сценарии кнопки, фокуса, полной высоты, Escape и вопроса.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=bottom-sheet` — без падений.

### 4. Строки выбора

- **Steps:**
    1. У опции есть описание, у чекбокса — описание и вид карточки
       Check: `sh -c 'L=projects/ui-kit-v2/src/lib; grep -q description $L/components/checkbox/rt-checkbox.component.ts && grep -q description $L/components/checkbox/rt-checkbox.component.spec.ts && grep -q description $L/options/rt-option-tree.model.ts || { echo red; exit 0; }; pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=checkbox >/dev/null 2>&1 && echo green || echo red'` → `green`
    2. Пять списков выбора рисуют в шторке карточки, вход возвращает прежние строки
       Check: `sh -c 'C=projects/ui-kit-v2/src/lib/components; n=$(grep -l sheetCards $C/select/rt-select-sheet.spec.ts $C/multiselect/rt-multiselect-sheet.spec.ts $C/dynamic-selector/rt-dynamic-selector-sheet.spec.ts $C/autocomplete/rt-autocomplete-sheet.spec.ts $C/table/filter-header/rt-table-filter-header.component.spec.ts 2>/dev/null | wc -l); [ "$n" -eq 5 ] || { echo red; exit 0; }; pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=sheet --testFile=filter-header >/dev/null 2>&1 && echo green || echo red'` → `green`
- **Readiness sign:** в тестах пяти списков есть сценарии карточек и входа, тесты зелёные.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=sheet` — без падений.

### 5. Высота и шапка по случаям

- **Steps:**
    1. Шторки из таблицы открываются с её высотой и действием; шторки даты и отборов идут через общую оболочку
       Check: `sh -c 'C=projects/ui-kit-v2/src/lib/components; n=$(grep -lE "fullHeight|rtPopoverSheetFull" $C/select/rt-select.component.html $C/multiselect/rt-multiselect.component.html $C/autocomplete/rt-autocomplete.component.html $C/dynamic-selector/rt-dynamic-selector.component.html $C/thread-list/rt-thread-list.component.html $C/page-header/bar/rt-page-bar.component.html 2>/dev/null | wc -l); [ "$n" -eq 6 ] || { echo red; exit 0; }; grep -q Escape $C/date-picker/rt-date-picker.component.spec.ts && grep -q Escape $C/page-header/bar/rt-page-bar.component.spec.ts || { echo red; exit 0; }; pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 >/dev/null 2>&1 && echo green || echo red'` → `green`
- **Readiness sign:** все тесты кита зелёные, у даты и отборов есть сценарий Escape.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2` — без падений.

### 6. Витрина и тексты

- **Steps:**
    1. Истории шторки показывают каждое состояние, числа витрины совпали с макетом
       Check: `sh -c 'grep -c "^- \*\*Совпадение:\*\*" docs/tasks/RT-3531-sheet-rows-close/approvals.md 2>/dev/null || true'` → >= 1
    2. Прежние снимки витрины зелёные, новые сняты
       Check: `sh -c 'grep -q sheetCards projects/ui-kit-v2/src/lib/components/select/stories/select-sheet.stories.ts || { echo red; exit 0; }; pnpm run -s test:visual:v2 >/dev/null 2>&1 && echo green || echo red'` → `green`
    3. Витрина одобрена владельцем
       Check: `sh -c 'grep -c "^- \*\*Витрина:\*\*" docs/tasks/RT-3531-sheet-rows-close/approvals.md 2>/dev/null || true'` → >= 1
    4. Заметки компонентов и журнал изменений кита называют новые входы, проверка спек зелёная
       Check: `sh -c 'grep -q sheetCards projects/ui-kit-v2/CHANGELOG.md || { echo red; exit 0; }; node tools/check-specs.mjs >/dev/null 2>&1 && echo green || echo red'` → `green`
- **Readiness sign:** запись одобрений полна, снимки и проверка спек зелёные.
- **Verified by:** `node tools/check-specs.mjs` — без отказов; живая проверка в витрине на 6007 с замерами в ходе работы, полная высота под экранной клавиатурой — в эмуляции телефона.

## Что эта работа не делает

- `rt-aside` шторкой и вопрос у асайда с формой — задача RT-3532.
- Ловушка фокуса внутри шторки: её нет и сегодня, владелец о ней не просил.
- `rt-confirm`, `rt-tooltip`, `rt-dialog`, `rt-drawer` шторкой не становятся.
- Строки у поля на широком экране и строки действий меню не меняются.
- Выпуск кита — отдельное решение владельца.
