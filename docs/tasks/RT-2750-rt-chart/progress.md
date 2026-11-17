# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — Витрина
- **Done:** разбор, план одобрен владельцем («Одобряю план»), #2750 переписан под выпуск после RT-3337; макет одобрен («Одобряю макет»); `echarts` заменён модулями d3 и своим SVG по слову владельца; спек подобласти `chart` под модель кита со сценариями SC-UKV-1331…1340 и привязками; компонент `rt-chart` на своём SVG, спеки — 16 тестов; витрина сверена с макетом — 396 из 396 чисел стиля, 89 из 94 подписей в пределах 1.5 px
- **Next step:** одобрение витрины владельцем, затем эталоны снимков (4.2)
- **Uncommitted:** нет
- **Waiting for the owner:** одобрение витрины на d3
- **PR:** not open yet

## Steps

- [x] 1.1 Спек, API, сценарии и привязки подобласти `chart`
- [x] 2.1 Кадр Figma: палитра серий в обеих темах, виды и три случая; одобрение владельца
- [x] 3.1 Вход `chart`, peer-зависимости, реестр видов, настройка jest под ESM echarts
- [x] 3.2 Компонент `rt-chart`, токены палитры, подписи `rtKit`
- [x] 3.3 Спеки компонента: частичное обновление, «нет данных», PNG, контейнер нулевой ширины, смена темы, реестр из семи видов
- [x] 4.1 Истории и Overview: семь видов, столбики стопкой, полоса прогноза, две оси, пустые данные, тёмное поддерево
- [ ] 4.2 Эталоны снимков всех историй графика
- [>] 4.3 Сверка чисел с макетом; одобрение владельца
- [x] 5.1 «Готово, когда» у #2750 переписано под выпуск после RT-3337 — по слову владельца
- [ ] 5.2 Папка задачи разобрана в архив, набор, PR каскадом: база — ветка предыдущей невлитой задачи эпика, иначе ветка эпика

## Decisions along the way

- **Ветка от ветки эпика, а не от RT-3361.** RT-2750 не трогает файлы RT-3361. Affected stage of the plan: 5.
- **Признак этапа 1 — список отказов, а не код выхода 0.** До кода `check:specs` по правилу `spec-driven-domain` называет новые правила без привязки и сценарии без теста; после этапа 1 он назвал ровно 10 новых правил и 7 сценариев подобласти `chart`, и ничего сверх. Код выхода 0 — признак этапа 3. Affected stage of the plan: 1.
- **«Две оси» стали «двумя панелями», витрина выросла на три истории.** Владелец попросил сверить виды графиков с приложением, где связка echarts уже стоит. Там цена и загрузка нарисованы двумя панелями с общей осью X, а метод палитры для графиков запрещает две оси Y в одной панели. Добавлены гистограмма, области стопкой с линиями прогноза и прошлого года, дерево прямоугольников с подписями групп. Палитра серий — восемь переменных `chart/series-1…8`, проверены валидатором в обеих темах. Макет одобрен с этими изменениями. Affected stage of the plan: 4.
- **Вторая подпись пустого графика — подсказка, а не кнопка PNG.** В макете под заголовком пустого состояния стоит подсказка, кнопки сохранения в интерфейсе нет: PNG отдаёт метод `toPng()`. Подпись `chartDownloadPng` в спеке заменена на `chartEmptyHint`. Кит несёт английские подписи, витрина — русские; «восемь языков» в спеке было неверно и исправлено. Affected stage of the plan: 3.
- **`toPng()` возвращает Promise.** Рендерер SVG отдаёт только SVG, PNG собирается на холсте после загрузки картинки, а это асинхронно. Affected stage of the plan: 3.
- **`echarts` заменён модулями d3 и своим SVG — слово владельца.** На вопрос об одобрении витрины владелец ответил: «ты можешь реализовать эти графики на другом инструменте? нам нужна лёгкость и гибкость». Замер: `echarts` с семью видами и рендерером SVG — 670 КБ в сборке, 229 КБ в gzip. Из трёх вариантов выбран «Модули d3 + свой SVG (Recommended)». d3 считает шкалы, формы и раскладку дерева, рисуют шаблоны Angular. Цвета берутся токенами CSS прямо в шаблоне, поэтому чтение вычисленного стиля, тема `echarts` и пересоздание при смене темы уходят. Вход компонента — своя модель кита вместо опции `echarts`. Макет 8091-428 остаётся одобренным, витрину сверяю с ним заново. Этапы 3 и 4 переделываются: спек, компонент, спеки, витрина. Affected stage of the plan: 1, 3, 4.
- **Сверка с макетом — 396 чисел на 26 карточках.** На каждую карточку обеих тем: размеры, отступ, радиус и промежуток карточки, кегль, вес и цвет заголовка, кегль и цвет подписей осей и легенды, цвет сетки, цвета значков легенды по порядку. Подпись группы у дерева прямоугольников в макете 11 пикселей, но это не ось, и её ключи выкинуты. Первый прогон дал 390: точки `echarts` рисует с прозрачностью 0.8 по умолчанию, а шестой лист дерева в макете седьмого цвета. Тема кита теперь рисует точки сплошными, фикстура — лист седьмым цветом. Расхождения, которых числа не видят: дерево делит площадь иначе, чем макет, шкала тепловой карты непрерывная, а не из пяти блоков. Affected stage of the plan: 4.
- **Витрина на d3 сверена с макетом заново: числа стиля и места подписей.** Числа стиля — 396 из 396. Места 94 подписей сверены с узлами макета, 89 в пределах 1.5 px. Из пяти остальных две — из-за ширины поля: в макете оно 328 px при 326 px внутри карточки. Ещё две — межстрочный заголовка карточки и заглушки кита. Пятая — подпись второй группы дерева. По сверке сделано: шкала плотности под тепловой картой, как в макете; значения карты 0…90 по макету; доли двух панелей 78 к 68; подпись значения выступает за левый край поля до 4 px; пункт легенды переносится, а не сжимается; заглушка стоит у верха поля. Дерево в макете нарисовано не по значениям: группы 196 и 130 px при долях 70 и 30. Витрина повторяет строение — группы рядом, первый лист сверху — и делит площадь по значениям, группа не уже своей подписи. Affected stage of the plan: 4.
- **Новая опция идёт слиянием.** Директива `ngx-echarts` на смену входа `options` пересоздаёт опцию целиком, поэтому график создаётся с пустой опцией, а вход компонента идёт во вход `merge`. Серию убирают пустыми данными. Affected stage of the plan: 3.

## Sessions

### 2026-11-17

- Разбор и план прошли роли стратега и критика цели, план переписан по их замечаниям и одобрен владельцем.
- Задача #2750 уже была в очереди, поэтому папка заведена без `task:new`.
- Компонент и спеки: шаблон jest не пропускал ESM `echarts` по пути pnpm, исправлен; в jsdom нет холста, спеки меряют подписи через `setPlatformAPI`.
- После замены на d3: спек, привязки и описание переписаны; витрина сверена с макетом по числам стиля и по местам подписей, найденные расхождения исправлены в компоненте и в данных витрины.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/ai-chat-blocks
**Branch:** RT-2750-rt-chart

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — Витрина
- **Next step:** спек подобласти `chart` под модель кита и d3, затем компонент на своём SVG
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2750-rt-chart/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/ui-kit-v2/chart/scenarios.md
 M docs/specs/ui-kit-v2/chart/spec.md
 M docs/tasks/RT-2750-rt-chart/progress.md
 M package.json
 M pnpm-lock.yaml
 M projects/ui-kit-v2/jest.config.ts
 M projects/ui-kit-v2/package.json
 M projects/ui-kit-v2/src/lib/components/chart/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/chart/index.ts
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.html
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.scss
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.empty.ts
D  projects/ui-kit-v2/src/lib/components/chart/rt-chart.helpers.spec.ts
 M projects/ui-kit-v2/src/lib/components/chart/rt-chart.png.ts
D  projects/ui-kit-v2/src/lib/components/chart/rt-chart.registry.spec.ts
D  projects/ui-kit-v2/src/lib/components/chart/rt-chart.registry.ts
D  projects/ui-kit-v2/src/lib/components/chart/rt-chart.theme.ts
 M projects/ui-kit-v2/src/lib/components/chart/stories/chart.stories.ts
```

### Commits over the main branch

```
ebb78beaa fix(rt:ui-kit-v2): витрина rt-chart совпала с макетом по числам
d8a1288ef feat(rt:ui-kit-v2): витрина rt-chart и вид осей и легенды по макету
f06da521a docs(rt:ui-kit-v2): ход RT-2750 — компонент и спеки готовы
89154862c test(rt:ui-kit-v2): спеки rt-chart по сценариям SC-UKV-1331…1337
7bca4532d feat(rt:ui-kit-v2): компонент графика rt-chart
85f3c3398 feat(rt:ui-kit-v2): подписи пустого графика в rtKit
b692ea81a feat(rt:ui-kit-v2): токены палитры серий графика в обеих темах
c52044e5f feat(rt:ui-kit-v2): вход chart и реестр видов echarts
9da2eb4bf docs(rt:ui-kit-v2): одобрение макета RT-2750 — rt-chart
886cb42be docs(rt:ui-kit-v2): спек подобласти chart — rt-chart, его вход и сценарии
a67024c28 docs(rt:ui-kit-v2): план задачи RT-2750 — компонент графика rt-chart
1ffcfb60c chore(rt:agent-kit): из архива удалены записи старше недели
c687ac593 Merge remote-tracking branch 'origin/main' into RT-3346-ai-chat-blocks
c3af862df [RT-3334] Ответ rt-ai-chat собирается из блоков markdown и notice (#3359)
dfca99a2d fix(rt:ui-kit-v2): копия блока берётся у того же отрисовщика, что его рисует
a10eb78b4 feat(rt:ui-kit-v2): отрисовщик блока отдаёт текст для копии ответа
674c92386 Merge remote-tracking branch 'origin/RT-3346-ai-chat-blocks' into RT-3334-ai-chat-blocks
2727d65ab Merge remote-tracking branch 'origin/main' into RT-3346-ai-chat-blocks
fe7111162 docs(rt:ui-kit-v2): описание CustomBlock говорит, что блок из реестра не копируется
c69186989 test(rt:ui-kit-v2): эталон истории блоков ответа rt-ai-chat
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
