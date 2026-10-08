# Grill

## The owner request

> реализуй весь набор компонентов в рамках ui-kit-v2, используй имеющиеся примитивы из ui-kit-v2 как это указано на макетах, если примитивов не хватает - пиши новые в соответствии с требованиями rt-tools гi-kit v2, собери молекулы и организымы которые необходимы для реализации ai chat, чат должен подключаться единым компонентом в приложение-потребитель

## What the tree already has

`rt-chat` draws a conversation of people. The assistant panel of the mockups draws a header with
full screen, conversations, new conversation and close; a feed of questions and answers with the
run line and the rating; an empty screen with suggestion cards; an error with a reference number;
the composer with Stop; the conversations in place of the feed or as a column. The parts are
`rt-ai-run-status`, `rt-copy-value`, `rt-prompt-suggestion` (RT-2651…2653), `rt-message-composer`,
`rt-thread-list`, `rt-markdown-text`, `rt-empty-state`, `rt-message`.

## What the rules already say

`reuse-first`: the organism is assembled from kit parts. The rich-editor entry holds what pulls
quill.

## Questions and answers

**One task or several?**
Эпик и задачи.

**How do charts and other attachments get into an answer?**
ng-template-слот.

## Decisions

- **Deleting a conversation is a row action of `rt-thread-list`** — a new
  `rtThreadListRowActions` template drawn beside the row button. Rejected: a button inside the
  row template, which nests a button in a button.
- **The answer is an inner component** — the organism template went over the cyclomatic limit.

## What is left unclear

- Nothing blocks the work.
