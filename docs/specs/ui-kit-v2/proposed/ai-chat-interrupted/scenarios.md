# Scenarios — the interrupted answer of the assistant chat

The numbers continue the numbering of the kit, from SC-UKV-1563, and do not change after the merge.
Until a scenario is covered, it carries the mark «Not covered» with the reason.

### SC-UKV-1563 — a partial answer draws its text, the label and the action

Given a chat with an answer `m1` with one markdown block «Продажи за ноябрь выросли на» and `interrupted: true`
When the answer is drawn
Then the block is drawn as text
And under it stands the label «Answer interrupted»
And under the label stands the row «Copy», the button «Ask again» with the icon `sync`, and the rating, in this order

Covered by the component spec of the interrupted answer.

### SC-UKV-1564 — an empty interrupted answer draws only the label and the action

Given a chat with an answer `m1` with `blocks: []`, no run and `interrupted: true`
When the answer is drawn
Then the label «Answer interrupted» is drawn, and under it a row with the button «Ask again» alone
And no area of blocks, no plate, no «Copy» and no rating are drawn

Covered by the component spec of the interrupted answer.

### SC-UKV-1565 — an empty interrupted answer keeps its run line and attachments

Given a chat with an attachments template and an answer with `blocks: []`, a run in the state «stopped» and `interrupted: true`
When the answer is drawn
Then the run line stands first, the attachments under it, and the label and the action under them
And nothing else is drawn between the attachments and the label

Covered by the component spec of the interrupted answer.

### SC-UKV-1566 — an answer without the flag draws no label

Given three answers: without `interrupted`, with `interrupted: false`, and with a run in the state «failed» and no flag
When they are drawn
Then none of them draws the label «Answer interrupted» or the button «Ask again»

Covered by the component spec of the interrupted answer.

### SC-UKV-1567 — a press on the action emits `askAgain` with the id of the answer

Given a chat with an interrupted answer `m1`
When the reader presses «Ask again», then presses it again
Then the chat emits `askAgain` with `"m1"` twice
And the chat emits neither `retry` nor `send`
And the answer keeps its label and its action

Covered by the component spec of the interrupted answer.

### SC-UKV-1568 — the action is disabled while sending

Given a chat with `sending` and an interrupted answer `m1`
When the reader presses «Ask again»
Then the button is disabled natively and the chat emits no `askAgain`
And the Tab key passes the button
And after `sending` turns off, a press emits `askAgain` with `"m1"`

Covered by the component spec of the interrupted answer.

### SC-UKV-1569 — a streaming answer shows no label until the stream ends

Given an answer `m1` with one block, `streaming: true` and `interrupted: true`
When it is drawn
Then neither the label nor the action is drawn
And after `messages` is replaced by a copy where `m1` has no `streaming`, the label and the action are drawn

Covered by the component spec of the interrupted answer.

### SC-UKV-1570 — a partial answer keeps «Copy» and the rating

Given an interrupted answer `m1` with a markdown block
When the reader presses «Good answer»
Then the chat emits `feedbackChange` with `{ messageId: "m1", feedback: "liked" }`

Covered by the component spec of the interrupted answer.

### SC-UKV-1571 — the copy of a partial answer leaves the label out

Given an interrupted answer with a markdown block «Продажи за ноябрь выросли на»
When the reader copies the answer
Then the copy is «Продажи за ноябрь выросли на»
And it holds neither «Answer interrupted» nor «Ask again»

Covered by the component spec of the interrupted answer.

### SC-UKV-1572 — the run error keeps its own action

Given a chat with an interrupted answer `m1` and a retryable run error
When the reader presses «Ask again» of the error strip, then «Ask again» of the answer
Then the first press emits `retry` with no value and no `askAgain`
And the second press emits `askAgain` with `"m1"` and no `retry`

Covered by the component spec of the interrupted answer.

### SC-UKV-1573 — several interrupted answers name their own ids

Given a chat with interrupted answers `m1` and `m3` and a whole answer `m2` between them
When the reader presses «Ask again» of `m3`, then of `m1`
Then the chat emits `askAgain` with `"m3"`, then with `"m1"`
And `m2` draws no label

Covered by the component spec of the interrupted answer.

### SC-UKV-1574 — a screen reader hears the label and the named action

Given a chat with two interrupted answers whose ids are «m 1» and «m/1»
When a screen reader reads them
Then the label has no live region of its own and stands inside the polite live region of the feed
And each action is a button named «Ask again» and described by the label of its own answer
And the two description ids differ and hold neither a space nor a slash
And the icon of each action is hidden from the reader
And each action carries the tooltip «Ask again», which the kit button shows on hover and on keyboard focus

Covered by the component spec of the interrupted answer.

### SC-UKV-1575 — the labels come from the kit translator

Given a kit translator that gives «Ответ прерван» and «Спросить снова»
When an interrupted answer is drawn
Then the label reads «Ответ прерван» and the button is named «Спросить снова»

Covered by the component spec of the interrupted answer.

### SC-UKV-1576 — the label and the action fit a narrow panel

Given a partial answer and an empty interrupted answer in a chat 240, 328, 386 and 640 wide, with the English and with the Russian labels
When they are drawn
Then at each width the label stands in one line and the row of actions in one line, and neither widens the feed
And at 240 the focus ring of the focused action is not clipped

Covered by the play step of the showcase story `Widths`: the row and the ring come from the
styles, and the styles of the component do not reach the test environment.

### SC-UKV-1577 — right to left mirrors the label and the row

Given an interrupted answer under `dir="rtl"`
When it is drawn
Then the label starts at the right, «Copy» stands at the right of the row and the action follows it to the left

Covered by the play step of the showcase story `Rtl`: the order comes from the styles.

### SC-UKV-1578 — the label is drawn while the run line says running

Given an answer with one block, a run in the state «running», no `streaming` and `interrupted: true`
When it is drawn
Then the run line shows its state as given
And the label and the action are drawn under the block

Covered by the component spec of the interrupted answer.

### SC-UKV-1579 — a partial answer without text or with the copy off keeps the rating alone

Given an interrupted answer whose only block is a renderer block with no text function, and a chat with copy turned off holding an interrupted answer with a markdown block
When they are drawn
Then each shows the label, the action and the rating
And neither shows «Copy»

Covered by the component spec of the interrupted answer.

### SC-UKV-1580 — the showcase draws both interrupted answers

Given the showcase story of the interrupted answer, with a partial answer and an empty interrupted answer
When its play step runs, in the light and in the dark theme
Then the step finds the label «Answer interrupted» and the button «Ask again» under each answer
And the dark rows draw the same row in the dark palette

Covered by the play step of the showcase story `Themes`.
