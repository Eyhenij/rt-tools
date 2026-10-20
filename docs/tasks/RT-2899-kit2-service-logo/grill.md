# Grill

## The owner request

> нужно завести отдельный компонент в ui-kit v2 и написать под него тесты и сторибук, заведи
> отдельные макеты в design system под эти лого в атомах

> предусмотри разные размеры для service logo в макетах design system

Asked where the component is made, the owner chose the answer «Делаю сам в своей копии кита» and
then named the copy: «работай в rt-worktree-2».

## What the tree already has

- `rt-logo` draws the application's own wordmark from style properties. It is a different subject:
  one picture, no circle, no row of several.
- `rt-icon` draws a kit icon by name. A payment method without a company of its own (a transfer,
  cash) takes such an icon inside the circle.
- The design system file holds the atom «Service Logo» (component set `6928:14363`) with the
  properties `Count` 1–3 and `Size` sm, md, lg, and a page «Service Logos» with the marks
  themselves. The atom description names the selector `rt-service-logo`.

## What the rules already say

- A new kit part comes with its spec, a unit spec, a visual snapshot, a story and an overview page:
  rules `ui-component-tests`, `rt-tools-storybook`.
- Sizes, colours and shadows go through tokens, not raw values: rule `rt-tools-styling`.

## Questions and answers

**Where is the component made?**
«Делаю сам в своей копии кита», and the copy is `rt-worktree-2`.

## Decisions

- **Numbers are taken from the atom.** Circle 40 / 64 / 96, mark 20 / 32 / 48, step between
  overlapping circles 24 / 40 / 60, shadow blur 24 / 40 / 56 of colour `#181818` at 15%, circle
  fill `#F5F6F8`. Rejected: a size picked by eye — the owner approved the atom, not a guess.
- **The kit carries no brand marks.** The application passes each mark as an image address with a
  label; the kit draws the circle. Rejected: a built-in set of company logos — they are someone
  else's trademarks and change on their owner's schedule.
- **A mark without an image is a kit icon.** The same item shape takes an icon name instead of an
  address. Rejected: a second component for icons — the circle and the row are the same.

## What is left unclear

- A row longer than three marks. The atom draws up to three; the component draws any number with
  the same step, and the consumer decides where to stop.
