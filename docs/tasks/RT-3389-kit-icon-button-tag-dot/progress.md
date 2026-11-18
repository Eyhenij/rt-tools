# Progress

## Where we stand

- **State:** `задача-взята`
- **Stage:** 4 из 4 — сдача
- **Done:** точка у `rt-tag`, стори `Dot`, `IconOnly`, `IconOnlyStates` с кадрами; сверка 121 из 121; витрина одобрена владельцем («Одобряю»)
- **Next step:** 4.1 — договорённость в спек метки
- **Uncommitted:** ход работы
- **Waiting for the owner:** нет
- **PR:** ещё не открыт

## Steps

- [x] 1.1 Значение `dot` в `IRtTag.Appearance`, разметка и стили точки в `rt-tag`
- [x] 1.2 Спеки SC-UKV-1378…1381 в `rt-tag.component.spec.ts`
- [x] 2.1 Стори точки: палитра × размер, светлая и тёмная тема
- [x] 2.2 Стори кнопки-квадрата: вид × тема × размер × состояние
- [x] 2.3 Эталоны кадров новых и изменённых стори: `node tools/visual-gate.mjs ui-kit-v2 --update '(tag|button)-matrix\.stories'`
- [x] 3.1 Числа Figma и витрины, `node tools/kit-match.mjs numbers`. Перечень ключей: кнопка —
- [x] 3.2 Кадр наложения, `node tools/kit-match.mjs overlay`
- [x] 3.3 Показ витрины владельцу, запись второго одобрения в `approvals.md` (строка макета с
- [>] 4.1 Договорённость влита в `docs/specs/ui-kit-v2/tag/`, привязки в `implementation.md`
- [ ] 4.2 Папка задачи разобрана в архив, набор перед отправкой, PR задачи в `RT-3390-kit-icon-tag-dot`
- [ ] 4.3 Слияние PR задачи, PR эпика в main, его слияние, выпуск minor `@rt-tools/ui-kit-v2`

## Decisions along the way

- **Код шагов 1.1 и 1.2 уже в коммите 95bb10149, а отметки у шагов нет.** Код написан, пока план
  ждал одобрения. Зелёную отметку пишет `task-flow-script.mjs step`, а он отвечает «step 1.1 has
  no check line»: у шагов плана нет строк проверки в той форме, которую ждёт движок с ветки
  RT-3326, а в этом дереве (main) движка нет вовсе. План после одобрения не правится. Этап: 1.
- **Эпик RT-3390 заведён под одну задачу.** Движок хуков главной копии не знает работы вне эпика
  и меряет её состоянием 2. Решение владельца через запустившую сессию: «Решение (а)». Этап: 4.

## Sessions

### 2026-11-18

- Figma `vyV42sJXccfKNG8yFSCpSL`: у Button/Filled, Outlined, Text — свойство `Icon only`, по 180
  новых вариантов, квадраты 32…64; у Tag — `Appearance=dot`, 18 вариантов, 6/8/10. Тёмная тема
  дополнена экземплярами. Владелец: «Одобряю».
- Эпик RT-3390, ветка эпика на сервере; план задачи проверен product-strategist и goal-critic,
  одобрен. Точка у `rt-tag`: 4 сценария, 35 тестов метки зелёные, eslint, stylelint и
  `check:tokens-styles` чистые.
- Стори `Dot` у метки, `IconOnly` и `IconOnlyStates` у кнопки, кадры сняты. Сверка с Figma —
  121 из 121 чисел; наложение квадрата 32×32 расходится только по краю рамки и значка. Витрина:
  «Одобряю».
- Найдено, не правилось: кольцо загрузки кнопки в коде 18 px с рамкой, в Figma 14 px — у всех
  кнопок кита; в кадрах кольца не видно, съёмка гасит анимацию появления.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/kit-icon-dot
**Branch:** RT-3389-kit-icon-button-tag-dot

### Where we stand at the minute of the compaction

- **State:** `задача-взята`
- **Stage:** 1 из 4 — точка у rt-tag; витрина по заготовке следом
- **Next step:** стори точки и кнопки-квадрата по заготовке, эталоны кадров
- **PR:** ещё не открыт

The progress in full — `docs/tasks/RT-3389-kit-icon-button-tag-dot/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3389-kit-icon-button-tag-dot/approvals.md
 M projects/ui-kit-v2/.storybook/__snapshots__/atoms-tag--severity.png
 M projects/ui-kit-v2/src/lib/components/button/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/button/stories/button-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/button/stories/component/test-button-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/tag/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/tag/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/tag/stories/component/test-tag-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/tag/stories/tag-matrix.stories.ts
?? docs/tasks/RT-3389-kit-icon-button-tag-dot/progress.md
?? projects/ui-kit-v2/.storybook/__snapshots__/atoms-buttons-button--icon-only-states.png
?? projects/ui-kit-v2/.storybook/__snapshots__/atoms-buttons-button--icon-only.png
?? projects/ui-kit-v2/.storybook/__snapshots__/atoms-tag--dot.png
```

### Commits over the main branch

```
95bb10149 feat(rt:ui-kit-v2): вид «точка» у rt-tag
83d50a7f7 Merge branch 'RT-3390-kit-icon-tag-dot' into RT-3389-kit-icon-button-tag-dot
0a0f2452e docs(rt:ui-kit-v2): эпик RT-3390 — кнопка-квадрат и точка метки
c6ae45413 docs(rt:ui-kit-v2): разбор и договорённость о точке у метки
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
