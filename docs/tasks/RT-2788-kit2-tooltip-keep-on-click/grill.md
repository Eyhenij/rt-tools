# Grill

Work begun from a request of the application's session, not from intake cargo: no records to name.

## The owner request

> сделай в этот эпик, заасайни на меня

The request it points at, as the application's session wrote it:

> Приложение переходит с подсказок Material на подсказку второго кита и теряет её у кнопок-переключателей. Клик по хосту прячет панель `rt-tooltip-panel` и снимает таймер показа. Текст подсказки задаётся один раз при открытии. Поэтому после клика по переключателю («Включить/выключить», «Светлая/тёмная тема», «Закрепить/открепить», «Копировать → Скопировано») человек не видит подсказку с новым состоянием, пока не наведёт мышь заново. Подсказка Material не пряталась и меняла текст на месте.
>
> Что нужно:
>
> 1. Вход у `RtTooltipDirective`, например `rtTooltipHideOnClick`, по умолчанию `true`, как сейчас. При `false` клик не прячет открытую подсказку.
> 2. Смена текста `[rtTooltip]` при открытой панели меняет текст на месте.
> 3. На тач-устройствах поведение не меняется: касание (mouseenter + click) подсказку не показывает. Приложение на это опирается.
>
> Версия кита у приложения — 0.23.0. Приложение ждёт выпуска с этой правкой.

## What the tree already has

- `[rtTooltip]` hides on `click` unconditionally and sets the panel text once, in `#attach`.
- The subdomain `docs/specs/ui-kit-v2/tooltip-when-truncated/` already adds one input to the
  directive the same way — the sample for the shape of a new subdomain.
- `rt-icon-button` passes its `tooltip` input to `[rtTooltip]`; the application's toggles are
  icon buttons, so the new input is passed through there too.
- `rt-menu-item` carries the directive as a host directive; a menu closes on a click of its item,
  so it gets no passthrough.

## What the rules already say

- `angular-patterns`: signal inputs; an alias input with a meaningful default coerces a bare
  attribute itself — `booleanAttribute` gives `true` for an empty string, which is the default.
- `testing`: a scenario number at the start of the test title; a negative assertion goes with a
  positive one.

## Questions and answers

None asked: the request names the input, its default and the touch behaviour, and the owner said
to take it into the epic as it is.

## Decisions

- **The input is `rtTooltipHideOnClick`, default `true`.** — The name the request offers; the
  default keeps every present consumer unchanged. Rejected: a global setting — the request is per
  host.
- **A click with `false` still clears a pending show timer.** — A tap gives mouseenter and click
  together; the click cancelling the timer is what keeps touch without a tooltip.
- **A new text reaches an open panel by an effect on the text input.** — The panel already holds a
  signal for the text; the effect writes it and repositions the overlay. An empty new text hides
  the panel.
- **`rt-icon-button` gets `tooltipHideOnClick`.** — The toggles of the application are icon
  buttons, and the inner button is out of the consumer's reach.

## What is left unclear

- Nothing blocks the work.
