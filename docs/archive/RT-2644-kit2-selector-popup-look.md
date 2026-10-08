# Grill

## The owner request

> да, заводи задачу на 92-95 но ща еще накину что делать в новую задачу

The rows come from the application's session, retold without the application's names:

> 92. rt-dynamic-selector-popup: titleWrap должен действовать и на пункты окна. При titleWrap: false
>     (вход селектора и поле в provideRtKit) подпись пункта окна идёт одной строкой с многоточием; если
>     подпись обрезана, при наведении показывается подсказка с полным текстом. Так было в v1.
>
> 93. Вход searchRadius (тип радиуса кита, full — пилюля). Передаётся в rt-input поля поиска.
>
> 94. Подсветка символов подписи пункта, совпавших с поиском. Вход highlightSearch: boolean; цвет и
>     насыщенность — токены --rt-dynamic-selector-popup-highlight-*. Работает вместе с многоточием из
>     пункта 92.
>
> 95. Кнопка применения: applyLabel: string — своя подпись, например «Submit», как в v1;
>     applyLabelCase: 'none' | 'title' | 'upper' — регистр подписи, по умолчанию как сейчас.

Rows 93–95 hold for both: each passes from `rt-dynamic-selector` and is set in
`provideRtKit({ components: { dynamicSelector } })`; an input at the place wins over the settings.

## What the tree already has

- Row 92 is written in the tree outside history: the popup takes `titleWrap`, a cut label shows a
  tooltip, its spec `rt-dynamic-selector-popup-wrap.spec.ts` passes 4 of 4.
- The kit settings section `dynamicSelector` reads six fields through `rtKitDefault`.
- `rt-input` takes a radius step; the apply button is a kit button with the kit label.

## What the rules already say

- The default look and behaviour of the second kit do not move: every new input defaults to what is
  drawn today.
- A new property is read as `var(--handle, var(--handle-default))` and registered in the handles list.

## Questions and answers

**Take rows 92–95 into a task of their own?**
«да, заводи задачу на 92-95»

**What else goes into the task?** The owner's list, verbatim for rows 96–99:

> 96. Фокус в поле поиска при открытии окна: вход autofocusSearch: boolean, умолчание кита false.
>     Сейчас фокус остаётся на элементе, открывшем окно.
> 97. Токены пункта: --rt-dynamic-selector-popup-option-line-height,
>     --rt-dynamic-selector-popup-option-min-height. Сейчас строка подписи 14px, в v1 20px при высоте
>     пункта 36px.
> 98. Токен --rt-dynamic-selector-popup-empty-gap — зазор между иконкой и подписью пустого
>     результата. Сейчас 20px (рамка иконки 64px вокруг глифа 48px + отступ), в v1 16px.
> 99. Токен --rt-dynamic-selector-popup-foot-padding. Сейчас зашит 8px 16px 0, в v1 16px 24px 0 8px.

**What comes after the PR opened?** The owner's list, verbatim for rows 100–102, and the word on
closing:

> 100. rt-input: вход radius действует и при appearance="fill". […] Нужно: при заданном radius у
>      fill все четыре угла из --rt-input-box-radius, нижняя линия не рисуется. Без radius — как сейчас.
> 101. rt-input: вид appearance="pill" (значение 'pill' в IRtInput.Appearance). Скругление
>      --rt-radius-full на всех углах, заливка, нижней линии нет. Принимается в searchAppearance у
>      rt-dynamic-selector и в provideRtKit({ components: { dynamicSelector } }).
> 102. Дефект пунктов 92+97: пункты окна селектора стоят по центру строки по горизонтали. […]
>      Нужно: у __row--nowrap justify-content: flex-start.

> не спеши закрывать эту задачу после моего апрува

## Decisions

- **Rows 92–95 go as one task and one PR.** — the owner's word; all four touch the popup.
- **Rows 96–99 join this task.** — the owner sent the list of rows 92–99 into this task, as
  promised by «ща еще накину что делать в новую задачу».
- **Rows 100–102 go into the same PR #2647.** — the owner sent them after it opened; 100 and 102 are
  defects of rows 93 and 92+97. The number field shares the look type, so it gets the pill look and
  the fill fix too: it would otherwise take `pill` silently and draw a border.
- **The task stays open after the owner approves the PR.** — «не спеши закрывать эту задачу после
  моего апрува»: more rows may follow into it.

## What is left unclear

- The owner adds more rows; they are written into the progress as decisions along the way.

## Decisions along the way

- Rows 96 and 97 came from the application's session: the search field takes focus on opening
  (`autofocusSearch`, default `false` — the application agreed), and the option line height and
  minimum height become properties. The owner sent them into this task together with rows 98 and
  99: the gap of the empty result and the footer padding become properties. All four default to
  today's look and are done before step 5.1 closes.
- The popup minimum-height scenario of row 91 took SC-UKV-726, and the dense toolbar of RT-2639
  took the same number in main first: the spec check in main refuses. The row 91 scenario is
  renumbered SC-UKV-729 here; it has no test, only the heading moves.
- Matched characters are drawn semibold, and semibold glyphs are wider. In the narrow half of the
  showcase a label that fit on one line wraps once the highlight is on. The colour and the weight
  are properties: a caller who wants no width change sets the regular weight.
- Main took SC-UKV-727 for the dense toolbar in RT-2642, the number row 92 held here. The row 92
  scenario is renumbered SC-UKV-734 with its test titles. The assignments row of the copy stays as
  main has it, RT-2591: the merge must not rewrite a neighbour's assignment.
- The popup styles grew to 9.05 kB, past the 8 kB budget for one component style in the production
  builds of three applications. The row and option rules moved to a second style file of the
  popup; the main one builds at 6.77 kB. No rule changed, and the Popup frame stays the reference.
