# The interrupted answer of the assistant chat

**Status:** proposed · **Revision:** 2026-11-20 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the answer, its copy and rating, the outputs of the chat, the
run error with «Ask again»), the run status of the kit (the run line above an answer)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A product agreement written before the code, by task RT-3341. It is about one flag of an assistant
message of `rt-ai-chat`: the label under an answer that broke off, the action «Ask again» of that
answer and the output of the chat that carries the press. It merges into the kit spec as the
subdomain `ai-chat-interrupted`, next to `ai-chat`, with the same scenario numbers. The mockup is
drawn and waits for the owner's approval.

## Why

An answer cut by a lost connection or by a cancel on the server comes back empty or truncated, with
no mark. The person reads a half of an answer as the whole one, or sees nothing, and has no way to
ask again from the answer itself. The chat-level run error does not help: it describes the last run
only and is gone from the history. The kit gets a flag on the answer: the answer shows that it is
incomplete and offers «Ask again», and the press leaves the chat as an event with the id of that
answer. The kit does not detect the break and does not send anything again: the application sets the
flag and handles the event.

## Terminology

- **The interrupted answer** — an assistant message with `interrupted: true`.
- **The partial answer** — an interrupted answer with at least one block.
- **The empty interrupted answer** — an interrupted answer with no block.
- **The interrupted label** — the text «Answer interrupted» under an interrupted answer.
- **The action of the answer** — the button «Ask again» next to the interrupted label.
- **The ask again event** — what the chat emits on a press of the action of an answer: the id of the
  answer.

Terms of the chat — the answer, the block, the run, the run error, the rating, the copy — are
declared by `docs/specs/ui-kit-v2/ai-chat/` and are not declared again here.

### What it is called in the interface

| In the domain         | On the screen                                                            |
| --------------------- | ------------------------------------------------------------------------ |
| The interrupted label | the muted line «Answer interrupted» under the answer                     |
| The action            | the text button «Ask again» with the icon `sync` after the label         |
| The partial answer    | the blocks drawn so far, then the label and the action                   |
| The empty interrupted | the run line and the attachments if given, then the label and the action |

## Rules

### The flag

- **An assistant message has the optional field `interrupted`; `true` makes the answer interrupted, and an absent field or `false` draws the answer as before.**

- **The kit does not set the flag, does not derive it from the run state and does not clear it.** The application sets it, and a run line in the state «stopped» or «failed» draws no label by itself.

- **The label is drawn whatever the run state, `running` included.** The run line is the application's to set; the kit does not reconcile it with the flag.

- **While `streaming` is `true`, an interrupted answer draws neither the label nor the action; they appear once `streaming` is no longer `true`.** An answer that is still being written is not yet broken off.

### The label and the action

- **An interrupted answer draws the interrupted label and the action «Ask again» in one row under its blocks and its attachments, above the row of «Copy» and the rating.** The answer's gap of 8 stands on each side of the row.

- **A partial answer draws its blocks as given, and the label and the action under them.** The blocks are drawn by the rules of the chat and of their own subdomains; the flag changes none of them.

- **An empty interrupted answer draws the run line when it has one, then the consumer's attachments, then the label and the action.** Nothing is drawn between them and the label: no blocks container, no placeholder box.

- **The label is a quiet line: muted 12 px text, with no icon before it, no strip and no plate.**

- **The action is the kit text button of the primary colour, size `sm`, with the icon `sync` and the label «Ask again».** It stands 8 after the label and is the same button as the action of the run error; the kit adds no second look of the same action.

- **The action shows the kit hover tint and the kit focus ring of its theme, and the kit disabled text colour when disabled; the focus ring is not clipped.** The light theme gives primary at 8% and a 3 px ring of primary at 24%, the dark theme primary at 16% and a ring at 32%. The label stays muted while the action is disabled.

- **The label «Answer interrupted» is a new kit label; the label of the action is the existing kit label of «Ask again».**

### The event

- **A press on the action makes `rt-ai-chat` emit `askAgain` with the id of that answer.** The event travels answer → chat, as `feedbackChange` does.

- **The chat emits `askAgain` on every press; the kit does not merge repeated presses, does not change the answer and does not hide the action.** The answer keeps the label and the action until the application changes the message.

- **While the chat input `sending` is `true`, the action is disabled natively and a press emits nothing.** It leaves the order of the Tab key, as the action of the run error does.

- **A press on the action emits neither `retry` nor `send`, and the kit sends no question by itself.**

### The run error stays as it is

- **The input `error` and the output `retry` of the chat keep their shape and behaviour: `retry` carries no id, the error strip stands under the feed and describes the last run only.**

- **The flag of an answer and the run error are independent: the kit draws both when both are given, and each action emits its own output.** The application decides which of them to give.

### Copy and rating

- **A partial answer keeps «Copy» and the rating by the rules of the chat: they appear once the answer is no longer written.** A partial answer whose blocks give no text, or a chat with the copy turned off, shows the rating without «Copy», as any answer does.

- **The copy of a partial answer is the text of its blocks, as for any answer; the interrupted label and «Ask again» do not go into the copy.**

- **An empty interrupted answer shows neither «Copy» nor the rating.** It has nothing to copy or rate.

### Accessibility

- **The label has no live region of its own; the feed of the chat is a polite live region and announces the label when it appears on an answer already drawn.** It appears so when the flag arrives or the stream ends. A history loaded at once is announced only as far as the feed announces it.

- **The action is a button named «Ask again» and described by the interrupted label.** A reader that meets several actions in the feed hears what each one is about.

- **The id that links the action to its label is unique per drawn answer and does not depend on the characters of the message id.**

- **The icon of the action is hidden from a screen reader.**

- **The kit does not move the focus on a press of the action.** When the focused action becomes disabled or disappears, the focus falls to the page, as with the action of the run error.

### Layout

- **The label and the action take the width of the answer and never widen the feed.**

- **At the widths 328, 386 and 640 the label and the action stand in one row, with the English and with the Russian labels.** Only in a narrower answer the action goes under the label, and the label wraps rather than ends with an ellipsis.

- **Under `dir="rtl"` the row mirrors: the label starts at the right and the action follows it to the left; the icon `sync` is drawn as it is.**

- **The drawn values are the ones of the approved mockup and are the same at the widths 328, 386 and 640; in the dark theme only the colours change.**

## What is out of scope

- Detecting a break: a lost connection, a cancel on the server, a timeout. The application sets the
  flag.
- Sending the question again, choosing which question to resend, and replacing or removing the
  interrupted answer: the application does it by the event.
- A reason of the break, a reference id or a message text on the answer: the run error carries
  them for the last run.
- A per-message sign that the answer cannot be asked again.
- A change of `retry`, `error` or `IRtAiChat.RunError`.
- Moving the focus after a press, for this action and for the action of the run error alike.
- Translations of the label beyond the kit English set and the showcase Russian set: an application
  gives its own, as for every kit label.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The flag is read from the message the consumer gives and is kept nowhere by the kit. Of an assistant
message, `IRtAiChat.AssistantMessage`:

- `interrupted` — optional, `boolean`; `true` makes the answer interrupted.

The ask again event of the output `askAgain` is the id of the answer, a `string`, as `selectThread`
gives the id of a conversation.

## Screens and states

| state                        | what is drawn                                                        |
| ---------------------------- | -------------------------------------------------------------------- |
| partial                      | the blocks, the label and the action, «Copy» and the rating          |
| empty interrupted            | the label and the action, no blocks, no «Copy», no rating            |
| empty interrupted with a run | the run line, the attachments if given, the label and the action     |
| streaming and interrupted    | the answer as it is being written, no label, no action               |
| hover                        | the action with the kit hover tint of its theme: primary 8% light, 16% dark |
| focus from the keyboard      | the action with the kit ring of its theme, 3 px: primary 24% light, 32% dark, not clipped |
| disabled, while sending      | the action in the kit disabled text colour; the label stays muted   |
| with the run error           | the answer with its label and action, the error strip under the feed |
| narrow, 328                  | the label and the action in one row                                  |
| narrower than 328            | the action under the label                                           |
| right to left                | the label at the right, the action after it to the left              |
| dark theme                   | the same row in the dark palette                                     |

The drawn values of every row are the ones of the approved mockup.

## Cross-cutting requirements

### Locales

The label «Answer interrupted» is a new kit label: English in the kit set, Russian «Ответ прерван»
in the showcase set, any other from the application. «Ask again» is the existing kit label of the
action of the run error.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow panel is the mobile width of the chat: at 328 the label and the action still stand in one
row, and neither widens the feed. The values are the ones of the approved mockup.

### Several objects

Several interrupted answers in one feed each draw their own label and action. Each action is
described by the label of its own answer, and each press names its own answer.

## Decisions

- **The flag is `interrupted` on `IRtAiChat.AssistantMessage`** — the task card names
  `IRtAiChat.Message`, which is the union of a question and an answer; only an answer can break off,
  so the field stands next to `streaming` and `feedback`.
- **The event is a new output `askAgain` with the id of the answer, not `retry`** — `retry` carries no
  id and belongs to the run error; adding the id would change the payload of a published output.
  Decided in the grill.
- **The payload is the bare id** — `selectThread` and `deleteThread` give a bare id; an object is
  kept for events that carry more than the id.
- **The action reuses the label «Ask again» and the look of the action of the run error** — decided
  in the grill; the sample of the approach is the row of the run error and the failed state of the
  link block.
- **The kit neither detects nor resends** — decided in the grill.
- **A partial answer keeps «Copy» and the rating, an empty one has neither** — decided in the grill;
  the existing rule «the rating appears once the answer has a block» already gives the second half.
- **The look is a quiet line, not a strip** — closed by the mockup
  <https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8451-922>. The label is muted 12 px
  text; 8 after it stands the primary text button `sm` with `sync`, 32 high with a radius of 10 —
  160 wide with the Russian label, about 118 with the English one.
  The mockup waits for the owner's approval.
- **The disabled state comes from a new input `sending` of the answer, bound from the chat's
  `sending`** — the action is disabled natively, as the action of the run error is, and leaves the
  order of the Tab key.
- **The focus is not moved** — when the focused action becomes disabled or disappears, the focus
  falls to the page. Accepted: the action of the run error behaves the same today.
- **Streaming hides the label** — closed by assumption, the owner may reverse it.
- **The label stays out of the copy** — closed by assumption, the owner may reverse it.
- **An interrupted answer and a retryable run error are both drawn, with two «Ask again»** — closed
  by assumption, the owner may reverse it; the application decides which to give.
- **The label relies on the live region of the feed** — the feed already announces politely what
  appears in it; a second region would announce the label twice.
- **On the merge, the run error term of the chat spec reads «the last run failed»** — the term in
  `docs/specs/ui-kit-v2/ai-chat/spec.md` says «the answer broke off», and «broke off» belongs to the
  interrupted answer.
- **The mockup comes before the code** — the rule of a visible kit edit; the owner approves the
  mockup and the showcase.

## Open questions

- **Q-1.** The owner's approval of the mockup
  <https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8451-922>; the drawn values in the
  rules above are the ones of that mockup.

## History of changes

- 2026-11-20 — the agreement written for RT-3341 from the grill; the mockup is not drawn.
- 2026-11-20 — the look closed by the mockup, the disabled state and the focus decided, three
  questions closed by assumption; the label relies on the live region of the feed.
