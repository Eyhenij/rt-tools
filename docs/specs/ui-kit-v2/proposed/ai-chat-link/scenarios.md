# Scenarios — the link block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. SC-UKV-1486 is
held by a neighbouring branch, so the numbering starts at 1487. SC-UKV-1500 and SC-UKV-1506 merge
into the scenarios of the tag.

### SC-UKV-1487 — the kit draws a link block without a registration

Given an answer with a `link` block and an application that registered a renderer for `link`
When the answer is drawn
Then the block is drawn by the kit as a card, and the registered renderer is not used

### SC-UKV-1488 — a link block without a title or an address is the plate

Given `link` blocks with no `title`, with `title: "  "`, with no `url` and with `url: 42`
When the answer is drawn
Then each is shown as the plate with the type name `link`

### SC-UKV-1489 — a malformed optional part is absent, and no state draws no status

Given a `link` block with `section: 7`, `icon: ""`, `state: "done"` and `reason: "Нет доступа"`
When the block is drawn
Then the card has no section line, its icon is `link`, it draws no status and no reason line
And both buttons are enabled
And the same block with `title: "  Продажи  "` and `url: " /reports "` draws «Продажи» and a press emits `url: "/reports"`

### SC-UKV-1490 — the pending card shows a spinner status and disabled buttons

Given a `link` block with `state: "pending"`
When the block is drawn
Then the status is a neutral tag `sm` with a turning `spinner` icon and the label «Opening»
And both buttons are `aria-disabled="true"`, and a press of either emits no `linkOpen`

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

### SC-UKV-1493 — a press of «Open» leaves the chat with the address, in the same call

Given a chat with an answer `m1` holding a `link` block with `url: "/reports/sales?month=11"`
When the reader presses «Open»
Then the chat emits `linkOpen` with `{ messageId: "m1", url: "/reports/sales?month=11", newTab: false }` before the click handler returns
And the card keeps its state

### SC-UKV-1494 — a press of «Open in new tab» asks for a new tab

Given the same chat
When the reader presses «Open in new tab» twice
Then the chat emits `linkOpen` twice with `{ messageId: "m1", url: "/reports/sales?month=11", newTab: true }`

### SC-UKV-1495 — a new answer redraws the status of the same card

Given a chat whose message `m1` holds a `pending` link block, and the reader's focus on its «Open»
When `messages` is replaced by a copy where that block has `state: "opened"`
Then the same card element shows «Opened» and both buttons are enabled
And the focus stays on «Open»
And the feed holds the text «<title>: Opened»
And a card drawn first as `failed` adds no such text

### SC-UKV-1496 — the answer copy gives the card as one line

Given an answer with a `link` block titled «Продажи за ноябрь», section «Отчёты · Продажи», address «/reports/sales» and `state: "failed"` with a reason
When the reader copies the answer
Then the copy holds the line «Продажи за ноябрь», TAB, «Отчёты · Продажи», TAB, «/reports/sales»
And it holds neither the status nor the reason
And a block without a section gives an empty field between two tabs
And a title with a tab and a line break inside writes both as spaces

### SC-UKV-1497 — the JSON schema holds what the model writes

Given the exported schema of the link block
When a block with `title`, `url`, `section` and `icon` and a block without `url` are validated
Then the first is accepted and the second is refused
And the schema names neither `state` nor `reason`
And the accepted block is drawn as a card with its title, section, icon and address

### SC-UKV-1498 — a long title takes two lines with an ellipsis

Given a `link` block with a title and a section longer than the card, in a block 328 wide
When the block is drawn
Then the title takes two lines and ends with an ellipsis, the section takes one line with an ellipsis
And the buttons stand in one row on one top, and nothing goes past the card or widens the feed

Not covered: it cannot be closed by a test with an identifier — line clamping comes from the
styles, and the styles of the component do not reach the test environment. Held by the play steps
of the showcase story of the widths.

### SC-UKV-1499 — the card is a group named by its title

Given a `link` block titled «Продажи за ноябрь»
When the block is drawn
Then the card is a group whose accessible name is «Продажи за ноябрь»
And the icon of the card is hidden from a screen reader

### SC-UKV-1500 — the small tag keeps 4 between all its parts

Given an `rt-tag` of the size `sm` with a start icon, an end icon and the cross
When it is drawn
Then the gap between each two neighbouring parts is 4

Not covered: it cannot be closed by a test with an identifier — the gap comes from the styles of
the tag. Held by the measurement of the showcase against the mockup and by the tag snapshots.

### SC-UKV-1501 — the labels come from the kit translator

Given a kit translator that gives «Открывается», «Открыта», «Не открылась», «Открыть» and «В новой вкладке»
When cards in the three states are drawn
Then the statuses and the buttons read those texts

### SC-UKV-1502 — several cards name their own address and message

Given an answer `m1` with two link blocks to «/a» and «/b» and an answer `m2` with one to «/c»
When the reader presses «Open» on each
Then the chat emits `linkOpen` with `m1` and «/a», `m1` and «/b», `m2` and «/c»

### SC-UKV-1503 — the two buttons wrap when they do not fit one row

Given a translator that gives button labels longer than a 328 card holds in one row
When the card is drawn
Then «Open in new tab» stands under «Open», and no label goes past the card

Not covered: it cannot be closed by a test with an identifier — the wrapping comes from the styles.
Held by the play step of the showcase story with long labels.

### SC-UKV-1504 — right to left mirrors the row and the buttons

Given a `link` card under `dir="rtl"` at 328
When it is drawn
Then the icon box stands at the right of the text column and «Open» at the right of «Open in new tab»

Not covered: it cannot be closed by a test with an identifier — the order comes from the styles.
Held by the play step of the showcase story right to left.

### SC-UKV-1505 — the dark theme takes the dark tokens

Given the four cards of the mockup at 328 in the dark theme
When they are drawn
Then the frame, the icon box, the texts and the reason take the dark values of their tokens

Not covered: it cannot be closed by a test with an identifier — the colours come from the styles.
Held by the dark story snapshot and the match with the dark column of the mockup.

### SC-UKV-1506 — the tag turns its start icon on request

Given an `rt-tag` with the `spinner` start icon and the turning option on
When it is drawn
Then its start icon carries the turning of `rt-icon`, and without the option it does not
