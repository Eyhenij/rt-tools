# Grill

## The owner request

> оработка rt-icon-button (@rt-tools/ui-kit-v2)
>
> Условие: умолчания = текущее поведение v2.
>
> 1. Размер и фон переопределяются с host.
>    Сейчас модификаторы размера (--sm, --md, …) и variant (--secondary, …) объявляют --rt-icon-button-size и
>    --rt-icon-button-bg на внутренней <button>, и значение, заданное на <rt-icon-button>, до кнопки не доходит.
>    Сделать: модификаторы пишут шаг в приватные свойства (--_rt-icon-button-size-step, --_rt-icon-button-bg-variant), а
>    width/height/background кнопки читают:
>    width/height: var(--rt-icon-button-size, var(--_rt-icon-button-size-step))
>    background: var(--rt-icon-button-bg, var(--_rt-icon-button-bg-variant))
>    Hover: var(--rt-icon-button-bg-hover, <текущий hover фона variant>).
>
> 2. size: добавить 'xs' = 22px и '2xs' = 20px, иконка в обоих — 16px.

The request came mid-way through the epic RT-2472 and is a task of that epic.

## What the tree already has

- The host tag declares `--rt-icon-button-size` with the md step; the size modifiers on the inner
  button declare it again, so a value set on the tag never reaches the button.
- The inner button declares `--rt-icon-button-bg: transparent`, and the primary and secondary kinds
  reassign it there. Each kind writes its hover background directly in its hover rule.
- Kit components (pagination, the data table, its cells and filter cell, the list settings panel)
  set `--rt-icon-button-size` on the inner button itself; that keeps working.
- The header sets `style="--rt-icon-button-size: 35px"` on two of its icon buttons. Measured in the
  showcase: those buttons draw 40 by 40 today, so the value has never worked.
- The size scale has a 20 px step (`--rt-size-5`) and no 22 px step; the icon's `sm` is 16 px.

## Decisions

- **The technique is the owner's: private step properties written by the modifiers, read under the
  public properties.** A value on the tag or on the page root then reaches the button, and kit
  components that set the property on the button keep winning.
- **The public properties become consumer handles.** They are named on the Theming page.
- **The header loses its dead `35px` override.** The owner's condition is that defaults stay as
  they are, and the header draws 40 today; with the fix the override would shrink it.
- **`2xs` takes the scale step `--rt-size-5`; `xs` is 22 px written in place.** The scale has no
  22 px step, and one step for one button would not lie on its 4 px grid.
