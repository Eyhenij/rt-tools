# Scenarios — load error and placeholder states of the table and the lists

### SC-UKV-1279 — the table error wins over loading

Given a table with `loading` true and `error` «Нет сети»
When it is drawn
Then the error placeholder with the title «Нет сети» and the «Повторить» button stands in place of the rows

Not covered: the code is not written yet.

### SC-UKV-1280 — the table keeps its head and pagination on an error

Given a table with rows, a page change and `error` not null
When it is drawn
Then the head and the pagination stay and the error placeholder stands in place of the rows

Not covered: the code is not written yet.

### SC-UKV-1281 — the table empty reference still works

Given a table with no rows and a template declared by `#rtTableEmpty`
When it is drawn
Then that template is rendered instead of the default empty view

Not covered: the code is not written yet.

### SC-UKV-1282 — the data list error has a retry button

Given a data list with `error` not null
When the reader presses «Повторить»
Then `retry` is emitted and no rows are drawn

Not covered: the code is not written yet.

### SC-UKV-1283 — the dynamic list error has a retry button

Given a dynamic list with `error` not null
When the reader presses «Повторить»
Then `retry` is emitted

Not covered: the code is not written yet.

### SC-UKV-1284 — the bar list error has a retry button

Given a bar list with `error` not null
When the reader presses «Повторить»
Then `retry` is emitted and no bars are drawn

Not covered: the code is not written yet.

### SC-UKV-1285 — an own error view of a list gets the text and the retry function

Given a data list with `error` «Нет сети» and a declared `rtDataListError` template
When the template calls its retry function
Then `retry` is emitted and the template shows «Нет сети»

Not covered: the code is not written yet.

### SC-UKV-1286 — an own empty view replaces the default one

Given a bar list with no items and a declared `rtBarListEmpty` template
When it is drawn
Then the template is rendered and the default placeholder is not

Not covered: the code is not written yet.
