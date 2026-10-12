# Grill

## The owner request

> заводи задачу на улучшение ui/ux для ai chat и бери в работу, нужно красиво показывать статус работы модели, так же как это сейчас сделано в claude desktop

> реализуй весь набор компонентов в рамках ui-kit-v2, используй имеющиеся примитивы из ui-kit-v2 как это указано на макетах, если примитивов не хватает - пиши новые в соответствии с требованиями rt-tools гi-kit v2, собери молекулы и организымы которые необходимы для реализации ai chat, чат должен подключаться единым компонентом в приложение-потребитель

## What the tree already has

`rt-timeline` draws a list of steps with dots; `rt-spinner`, `rt-icon` and `[rtTooltip]` exist. No
component shows the state of a whole AI run. The mockup «AI Run Status» (Figma file of the second
kit, page «AI-чат — макеты») has four states × closed/open: a 16px mark, the label with a running
highlight while working, the meta, the chevron with the tooltip «Show steps» / «Hide steps», and the
timeline under it.

## What the rules already say

`reuse-first`: the steps are the kit's timeline, the mark is the kit's icon and spinner.
`rt-tools-styling`: a box-shadow is a component token.

## Questions and answers

**One task or several?**
Эпик и задачи.

## Decisions

- **The whole line is the button when there are steps** — the chevron alone is a 16px target.
  Rejected: an icon button for the chevron — it has no `aria-expanded` input.
- **The label colours come from the state, the highlight is a text gradient** — the mockup binds it
  from the muted text to the primary action.

## What is left unclear

- Nothing blocks the work.
