# Grill

## The owner request

> добавь копку копирования для ref id в ошибках и подсвети строки id бэкграундом

> реализуй весь набор компонентов в рамках ui-kit-v2, используй имеющиеся примитивы из ui-kit-v2 как это указано на макетах, если примитивов не хватает - пиши новые в соответствии с требованиями rt-tools гi-kit v2, собери молекулы и организымы которые необходимы для реализации ai chat, чат должен подключаться единым компонентом в приложение-потребитель

## What the tree already has

`rt-copy-cell` copies inside a table cell: its button shows on row hover and it lives in the table
entry. `rt-aside-error-box` copies an error report. The mockup of the failed answer draws
«Reference», the id on a grey plate, and a copy icon button with the tooltip «Copy reference».

## What the rules already say

`reuse-first`: the button is `rt-icon-button`, the labels «Copy» / «Copied» are kit labels
`uiCopy` / `uiCopied`.

## Questions and answers

**One task or several?**
Эпик и задачи.

## Decisions

- **A part of its own** — the copy cell hides its button until hover and pulls the table entry.
  Rejected: a mode of `rt-copy-cell`.

## What is left unclear

- Nothing blocks the work.
