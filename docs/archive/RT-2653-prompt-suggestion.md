# Grill

## The owner request

> реализуй весь набор компонентов в рамках ui-kit-v2, используй имеющиеся примитивы из ui-kit-v2 как это указано на макетах, если примитивов не хватает - пиши новые в соответствии с требованиями rt-tools гi-kit v2, собери молекулы и организымы которые необходимы для реализации ai chat, чат должен подключаться единым компонентом в приложение-потребитель

## What the tree already has

`rt-chip` and `rt-tag` are short labels without a trailing arrow and do not take full width.
`rtButton` centres its label. The mockup of the empty chat draws full-width cards: a grey plate,
the prompt text on the left, an arrow icon on the right.

## What the rules already say

`reuse-first`: the arrow is `rt-icon name="arrow-right"`, the card is a native `<button>`.

## Questions and answers

**One task or several?**
Эпик и задачи.

## Decisions

- **A part of its own** — no existing control has a full-width label with a trailing icon.
  Rejected: an appearance of `rtButton`.

## What is left unclear

- Nothing blocks the work.
