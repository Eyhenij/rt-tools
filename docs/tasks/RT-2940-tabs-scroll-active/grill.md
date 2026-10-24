# Grill

## The owner request

> Сделай задачу https://github.com/Eyhenij/rt-tools/issues/2940 в этом репозитории, по его
> собственным правилам (CLAUDE.md, ветки, коммиты, PR).

The task came from the session that works on the consumer side. Its words, quoted from the brief:

> На ширине 375 полоса стоит в начале, а выбранная вкладка за правым краем, и человек не видит,
> где он. Потребитель обходить это своей разметкой не будет: починка только в ките. Версии
> 0.31.0, 0.32.0 и 0.33.0 ведут себя одинаково.

## What the tree already has

- `rt-tabs` scrolls the strip only from `selectTab`, that is on a click or a key. `afterNextRender`
  calls only the arrow visibility update.
- The scroll arrows are laid over the strip absolutely and hidden by `visibility`, so their width
  is measurable while hidden.
- The tab offset is read by `offsetLeft`, and the offset parent is the strip wrapper, not the
  scrolled strip. Measured by layout rect differences instead, it does not depend on that.
- The tabs have no subdomain spec in `docs/specs/ui-kit-v2/` yet.

## What the rules already say

- DOM work after a render goes through `afterNextRender` or an after-render effect.
- A spec scenario is bound to a test by its number in the test title.

## Questions and answers

All six questions are closed by the task body and by the brief.

- **Does the task change behaviour** — yes: the strip scrolls without a click. Closed by the task
  body.
- **Does it need an edit of a law or a rule** — no. Closed by assumption: the work touches one kit
  component.
- **One task or several** — one. Closed by the task body.
- **What is not part of the task** — the vertical direction, a smooth scroll, the consumer's code.
  Closed by assumption.
- **What will show that the task is closed** — the component test covers the initial `activeId` on
  the last tab and an outside change of `activeId` on a narrow strip. Closed by the brief.
- **Is there a sample** — the existing `#scrollTabIntoView`. Closed by the task body.

## Decisions

- **The initial scroll runs in `afterNextRender`, a later outside change by an after-render
  effect.** The task body asks for the first. Both remember the tab they last scrolled to, so a
  click scrolls once. Rejected: an effect alone — the task names `afterNextRender`.
- **A tab next to an arrow is scrolled past the arrow width.** The arrows lie over the strip, and a
  tab under one is not seen whole.

## What is left unclear

- Nothing blocks the work.
