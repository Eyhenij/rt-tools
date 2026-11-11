# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — the code and the stories
- **Done:** макет `Stepper` в Figma одобрен владельцем («Одобряю»): `Steps` 2–7 × `Current`, полоса
  по ширине родителя, подпись в отрезке вокруг точки; вертикальный режим и фон у всех кадров. Строка
  назначения копии вписана по слову «Разрешаю вписать». Ветка от `origin/main`, спека подобласти
  `stepper` и план записаны.
- **Next step:** чистая функция отрезка подписи и правка шаблона и стилей `rt-stepper`.
- **Uncommitted:** папка задачи, спека `docs/specs/ui-kit-v2/stepper/`, строка назначения.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Stepper in Figma: Steps × Current, the bar stretches, the label inside the bar
- [x] 1.2 The owner approves the mockup
- [>] 2.1 The label segment as a pure function, the current point by the held number
- [ ] 2.2 The template and the styles: the rail as a column, the label in its segment
- [ ] 2.3 Unit tests named by the scenarios
- [ ] 2.4 Showcase stories: three of four, five steps, width 327, long labels
- [ ] 3.1 The numbers of the Figma frames against the showcase
- [ ] 3.2 The overlay frame, the showcase shown to the owner
- [ ] 4.1 The task folder is taken apart, the spec status becomes in force
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

## Sessions

### 2026-11-11

- Figma: 3 прежних варианта перестроены с сохранением узлов, добавлено 24 новых. Экземпляры тёмной
  темы перешли на 4/2, 4/1, 4/4 сами.
- Измерение: в 10 примерах подпись внутри полосы, поле от края полосы не меньше 1 px.
- Вертикальный режим: шаг строки 67 px, линия отстоит от меток на 4 px, как на снимке витрины.
