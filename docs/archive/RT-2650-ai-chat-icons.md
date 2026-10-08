# Grill

## The owner request

> сделай реализацию по макетам внтури rt-tools в ui-kit-v2, затем используй это на avalon

> реализуй весь набор компонентов в рамках ui-kit-v2, используй имеющиеся примитивы из ui-kit-v2 как это указано на макетах, если примитивов не хватает - пиши новые в соответствии с требованиями rt-tools гi-kit v2, собери молекулы и организымы которые необходимы для реализации ai chat, чат должен подключаться единым компонентом в приложение-потребитель

## What the tree already has

The mockups of the assistant chat use the Material glyphs `auto_awesome`, `thumb_up` and `thumb_down`.
The kit set has none of them, and `rt-icon-material-map.ts` has no pair for them, so a glyph falls
to the font ligature, which the kit does not ship. The last addition of drawn icons is RT-2440
(commit 1b4be9b39): own drawing in `assets/icons`, the Material drawing fetched by
`tools/fetch-material-icons.mjs`, a pair in the map.

## What the rules already say

`check-icon-map` demands an own drawing and a Material drawing for every pair, and no unused
Material drawing.

## Questions and answers

**The kit has no auto_awesome, thumb_up, thumb_down. What to do?**
Добавить SVG в кит (Recommended).

**One task or several?**
Эпик и задачи.

## Decisions

- **Own drawings are stroked at 1.94 with round caps** — the drawn icons of RT-2440 are drawn so.
  Rejected: copying the Material drawing into the own set — two sets would look the same.
- **`thumb-down` is `thumb-up` turned by 180°** — the Material pair is drawn the same way.

## What is left unclear

- Nothing blocks the work.
