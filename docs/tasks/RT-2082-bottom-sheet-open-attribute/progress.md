# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — этапы кончились
- **Done:** договорённость влита в спеку домена: папка `proposed/` снята, поддомен стоит в таблице,
  `node tools/check-specs.mjs` — код выхода 0
- **Next step:** закрыть работу — свести тексты, прогнать набор, разобрать папку задачи
- **Uncommitted:** нет
- **Waiting for the owner:** нет
- **PR:** ещё не открыт

## Decisions along the way

- **Работа меняет поведение, и договорённость написана, а не обойдена.** Голый атрибут начнёт
  открывать лист: потребитель пакета получит другое, чем получал. Строкой «поведение не меняется»
  такое не закрывается. Договорённость лежит в
  `docs/specs/ui-kit-v2/proposed/boolean-input-attribute/`. Affected stage of the plan: 1.

- **Кит приводится к одной форме, а не потребитель к двум.** Два компонента одного набора,
  отвечающие на одну написанную форму по-разному, хуже любого из двух ответов: человек учит набор
  на соседях и несёт привычку к тому, кто молча не согласен. Affected stage of the plan: 2.

- **Превращение берётся то же, что уже несут соседи.** Оно лежит в самом фреймворке и своего кода
  дереву не требует. Своё превращение разошлось бы с фреймворком на значении «false», и разница
  жила бы там, где её никто не ищет. Affected stage of the plan: 2.

- **Вид кита сдвинулся, и это не поломка, а тот же изъян ещё в двух семействах.** Замысел ждал, что
  съёмка снимков останется зелёной. Она покраснела на восьми кадрах: разметка показов шапки и
  рабочего стола писала голый атрибут, и до превращения он читался ложью. Эталоны были сняты с этой
  лжи. После превращения в кадре появились кнопка «назад» и кнопка подробностей — то самое, что
  разметка и просила. Двенадцать эталонов сняты заново после осмотра кадров.
  Affected stage of the plan: 2.

- **Вход, логический только по объявленному типу, в ките нашёлся — один.** На этапе 2 счёт по
  объявлениям его не показал: он искал входы без превращения, а этот объявлен `boolean | null` и в
  ту выборку не попал. Это `pressed` у кнопки: нажата, не нажата, не сказано. Третье значение —
  то, в чём кнопка стоит до ответа, и превращение свело бы его в ложь. Он назван отдельно в списке
  принятого с причиной. Affected stage of the plan: 3.

## Sessions

### 2026-09-14

- Ветка взята от RT-1956: работа стоит шестой в цепочке
- Разбор закрыт тем, что измерено в RT-1956: вход листа объявлен без превращения строки в истину,
  голый атрибут даёт ему пустую строку, лист остаётся закрытым
- Написана договорённость: четыре правила, четыре сценария `SC-UKV-133`…`SC-UKV-136`, два открытых
  вопроса. Первый — сколько в ките таких входов; он и закрывается этапом 1
- Счёт по объявлениям: логических входов в ките 107, превращение несут 96, не несут 11. Кит почти
  весь на одной форме, и одиннадцать входов стоят особняком — значит чинится не один вход, а все
  одиннадцать, и заводится проверка. Открытый вопрос `Q-1` закрыт
- Одиннадцать без превращения:
  `workspace-details:loading`, `workspace-details:busy`, `calendar:canPrev`, `calendar:canNext`,
  `input-number:grouped`, `workspace:hasActive`, `toast:expanded`, `toast:expandByDefault`,
  `toast:interacting`, `bottom-sheet:open`, `header:canGoBack`
- Два из одиннадцати объявлены обязательными — `toast:expanded` и `bottom-sheet:open`. Обязательный
  вход потребитель написать вынужден, и форму он берёт привычную: эти два и опаснее прочих
- Одиннадцати входам задано превращение `booleanAttribute` из фреймворка: семь файлов кита
- На лист написаны три сценария — `SC-UKV-133`, `SC-UKV-134`, `SC-UKV-135`: голый атрибут, голый
  атрибут у обязательного входа, строка «false»
- Спеки кита: 122 набора, 1530 тестов, зелено. Было 1527 — прибавились эти три
- Съёмка снимков покраснела на восьми кадрах: четыре у шапки, четыре у рабочего стола на пороге 1080. Кадры осмотрены поодиночке — в каждом появилось то, что просила разметка показа
- Двенадцать эталонов сняты заново двумя точными вызовами. Полная съёмка после этого: 168 наборов,
  546 тестов, 568 снимков, лишних эталонов нет
- Мейн подтянут: обновление зависимостей RT-2079 влито сверху вниз по всей цепочке из семи веток,
  расхождений при слиянии нет
- После установки зависимостей съёмка покраснела ещё на восьми кадрах — переписка и поле ввода.
  Причина не в этой работе: эти эталоны сняты 13 сентября браузером Playwright 1.63, а дерево
  прибито к 1.62, и он иначе рисует уголок изменения размера у поля. Старые эталоны августа на том
  же прогоне зелёные — значит браузер сейчас верный, а те восемь кадров сняты чужим
- Восемь эталонов переписки и поля ввода сняты заново. Полная съёмка: 168 наборов, 546 тестов,
  568 снимков, лишних эталонов нет
- Сняты двадцать две записи описания прошлого по сроку: проверка перед push отказывала по пяти
- Заведена проверка `tools/check-boolean-inputs.mjs`: читает объявления входов кита, отбивает
  логический вход без превращения и вход, логический только по типу, если он не назван отдельно.
  Список принятого — `tools/boolean-inputs-allowlist.json`, в нём одна строка
- Проверка встала в набор перед push и в задание шагом «Boolean inputs of kit two»
- Набор сценариев над проверкой — `tools/tests/check-boolean-inputs.test.sh`, 14 проверок, зелено.
  Он закрывает `SC-UKV-136`
- Своя проба на живом дереве: объявление листа испорчено, проверка отбила и назвала вход, дерево
  возвращено — проверка молчит. На целом дереве 107 логических входов, все с превращением
- Договорённость влита в спеку домена: папка переехала из `proposed/` в
  `docs/specs/ui-kit-v2/boolean-input-attribute/`, поддомен назван в таблице домена, статус
  переписан на действующий. `node tools/check-specs.mjs` — код выхода 0, расхождений нет

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2082-bottom-sheet-open-attribute

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — входы берут превращение
- **Next step:** этап 2 — задать превращение одиннадцати входам, отделив те, что логические только
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-2082-bottom-sheet-open-attribute/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet.component.ts
 M projects/ui-kit-v2/src/lib/components/calendar/rt-calendar.component.ts
 M projects/ui-kit-v2/src/lib/components/header/rt-header.component.ts
 M projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts
 M projects/ui-kit-v2/src/lib/components/toast/rt-toast.component.ts
 M projects/ui-kit-v2/src/lib/components/workspace-details/rt-workspace-details.component.ts
 M projects/ui-kit-v2/src/lib/components/workspace/rt-workspace.component.ts
```

### Commits over the main branch

```
5d0357075 docs(rt:ui-kit-v2): логические входы кита сосчитаны, открытый вопрос закрыт
157104a8a docs(rt:ui-kit-v2): договорённость о логическом входе и голом атрибуте написана
5a60bc765 docs(rt:ui-kit-v2): разбор RT-1956 лёг в описание прошлого
495b8c903 docs(rt:ui-kit-v2): папка задачи RT-1956 разобрана
827a3bb7d fix(rt:ui-kit-v2): нижний лист виден в кадре своих показов
d0712bf34 docs(rt:ui-kit-v2): разбор и замысел задачи RT-1956 записаны
1568937c9 Merge branch RT-2074-workspace-details-narrow into RT-2075-default-stories-presets
06ff13282 Merge branch RT-2057-presets-across-families into RT-2074-workspace-details-narrow
0fdf31455 Merge branch RT-2058-frame-clipped-by-node-box into RT-2057-presets-across-families
cfcbc23ef Merge branch RT-1870-one-kit into RT-2058-frame-clipped-by-node-box
287bc4f37 docs(rt:ui-kit-v2): папка задачи RT-2075 разобрана
07f27e3d7 docs(rt:ui-kit-v2): положение эпика переписано по сделанному
a319ef6e8 test(rt:ui-kit-v2): эталоны обёрнутых показов сняты после осмотра
bcfaf20cc feat(rt:ui-kit-v2): девятнадцать показов одного экземпляра стоят в обоих наборах
f07bd141b docs(rt:ui-kit-v2): показы вне матриц разобраны по роду, счёт сделан
cc7347b76 docs(rt:ui-kit-v2): заведена папка задачи RT-2075
725bdfae4 docs(rt:ui-kit-v2): папка задачи RT-2074 разобрана
b0afd0fa2 fix(rt:ui-kit-v2): кадр рабочего места кончается вместе с ящиком показа
b04278d9d docs(rt:ui-kit-v2): заведена папка задачи RT-2074
fd290c7f7 test(rt:ui-kit-v2): эталоны сняты на дереве, где сошлись съёмка по нарисованному и пара наборов
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
