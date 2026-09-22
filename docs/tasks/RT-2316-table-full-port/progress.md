# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 из 5 — Таблица `rt-data-table`
- **Done:** задача заведена и привязана к эпику 1870; слово владельца и сверка лежат в
  `grill.md`. Первая запись договорённости (SC-UKV-236…275) описывала добавки к `rt-table`, а
  владелец 22 сентября сказал другое: таблица первого кита — отдельный компонент рядом, с видом
  первого кита, без карточек, со своими историями; и сначала переносится то, на чём она стоит.
  Радиокнопка, на которой стоит выбор строки, сделана задачей RT-2317 — запрос #2318 ждёт слияния;
  эта ветка стоит на её ветке и сливается после неё.
  Договорённость переписана под отдельное семейство — `rt-data-table` и `rt-data-list`,
  сценарии SC-UKV-236…275 и 300…322. Главная влита по цепочке: эпик, радиокнопка, эта ветка.
  Этап 1 закрыт: модель колонок и настроек поле в поле с первым китом, хранение настроек под
  ключом и в форме первого кита, директивы нажатия строки — 9 из 9 тестов, линтер и типы чистые.
- **Next step:** этап 2 — готовая ячейка по виду колонки, кнопка копирования, значки набором кита и шаблоном `rtDataTableIcon`.
- **Uncommitted:** ничего.
- **Waiting for the owner:** нет.
- **PR:** not open yet

## Steps

- [x] 1.1 Column model, settings model and the first kit's field set carried over as declared
- [x] 1.2 Settings storage under the first kit's key and shape, with its spec
- [x] 1.3 Row press and "ignore row press" directives with their spec
- [>] 2.1 Ready cell by column type, the copy button and the icons through the kit's map
- [ ] 2.2 Header cell with sorting and the header icon
- [ ] 2.3 Filter cell with the operator menu on the kit's input, select and date picker
- [ ] 2.4 The table: rows, actions area, single choice by `rt-radio-button`, multiple by `rt-checkbox`
- [ ] 2.5 Spec of the table on its scenarios
- [ ] 3.1 Toolbar with search, clear-filters and refresh, and the application's selectors
- [ ] 3.2 Own pagination bar ported from the first kit
- [ ] 3.3 Own column settings panel ported from the first kit
- [ ] 3.4 Selection across pages, the empty placeholder and the loading look
- [ ] 3.5 Words of both families in the kit's eight-language dictionary
- [ ] 3.6 Spec of the list on its scenarios
- [ ] 4.1 Stories and `Overview` of `rt-data-table` by the coverage contract
- [ ] 4.2 Stories and `Overview` of `rt-data-list` by the coverage contract
- [ ] 4.3 Sweep over the stories and a look at the frames by eye
- [ ] 4.4 Frames in the image and a second run in a row
- [ ] 5.1 The agreement merged into the kit spec
- [ ] 5.2 The gate before the push and the push of the branch
- [ ] 5.3 The stories shown to the owner

## Decisions along the way

- **Имена `rt-data-table` и `rt-data-list`; странности первого кита копируются как есть и
  обсуждаются потом; приложение переезжает без правок — те же поля колонок и сохранённые
  настройки; пагинация и панель настроек — свои, из первого кита.** Слово владельца 22 сентября.
  Affected stage of the plan: все.
- **Ветка стоит на ветке радиокнопки RT-2317.** Таблица берёт `rt-radio-button`, а та ещё не
  влита в ветку эпика; запрос этой ветки откроется в ветку RT-2317. Affected stage of the plan: все.
- **Переносятся все восемь пунктов сверки** — слово владельца «весь функционал». Affected stage of
  the plan: все.

## Sessions

### 2026-09-22

- Сверка таблиц первого и второго кита: во втором нет восьми возможностей, у трёх историй первого
  кита нет пары.
- Задача RT-2316 заведена, строка 7.9 плана эпика.
