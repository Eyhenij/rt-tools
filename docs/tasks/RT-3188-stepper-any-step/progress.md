# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — delivery
- **Done:** витрина одобрена («Одобряю витрину»), совпадение 190 из 190; макет `Stepper` в Figma одобрен владельцем («Одобряю»): `Steps` 2–7 × `Current`, полоса
  по ширине родителя, подпись в отрезке вокруг точки; вертикальный режим и фон у всех кадров. Строка
  назначения копии вписана по слову «Разрешаю вписать». Ветка от `origin/main`, спека подобласти
  `stepper` и план записаны.
- **Next step:** 4.1 — статус спеки `stepper` «in force», запись в архив, разбор папки последним коммитом; затем 4.2 — push, PR и выпуск кита.
- **Uncommitted:** ничего; ветка не отправлена.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Stepper in Figma: Steps × Current, the bar stretches, the label inside the bar
- [x] 1.2 The owner approves the mockup
- [x] 2.1 The label segment as a pure function, the current point by the held number
- [x] 2.2 The template and the styles: the rail as a column, the label in its segment
- [x] 2.3 Unit tests named by the scenarios
- [x] 2.4 Showcase stories: three of four, five steps, width 327, long labels
- [x] 3.1 The numbers of the Figma frames against the showcase
- [x] 3.2 The overlay frame, the showcase shown to the owner
- [>] 4.1 The task folder is taken apart, the spec status becomes in force
- [ ] 4.2 The PR and the kit release

## Decisions along the way

- **Подпись среднего шага стоит в отрезке вокруг точки и переносится в нём.** Figma не умеет
  сдвигать подпись к краю по её ширине, а код повторяет макет. Цена: при 7 шагах на ширине 327
  подпись второго шага встаёт в две строки. Affected stage: 2.
- **Высота строки подписи 18 px, как в Figma, вместо 12 в коде.** Иначе перенесённая подпись
  налезает на себя. Affected stage: 2.
- **Подпись варианта по умолчанию стоит над точкой.** Старый макет расходился с кодом на 23 px, код
  центрировал по точке. Affected stage: 1.
- **Вертикальный режим нарисован в Figma по замечанию владельца** «на макетах нет вертикального
  режима степера»: набор `Stepper step` (`7801:630`), компонент `Stepper vertical` (`7801:631`),
  примеры `7801:659`. Код вертикального режима не меняется. Affected stage: 1.
- **Фон `bg/page` и скругление 12 у всех кадров страницы** по замечанию «добавь бг есть не на всех
  макетах». Affected stage: 1.

- **Цвета степпера — свойства хоста** по слову владельца «добавь токены для стилей чтобы можно было
  переопределять цвета»: `--rt-stepper-*-color` и метки по состояниям, по умолчанию токены темы.
  Affected stage: 2.
- **Просвет 5 px под подписью — частью полосы высотой 21 px**: шага 5 px в шкале нет, проверка
  токенов отклонила `gap: 5px`. Пиксели те же. Affected stage: 2.

## Sessions

### 2026-11-11

- Figma: 3 прежних варианта перестроены с сохранением узлов, добавлено 24 новых. Экземпляры тёмной
  темы перешли на 4/2, 4/1, 4/4 сами.
- Измерение: в 10 примерах подпись внутри полосы, поле от края полосы не меньше 1 px.
- Вертикальный режим: шаг строки 67 px, линия отстоит от меток на 4 px, как на снимке витрины.
- Код: 35 тестов зелёные, типы зелёные, аудит спек зелёный. Совпадение кадра ширин: 190 из 190
  чисел; наложение по умолчанию — 5,86 % пикселей, только текст и сглаживание краёв точек.- Цвета: ручки `--rt-stepper-*` не объявляются на хосте (объявление перебивало родителя), 17 имён в
  `tools/tokens-handles.json` и `Theming.mdx`, `rt-design-tokens.ts` пересобран.

## Handover of the session

### Work

RT-3188 «Степпер второго кита не умеет любой шаг и узкую полосу». Рабочее дерево —
`/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools`, ветка `RT-3188-stepper-any-step` (в работе,
от `origin/main`, upstream указывает на `origin/main` — при первом push задать `-u origin
RT-3188-stepper-any-step`). PR не открыт, ветка не отправлена.

### Where to look

Прогресс и план приходят хуком. `approvals.md` в папке задачи держит все три строки одобрения.
Спека — `docs/specs/ui-kit-v2/stepper/` (статус пока «agreement before the code»).

### Done and the next step

Сделано: макет Figma (полоса, вертикальный режим, фон) и код `rt-stepper` с историями `Widths` и
`Colors`, оба одобрены владельцем; аудит спек и проверки токенов зелёные.
Дальше: 4.1 — спеке статус «in force» и строка истории, запись в `docs/archive/`, разбор папки
последним коммитом (паттерн `task-flow-archive`); 4.2 — push, PR (`git-workflow-pr`), выпуск кита.

### What to keep in mind

- Витрина второго кита поднята этой сессией на 6007 (фоновая задача); её можно остановить.
- Набор push второго кита дольше сторожа (снимки и e2e без кэша): push может оборвать сессию.
- Снимки `atoms-feedback-stepper--*` разойдутся: подпись теперь 18 px и стоит в отрезке; эталоны
  переснимать адресно, а новые `widths` и `colors` снять впервые после взгляда.
- Наложение по умолчанию лежит в папке заметок сеанса: `stepper-overlay-diff.png`.
