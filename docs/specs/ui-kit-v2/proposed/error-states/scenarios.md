# Scenarios — load error and placeholder states of the conversation components

### SC-UKV-1267 — the error wins over loading

Given a thread list with `loading` true, no rows and `error` «Нет сети»
When it is drawn
Then the error placeholder with the title «Нет сети» and the «Повторить» button is shown and the skeleton is not

Covered by the thread list states spec.

### SC-UKV-1268 — a load more error keeps the rows

Given a thread list with three rows and `error` not null
When it is drawn
Then the three rows stay and an error row with the «Повторить» button stands below them

Covered by the thread list states spec.

### SC-UKV-1269 — the retry button emits retry

Given a thread list showing the error placeholder
When the reader presses «Повторить»
Then `retry` is emitted once

Covered by the thread list states spec.

### SC-UKV-1270 — the error title falls back to the kit label

Given a thread list with `error` set to an empty string
When it is drawn
Then the title is the label `uiLoadError` and the hint is the label `uiLoadErrorHint`

Covered by the thread list states spec.

### SC-UKV-1271 — nothing found uses its own texts when filters are active

Given a thread list with no rows, `filtersActive` true and `nothingFoundTitle` «Ничего не нашлось»
When it is drawn
Then the placeholder title is «Ничего не нашлось» with the search icon

Covered by the thread list states spec.

### SC-UKV-1272 — an own empty view gets the filtered flag

Given a thread list with no rows, an active search and a declared `rtThreadListEmpty` template
When it is drawn
Then the template is rendered with `filtered` true and the default placeholder is not

Covered by the thread list states spec.

### SC-UKV-1273 — an own error view gets the text and the retry function

Given a thread list with `error` «Нет сети» and a declared `rtThreadListError` template
When the template calls its retry function
Then `retry` is emitted and the template shows «Нет сети»

Covered by the thread list states spec.

### SC-UKV-1274 — the thread list header stands on the list edge

Given a thread list with search, filters, the tab switch and rows
When it is drawn
Then the left edges of the search field, the tab switch and the first row are equal

Not covered: the code is written in stage 2.

### SC-UKV-1275 — the tab switch stands 8 px from the header line and from the content

Given a thread list with the tab switch
When it is drawn
Then the gap from the header bottom line to the switch and from the switch to the first row is 8 px each

Not covered: the code is written in stage 2.

### SC-UKV-1276 — the chat without a conversation shows its title, hint and icon

Given a chat with no conversation, `emptyTitle` «Переписка не выбрана» and `emptyHint` «Выберите переписку слева.»
When it is drawn
Then the placeholder shows that title, that hint and the `emptyIcon` icon

Not covered: the code is written in stage 3.

### SC-UKV-1277 — the chat error has a retry button

Given a chat with a conversation and `error` not null
When the reader presses «Повторить»
Then `retry` is emitted and the messages are not drawn

Not covered: the code is written in stage 3.

### SC-UKV-1278 — the details panel error has a retry button

Given a details panel with `error` not null
When the reader presses «Повторить»
Then `retry` is emitted

Not covered: the code is written in stage 3.
