# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 4 of 4 — Тексты записаны
- **Done:** все этапы пройдены, исправление закоммичено, витрина одобрена: совпадение 49 из 49 чисел.
- **Next step:** ревью, набор проверок, разбор папки задачи и PR.
- **Живая проверка:** закреплённый Chrome, отдельная страница на этом компьютере. Сравнены прежний и новый `tokens.css`:
  8 корней страницы и 819 вложенностей, 662 свойства на самом глубоком узле, 4337424 значения. Все 192 тёмных узла набора
  со светлым предком под `rt-theme-dark` изменились и стали тёмными: фон `#fff` стал `#222629`. Вне таких вложенностей и
  их потомков расхождений 0. Правила `pointer: coarse` и плотность в этой странице не проверялись.
  После правки при обоих способах включить тёмную тему корня у узла классом и атрибутом одни значения: фон
  `rgb(34, 38, 41)`, текст `rgb(250, 250, 250)`, `color-scheme: dark`.
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Кадр тёмного узла внутри светлого куска нарисован в Figma и одобрен
- [x] 2.1 Тест SC-UKV-1921 на прежнем листе краснеет только на тёмном узле под rt-theme-dark
- [x] 2.2 Два узких селектора и верный комментарий порядка записаны генератором, тест зелёный
- [x] 2.3 Сценарий раздельной поставки держит новые селекторы тёмного правила
- [x] 2.4 Проверки токенов и веса кита проходят
- [x] 2.5 В браузере сравнены прежний и новый лист по сочетаниям темы и набора
- [x] 3.1 История показывает исправленный случай, и её эталон снят
- [x] 3.2 Витрина сверена с макетом и одобрена
- [x] 4.1 Сценарий SC-UKV-1921 записан в спеке токенов
- [x] 4.2 Признак выпуска в плане эпика проверяет этот случай на пакете из npm pack

## Decisions along the way

- SC-UKV-1921 на прежнем листе: красные только два случая, `rt-theme-dark > light > dark` классом и атрибутом. Остальные
  52 сочетания из 54 совпали с ожиданием. Первая версия теста брала первое объявление свойства в правиле и краснела
  везде: решает последнее.
- Превышение: новых файлов кода три, а не один. Компонент в этом дереве лежит тремя файлами, поэтому к
  `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.ts` добавлены
  `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.html` и
  `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.scss`.
- Превышение решения «Зависимости» и «Зацепление»: показ берёт ещё BEM-директивы `@rt-tools/core`, как требует
  правило стилей. `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.ts`
  исходящие 0 → 1, `projects/ui-kit-v2/src/showcase/stories/theme-scope.stories.ts` исходящие 1 → 2. Новых циклов и
  входов мимо точки нет.
- Первый круг ревью: серьёзных замечаний нет. Исправлено: тест считает светлым только точное значение светлого набора
  и ставит обёртку между куском и узлом; уход с истории не пишет поверх свежей темы переключателя; формулировка
  сценария сужена до одного куска; в плане эпика уточнено влияние на вес.
- Не исправляется: узел набора без своей темы глубже одного куска остаётся светлым, например таблица Material внутри
  тёмной карточки. Это записанный в плане предел, под `data-theme="dark"` было так же; он назван в описании PR. Тест
  читает одно свойство: значения общих правил целиком держит `tools/tests/build-tokens-split.test.sh`. Переключатель
  темы при открытой истории возвращает метку на корень: это только показ витрины, на кадр по умолчанию не влияет.
- Второй круг ревью: серьёзных замечаний нет ни у одной роли. Не исправляются два мелких: тест ставит обёртку и не
  проверяет узел прямым потомком куска, а стиль, отличающий эти случаи, надуман; браузерный замер повторит RT-3716 на
  пакете.
- Набор перед отправкой дал два отказа по новому показу: порядок свойств в стилях и две находки `check:ngdoctor`.
  Отказ от пути плана `projects/ui-kit-v2/src/showcase/stories/component/test-theme-scope-dark-set.component.ts`: имя
  файла обязано совпадать с именем класса, поэтому показ лежит в
  `projects/ui-kit-v2/src/showcase/stories/component/test-rt-theme-scope-dark-set.component.ts`, рядом `.html` и
  `.scss`. Порог `check:ngdoctor` не поднимался.
- Превышение: добавлен тест показа
  `projects/ui-kit-v2/src/showcase/stories/component/test-rt-theme-scope-dark-set.component.spec.ts`. Он проверяет, что
  показ отдаёт `<html>` обратно и не заменяет метку соседней истории.
- **Цена:** `tokens.css` и `tokens.scope.css` без сжатия тяжелее на 388 байт. В витрине одна новая история и эталон.
- **Отменено:** нет

## Sessions

### 2026-11-27

- Ветка взята от ветки эпика. Перед этим в неё влит `main`: 55 коммитов, один конфликт в `assignments.md`, строка этой
  копии оставлена за RT-3694. Набор на ветке эпика зелёный, ветка отправлена.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-presets
**Branch:** RT-3732-preset-dark-node

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Витрина
- **Next step:** история в витрине, сверка с макетом и одобрение.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3732-preset-dark-node/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3732-preset-dark-node/progress.md
 M projects/ui-kit-v2/src/styles/_theme-scope.scss
 M projects/ui-kit-v2/src/styles/theme-scope.theme.spec.ts
 M tools/build-tokens-v2.mjs
 M tools/kit-weight-threshold.json
 M tools/tests/build-tokens-split.test.sh
?? docs/tasks/RT-3732-preset-dark-node/approvals.md
```

### Commits over the main branch

```
1570f890d docs(rt:ui-kit-v2): план RT-3732 (RT-3732)
626b04ada docs(rt:ui-kit-v2): разбор RT-3732 и записи плана эпика (RT-3732)
a16833e3d Merge remote-tracking branch 'origin/main' into RT-3694-kit-weight-remainder
7bff195e7 [RT-3649] Значения пресета и тем записаны один раз: токены легче на 105 КБ без сжатия (#3731)
09bb3a869 docs(rt:ui-kit-v2): разбор папки задачи RT-3649 (RT-3649)
b8977b3da docs(rt:ui-kit-v2): непроверенный выигрыш назван ожидаемым в плане эпика (RT-3649)
26f808e36 chore(rt:agent-kit): убраны просроченные записи архива (RT-3649)
8b049d45b test(rt:ui-kit-v2): сценарий сверяет значения общих правил пресета, после второго круга ревью (RT-3649)
71a9b6c8e test(rt:ui-kit-v2): порядок и селекторы общих правил проверяются сценарием, после первого круга ревью (RT-3649)
551244bd0 refactor(rt:ui-kit-v2): одинаковые наборы значений местных кусков темы записаны один раз (RT-3649)
a1a99a8f3 docs(rt:ui-kit-v2): ход работы и согласие RT-3649 (RT-3649)
41cdf32bc docs(rt:ui-kit-v2): план RT-3649 (RT-3649)
ef99a92f0 docs(rt:ui-kit-v2): разбор RT-3649 и измерение токенов в плане эпика (RT-3649)
1491ac5d1 docs(rt:ui-kit-v2): план эпика и разбор правил после слияния RT-3647 (RT-3649)
18309b44a Merge branch 'RT-3647-kit-input-styles' into RT-3649-preset-values-shorter
dd17d8e7e docs(rt:ui-kit-v2): превышение решения плана RT-3647 (RT-3647)
455a3f9a5 [RT-3647] Стили input легче на 3010 байт без изменения вида (#3724)
1090baedb docs(rt:ui-kit-v2): разбор папки задачи RT-3647 (RT-3647)
132901d7e docs(rt:ui-kit-v2): цена и отменённое RT-3647 (RT-3647)
61d44a452 test(rt:ui-kit-v2): сценарий веса ищет объединённое правило, после второго круга ревью (RT-3647)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
