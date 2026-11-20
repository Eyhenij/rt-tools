# Grill

## The owner request

> Делай эпик дальше

> Бери RT-3341

The task card, verbatim in substance: an answer cut by a lost connection or a cancel on the server
comes back empty or truncated with no mark. The person does not know the answer is incomplete and
cannot ask again from the message itself. The kit needs the flag `interrupted` on
`IRtAiChat.Message`: under the answer the label «answer interrupted» and the action `Ask again`. The
partial text is shown together with the label. An empty interrupted answer shows only the label and
the action, without an empty bubble. Done when an interrupted answer with text and without text is
drawn with the label, `Ask again` emits an event with the message id, and the showcase has both
stories.

## What the tree already has

- **A chat-level run error exists.** `IRtAiChat.RunError` (`rt-ai-chat.model.ts:227`) and the input
  `error` of `rt-ai-chat` draw one alert strip under the feed: `rt-message` with severity danger,
  the reference id with a copy button, and a text button `Ask again` (label key `aiRetry`) that
  emits `retry` without a message id (`rt-ai-chat.component.html:129-147`). It describes the last
  run only; it is not stored on a message and is gone from the history.
- **The label `Ask again` is already in the dictionary** — `aiRetry` in `rt-kit-labels.en.ts:60`.
  The label «answer interrupted» is not there.
- **The assistant message** has `blocks`, `run`, `streaming` and `feedback`
  (`rt-ai-chat.model.ts:215-222`); no flag about an incomplete answer.
- **Events of a message reach the chat** by the same path as `linkOpen` and `sourceOpen`: the answer
  emits, `rt-ai-chat` adds the message id (`rt-ai-chat.component.html:124-125`).
- **The epic plan** puts the task as step 10 and the milestone G2: the published kit draws an answer
  with the interrupted label without an application template; the sign is the showcase story.
- The last scenario number in the kit spec is `SC-UKV-1562`.

## What the rules already say

- A visible kit edit goes by the rule `kit-approval`: a Figma mockup and the owner's approval before
  the code, then the showcase matched against the mockup and approved too.
- The match with the mockup covers the hover and focus states and clipping, not only the rest state
  — the finding of RT-3340 written next to the epic plan.

## Questions and answers

The owner took the recommended option twice in a row in this session («Разрешаю строку E2E-skip
(Recommended)», «Бери RT-3341 (Recommended)»), so the six questions are closed by assumption and
written below as decisions.

## Decisions

- **Behaviour changes: a product agreement is written** — a new flag, a new label and a new event of
  the chat.
- **No edit of a law or a rule** — the work is a kit component.
- **One task** — the flag, the label, the action and the event do not roll back apart.
- **The event is a new output `askAgain` of `rt-ai-chat` with the message id**, not the existing
  `retry`: `retry` carries no id and belongs to the chat-level error. Rejected: adding the id to
  `retry` — that changes the payload of a published output.
- **The label of the action is the existing `aiRetry` («Ask again»)**; a new key for the label
  «answer interrupted» is added to the English dictionary and the showcase Russian one.
- **The kit does not detect the interruption and does not resend.** The application sets the flag
  and handles the event. The chat-level `error` stays as it is.
- **The partial answer keeps copy and feedback; an empty interrupted answer has neither** — there is
  nothing to copy or rate.
- **Sample of the approach** — the chat-level error row (`aiRetry`, a text button with the icon
  `sync`) and the failed state of the link block.

- **The look: a quiet line and the action as an icon in the row of «Copy» and the rating** — the
  owner answered «Метка плашкой», then «Посмотри как сделано в других нормальных зарнесах», then,
  from the options «Как в других чатах» and «Оставить плашку», chose «Как в других чатах
  (Recommended)». The mockup approved: «Одобряю макет (Recommended)».
- **An empty interrupted answer keeps its run line** — the owner answered «Строка хода остаётся
  (Recommended)»: the rule «only the label and the action» speaks of the blocks, the run line above
  them stays as given.
- **The plan is taken by assumption** — the owner took the recommended option twice in a row, and
  the grill guard refuses a third menu. The plan is not committed until the owner's word on it: a
  plan goes into history only after the owner approves it.

## What is left unclear

Nothing: the look is closed by the approved mockup.
