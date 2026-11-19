# Scenarios — the link block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. SC-UKV-1500
merges into the scenarios of the tag.

### SC-UKV-1487 — the kit draws a link block without a registration

Given an answer with a `link` block and an application that registered a renderer for `link`
When the answer is drawn
Then the block is drawn by the kit as a card, and the registered renderer is not used

### SC-UKV-1488 — a link block without a title or an address is the plate

Given `link` blocks with no `title`, with `title: "  "`, with no `url` and with `url: 42`
When the answer is drawn
Then each is shown as the plate with the type name `link`

### SC-UKV-1489 — a malformed optional part is absent

Given a `link` block with `section: 7`, `icon: ""`, `state: "done"` and `reason: "Нет доступа"`
When the block is drawn
Then the card has no section line, its icon is `link`, its status is «Opened» and it draws no reason line

### SC-UKV-1490 — the pending card shows a spinner status and disabled buttons

Given a `link` block with `state: "pending"`
When the block is drawn
Then the status is a neutral tag `sm` with the `spinner` icon and the label «Opening»
And both buttons are disabled

### SC-UKV-1491 — the opened card shows a check status and enabled buttons

Given a `link` block with `state: "opened"`
When the block is drawn
Then the status is a success tag `sm` with the `check` icon and the label «Opened»
And both buttons are enabled

### SC-UKV-1492 — the failed card shows its reason under the status

Given a `link` block with `state: "failed"` and `reason: "Нет доступа к разделу «Отчёты»"`
When the block is drawn
Then the status is a danger tag `sm` with the `exclamation-circle` icon and the label «Failed to open»
And the reason line stands under the status in the error text colour
And both buttons are enabled
And the same block without a reason draws no reason line

### SC-UKV-1493 — a press of «Open» leaves the chat with the address

Given a chat with an answer `m1` holding a `link` block with `url: "/reports/sales?month=11"`
When the reader presses «Open»
Then the chat emits `linkOpen` with `{ messageId: "m1", url: "/reports/sales?month=11", newTab: false }`
And the card keeps its state

### SC-UKV-1494 — a press of «Open in new tab» asks for a new tab

Given the same chat
When the reader presses «Open in new tab» twice
Then the chat emits `linkOpen` twice with `newTab: true`

### SC-UKV-1495 — a new block redraws the status

Given a drawn `link` block with `state: "pending"`
When the block input is replaced by the same block with `state: "opened"`
Then the card shows «Opened» and both buttons are enabled
And the change of the status is announced by a polite live region

### SC-UKV-1496 — the answer copy gives the card as one line

Given an answer with a `link` block titled «Продажи за ноябрь», section «Отчёты · Продажи», address «/reports/sales» and `state: "failed"` with a reason
When the reader copies the answer
Then the copy holds the line «Продажи за ноябрь», TAB, «Отчёты · Продажи», TAB, «/reports/sales»
And it holds neither the status nor the reason
And a block without a section gives an empty field between two tabs

### SC-UKV-1497 — the JSON schema requires the title and the address

Given the exported schema of the link block
When a block with `title`, `url` and `state: "pending"` and a block without `url` are validated
Then the first is accepted and the second is refused
And the schema names `state` as `pending`, `opened` or `failed`

### SC-UKV-1498 — a long title takes two lines with an ellipsis

Given a `link` block with a title and a section longer than the card, in a block 328 wide
When the block is drawn
Then the title takes two lines and ends with an ellipsis, the section takes one line with an ellipsis
And the buttons stand in one row on one top, and nothing goes past the card

Not covered: it cannot be closed by a test with an identifier — line clamping comes from the
styles, and the styles of the component do not reach the test environment. Held by the play steps
of the showcase story of the widths.

### SC-UKV-1499 — the card is a group named by its title

Given a `link` block titled «Продажи за ноябрь»
When the block is drawn
Then the card is a group whose accessible name is «Продажи за ноябрь»
And the icon of the card is hidden from a screen reader

### SC-UKV-1500 — the small tag keeps 4 between its icon and its label

Given an `rt-tag` of the size `sm` with an icon
When it is drawn
Then the gap between the icon and the label is 4

Not covered: it cannot be closed by a test with an identifier — the gap comes from the styles of
the tag. Held by the measurement of the showcase against the mockup and by the tag snapshots.
