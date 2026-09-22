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
  Этап 2: готовая ячейка, ячейка шапки и ячейка отбора сделаны — 31 из 31 теста семейства; в
  набор значков кита дорисован знак «равно» по слову владельца. Отметки покрытия в договорённости
  сняты у 19 сценариев, у которых тест уже есть: проверка покрытия отказывала на них.
  Этап 2 закрыт: таблица рисует шапку, строку отбора, готовые и пользовательские ячейки, колонку
  выбора и полосу действий — 51 из 51 теста семейства, проверки слога, слоёв и покрытия чистые.
  Панель действий списка сделана: поиск с задержкой в полсекунды, снятие отбора, обновление,
  настройка колонок, селекторы и действия приложения — 58 из 58 тестов обеих семей.
- **Next step:** этап 3 — своя пагинация, перенесённая из первого кита.
- **Uncommitted:** ничего.
- **Waiting for the owner:** нет.
- **PR:** not open yet

## Steps

- [x] 1.1 Column model, settings model and the first kit's field set carried over as declared
- [x] 1.2 Settings storage under the first kit's key and shape, with its spec
- [x] 1.3 Row press and "ignore row press" directives with their spec
- [x] 2.1 Ready cell by column type, the copy button and the icons through the kit's map
- [x] 2.2 Header cell with sorting and the header icon
- [x] 2.3 Filter cell with the operator menu on the kit's input, select and date picker
- [x] 2.4 The table: rows, actions area, single choice by `rt-radio-button`, multiple by `rt-checkbox`
- [x] 2.5 Spec of the table on its scenarios
- [x] 3.1 Toolbar with search, clear-filters and refresh, and the application's selectors
- [>] 3.2 Own pagination bar ported from the first kit
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
- **Значки из описания колонок рисует набор кита по перечню соответствий; своё приложение даёт
  шаблоном значка или пользовательской ячейкой.** Слово владельца. Для сравнения «равно» в наборе
  не было рисунка — дорисован знак `equals`, тоже по слову владельца. Affected stage of the plan: 2.
- **Ячейка отбора отдаёт приложению то же, что первый кит:** число — строкой, дату — моментом ISO
  полуночи дня по местному времени. Подсказки «1/1/2025» у поля даты нет: поле кита рисует
  браузер, и формат дня он показывает сам. Надпись пустого списка — общая надпись кита.
  Affected stage of the plan: 2, 3.5.

- **Строки таблицы различаются ключом записи, а не местом в списке.** Первый кит следил по
  месту, и при смене страницы флажок доставался соседней записи — это видно в спеке выбора.
  Отступление от «как есть» наружу не видно: приложение об этом не знает. Affected stage of the
  plan: 2.
- **Меню кита `rt-menu` получило выход `openedChange`.** Таблице нужно знать, у какой строки
  открыто меню, — первый кит брал это у Material. Готовое расширено там, где оно живёт, а не
  повторено рядом. Affected stage of the plan: 2.

- **Видимость поля поиска считается по сигналу, а не по состоянию формы.** Поле формы сигналом не
  является, и пересчёта по нему не бывает — на заглушке поле не появлялось вовсе. Набранное
  записывается в сигнал тем же потоком, что уходит приложению. Affected stage of the plan: 3.

## Sessions

### 2026-09-22

- Сверка таблиц первого и второго кита: во втором нет восьми возможностей, у трёх историй первого
  кита нет пары.
- Задача RT-2316 заведена, строка 7.9 плана эпика.
