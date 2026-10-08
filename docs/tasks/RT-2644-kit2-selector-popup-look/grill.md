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

## Decisions

- **Rows 92–95 go as one task and one PR.** — the owner's word; all four touch the popup.

## What is left unclear

- The owner adds more rows; they are written into the progress as decisions along the way.
