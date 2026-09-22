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
  Своя полоса страниц перенесена: ряд номеров с разрывами, стрелки, выбор размера страницы —
  65 из 65 тестов обеих семей.
  Панель настройки колонок собрана на готовом редакторе колонок кита: два признака полос
  прокрутки, перетаскивание, глаз, сохранение только после изменения — 69 из 69 тестов.
  Этап 3.4 закрыт: список собран целиком — полоса действий, таблица, полоса страниц, заглушка
  пустого списка и два вида загрузки; выбор записей по страницам с исключениями ведёт директива
  `rtDataListSelectors`. Семейный документ списка написан.
  Этап 3.5 закрыт: русский словарь витрины получил 27 слов обеих семей — без них витрина показала
  бы английские умолчания вперемешку с русским. Словарь админки ничего не получил: он неполный по
  замыслу и отвечает только на те ключи, что нужны её экранам, а этих семей там нет.
  Этап 3.6 закрыт, и на нём нашлось недоделанное: таблица не читала признаки полос прокрутки
  вовсе. Дописано — размер полос приходит с корня страницы, туда его ставит список по сохранённой
  настройке, скрытая полоса это нулевой размер. Закрыты сценарии 269, 270, 271, 273, 300 и 301.
  Без теста остались два, и у обоих причина записана: 275 (показ наборов в витрине) и 313 (узкий
  экран) закрываются кадром на этапе 4 — до него строка «Verified by» этапа 3 зелёной не станет.
  Весь второй кит — 1719 из 1719 тестов.
  Этап 4.1 закрыт: у таблицы восемь историй-матриц, площадка и обзорная страница. Каждая ячейка
  матрицы несёт свою службу настроек и свой ключ хранения — колонки таблица берёт у службы, и
  одна на весь показ дала бы всем ячейкам один состав. Части семьи — ячейки, шапка, отбор,
  директивы — названы в списке покрытия с тем, где их видно.
- **Next step:** этап 4 — истории и обзорная страница `rt-data-list`.
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
- [x] 3.2 Own pagination bar ported from the first kit
- [x] 3.3 Own column settings panel ported from the first kit
- [x] 3.4 Selection across pages, the empty placeholder and the loading look
- [x] 3.5 Words of both families in the kit's eight-language dictionary
- [x] 3.6 Spec of the list on its scenarios
- [x] 4.1 Stories and `Overview` of `rt-data-table` by the coverage contract
- [>] 4.2 Stories and `Overview` of `rt-data-list` by the coverage contract
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

- **Список колонок в панели настроек — готовый редактор кита `rt-table-settings-panel`.** Он не
  знает модели колонок ни одной из таблиц: принимает пункты «ключ, подпись, скрыта» и отдаёт их
  обратно. Своего перетаскивания семейство не писало. Affected stage of the plan: 3.

- **Слова семей ушли в русский словарь витрины, а в словарь админки — нет.** Набор витрины полон
  по типу: ключ без ответа не собирается вовсе. Набор админки неполный по замыслу и отвечает
  только на ключи её экранов, а ни таблицы, ни списка там нет — выдуманные слова для
  несуществующих экранов состарились бы молча. Правка витрины подтверждена её сборкой: ни линтер,
  ни проверка типов пакета в `.storybook` не заглядывают. Affected stage of the plan: 3.

- **Промах: проверка типов была красной при фиксации этапа 3.4.** Её вывод читался хвостом в пять
  строк, а блок длительности nx печатает и при отказе — отказ оказался выше среза, и коммит ушёл с
  двумя расхождениями типов. Найдено на следующем шаге, починено там же: вывод nx читается по
  словам «error TS» и «Successfully», а не по хвосту. Affected stage of the plan: 3.

- **Полосы прокрутки ставятся на корень страницы, а не на таблицу.** Приём первого кита: выбор,
  сохранённый одним списком, достаётся каждому списку страницы — это записано сценарием. Своего
  объявления свойства на блоке таблицы нет намеренно: оно победило бы унаследованное, и выбор
  человека до таблицы не дошёл бы. Скрытая полоса — нулевой размер, прокрутка остаётся.
  Affected stage of the plan: 3.

## Sessions

### 2026-09-22

- Сверка таблиц первого и второго кита: во втором нет восьми возможностей, у трёх историй первого
  кита нет пары.
- Задача RT-2316 заведена, строка 7.9 плана эпика.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2316-table-full-port

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 из 5 — Таблица `rt-data-table`
- **Next step:** этап 3 — выбор всех записей по страницам, заглушка пустого списка и вид
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2316-table-full-port/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/data-list/index.ts
 M projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-settings.logic.ts
 M projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selection.logic.ts
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.html
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.scss
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts
?? projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.directive.ts
```

### Commits over the main branch

```
26e767761 feat(rt:ui-kit-v2): панель настройки колонок rt-data-list — порядок, видимость, полосы
79a27f955 feat(rt:ui-kit-v2): полоса страниц rt-data-list — ряд номеров, стрелки, размер страницы
b4d4c53e0 feat(rt:ui-kit-v2): панель действий списка rt-data-list — поиск, отбор, обновление
85c3ead5e feat(rt:ui-kit-v2): таблица rt-data-table — строки, полоса действий, выбор строк
8dba21675 feat(rt:ui-kit-v2): ячейка отбора rt-data-table — поле, число, дата, список и вид сравнения
ae9d7c8ba feat(rt:ui-kit-v2): в наборе значков кита появился знак «равно»
b9665b899 test(rt:ui-kit-v2): спека шапки rt-data-table задаёт порядок значением перечисления
f9ec4afe5 feat(rt:ui-kit-v2): ячейка шапки rt-data-table — порядок, стрелки, значок
23be0461a feat(rt:ui-kit-v2): готовая ячейка rt-data-table — значение, копирование, значки набором кита
466c82afe feat(rt:ui-kit-v2): основа rt-data-table — модель колонок, хранение настроек, нажатие строки
91c5ee85b docs(rt:ui-kit-v2): в договорённость о таблице добавлен шаблон значка и пользовательская ячейка
9e4050368 docs(rt:ui-kit-v2): договорённость о таблице приведена к ответам владельца
24baf3a50 docs: план RT-2316 записан — таблица первого кита во втором в пять этапов
371d95aa8 docs: в задаче RT-2316 записано слово владельца: материала в таблице быть не должно
dbd5078a4 docs: в задаче RT-2316 записано слово владельца о значках из описания колонок
01f19aa17 docs: в задаче RT-2316 записаны ответы владельца об имени, странностях первого кита и переезде
15008db23 docs: в задаче RT-2316 записано, что договорённость переписана и ждёт ответов владельца
6a49e7681 Merge branch 'RT-2317-radio-button' into RT-2316-table-full-port
c2e8d4dc5 Merge branch 'RT-1870-one-kit' into RT-2317-radio-button
70ffc166f Merge remote-tracking branch 'origin/main' into RT-1870-one-kit
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
