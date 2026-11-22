# Ход работы

## Где стоим

- **State:** `этапы-кончились`
- **Stage:** 5 из 5 — Порог (все этапы закрыты)
- **Done:** этап 1 (ae3cb5084); этап 2 (0a6fb6e2e); этап 3 (517e8eeb9); этап 4 (d1e5d817b) — потребители дерева на шаблонах, тесты cms по киту дерева; этап 5 — порог 37 → 68.5 без трёх правил, черновик слит в `docs/specs/ui-kit-v2/template-slots/`
- **Live check:** `node tools/visual-gate.mjs ui-kit-v2` → истории 1196 из 1196, кадры 1223 из 1223; первый прогон поймал подвал панели настроек списка данных внутри шаблона тела (кадр 708 → 740 px), исправлено
- **Next step:** первый круг ревью
- **Uncommitted:** нет
- **PR:** ещё не открыт

## Шаги

- [x] 1.1 Примеры в комментариях пайпов equal, not-equal и директивы действий строки переписаны на @if и @for
- [x] 1.2 Сброс и копия входа в workspace-details, настройках таблицы и панели чата админки идут через linkedSignal или computed
- [x] 1.3 Замеры ширины выреза, плитки показателя и области прокрутки пишут сигнал из наблюдателя размера, а не из effect
- [x] 1.4 Тесты кита и панели чата админки зелёные на коде без записи сигналов из effect
- [x] 2.1 Подсказка поля, действия панели раскрытия, слоты шапки страницы, чата и подпункта бокового меню передаются шаблонами и собираются списками
- [x] 2.2 Тело панели раскрытия стоит в DOM с начала, свёрнутое скрыто и inert
- [x] 2.3 Старая форма именованного слота пишет предупреждение в режиме разработки
- [x] 2.4 Тесты именованных слотов зелёные: SC-UKV-1711…1723, 1734…1737
- [x] 3.1 Меню, кнопка-значок, хлебные крошки, заголовок сортировки (rtTableSortHeaderContent), боковая панель, обёртка скелетона, динамический список, строка суммы и пункт сведений берут содержимое шаблоном
- [x] 3.2 Список динамического выбора берёт кнопку добавления входом, поле и деталь-строка держат своё содержимое в DOM под скелетоном
- [x] 3.3 Подтверждённое действие пункта меню доходит до потребителя после закрытия меню; пункт вне rtMenuContent предупреждает
- [x] 3.4 Тесты слотов по умолчанию зелёные: SC-UKV-1724…1733, 1739…1744, 1746
- [x] 4.1 Список cms и список админки передают слоты шаблонами
- [x] 4.2 Разметка дерева не держит ни одного места старой формы именованного слота
- [x] 4.3 Каждое место дерева со слотом по умолчанию и колокольчик шапки страницы передают содержимое шаблоном
- [x] 4.4 Ни одного ng-content под условием или в шаблоне в шаблонах кита, cms, админки и витрины, ветки @else тоже
- [x] 4.5 Части списка cms и списка админки слиты в их спеки: SC-CMS-81 и сценарий списка админки о шаблоне содержимого
- [x] 4.6 Коммит правки API несёт сноску о ломающем изменении: каждый слот в старой и новой форме
- [x] 5.1 Находок трёх правил в дереве нет
- [x] 5.2 Порог записан на результате задачи, ни одно правило в нём не выросло против порога ветки эпика
- [x] 5.3 Черновик договорённости слит в спеки кита, живые тексты SC-UKV-519, 521, 821, 172, 1165 приведены к нему

## Решения по ходу

- **Тесты cms идут по исходникам кита дерева.** Пакет ставит опубликованный кит `^0.23.3`, в котором шаблонных слотов нет; экраны cms переведены на шаблоны вместе с китом, и спеки читают кит так же, как уже читали контракт cms. Выпуск cms потребует выпуска кита — решение о выпуске за владельцем.

- **Директивы слотов шапки страницы и списка витрины объявлены в файлах их компонентов, слоты чата — в файле его шаблонов состояний.** Отдельный файл на несколько директив добавлял находку «имя файла не совпадает с классом», а файл на одну директиву — находку «нет соседней спеки»; порог этапа 5 не даёт расти ни одному правилу. Директивы стоят перед компонентом без `export` у объявления и выходят списком в конце файла: линтер запрещает ссылку на класс до объявления.
- **Пункт меню из шаблона узнаётся по месту в панели.** Запрос содержимого меню видит и пункты шаблона открытого меню, и предупреждение о пункте вне `rtMenuContent` срабатывало на каждом открытии; теперь предупреждает только пункт, который не лежит в панели.

## Заходы

### 2026-11-22

- Разбор с владельцем: слоты через ng-template, тело панели создаётся сразу, все слоты в условиях,
  заголовок сортировки шаблоном. Договорённость написана и прочитана критиком спек; его находки
  вошли в неё до плана.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3479-ngdoctor-templates

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 из 5 — Слоты по умолчанию кита
- **Next step:** 3.1 — слоты по умолчанию кита шаблонами
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-3479-ngdoctor-templates/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/aside/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/aside/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/aside/header/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.html
 M projects/ui-kit-v2/src/lib/components/aside/header/rt-aside-header.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/index.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside-empty.spec.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside-open.spec.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside-options.spec.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/stories/component/test-aside-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/aside/stories/component/test-aside.component.ts
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/index.ts
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.html
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.ts
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/stories/component/test-breadcrumbs-matrix.component.html
```

### Commits over the main branch

```
0a6fb6e2e feat(rt:ui-kit-v2): именованные слоты кита передаются шаблонами (RT-3479)
ae3cb5084 refactor(rt:ui-kit-v2): эффекты кита и панели чата без записи сигналов, примеры на @if и @for (RT-3479)
c93428afa docs(rt:ui-kit-v2): шаг 1.1 RT-3479 идёт (RT-3479)
72008fbc2 docs(rt:ui-kit-v2): ход работы RT-3479 на первом этапе (RT-3479)
a9278abba docs(rt:ui-kit-v2): план RT-3479 одобрен, вид кита не меняется (RT-3479)
416a371db docs(rt:ui-kit-v2): план задачи о слотах через ng-template (RT-3479)
d216f97f6 docs(rt:ui-kit-v2): разбор и договорённость о слотах через ng-template (RT-3479)
fd3b87c4e [RT-3478] innerHTML пишется напрямую, а DomSanitizer обходится в трёх местах (#3504)
e58176887 test(rt:auth): сквозной тест символов спрайта значков на экране записей (RT-3478)
2e7d748ed test(rt:message-bus): сквозной тест реплики с разметкой в виджете (RT-3478)
f8a87a946 docs(rt:ui-kit-v2): папка задачи RT-3478 разобрана в архивную запись (RT-3478)
24b9f350f fix(rt:message-bus): виджет без двойника кита и лишнего экспорта (RT-3478)
7e1ab5a9b fix(rt:ui-kit-v2): правки после второго круга ревью (RT-3478)
6717f5189 fix(rt:cms): правки после первого круга ревью (RT-3478)
a5cd357da chore(rt:ui-kit-v2): порог Angular Doctor без записи innerHTML и с одним обходом очистки (RT-3478)
57d3de4a7 fix(rt:message-bus): виджет чата строит разметку узлами, а не строкой (RT-3478)
1914b4b41 fix(rt:cms): правка блока без записи innerHTML, превью встраивания только для разобранного https (RT-3478)
47ea435e6 docs(rt:ui-kit-v2): слово владельца о том, что правка значков и ячейки не меняет вид (RT-3478)
ef78a6919 fix(rt:ui-kit-v2): значки и стиль значка ячейки без записи innerHTML и обхода очистки (RT-3478)
51b022a44 refactor(rt:core): пайп sanitize удалён из пакета (RT-3478)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
