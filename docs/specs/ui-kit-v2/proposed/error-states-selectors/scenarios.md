# Scenarios — load error and own placeholders of the selectors, the local lists and the PDF viewer

### SC-UKV-1287 — a server selector shows the load error in its panel

Given an open `rt-autocomplete` or `rt-dynamic-selector` with `error` «Нет сети»
When the panel is drawn
Then the error view with the title «Нет сети» and the «Повторить» button stands instead of the options

### SC-UKV-1288 — the retry button of a server selector emits retry

Given a server selector with its error view open
When the person presses «Повторить»
Then `retry` is emitted once and no request is made by the component

### SC-UKV-1289 — a server selector takes its own empty and error views

Given a server selector with `rt<Component>Empty` and `rt<Component>Error` templates
When it has no options, and then gets an error
Then the empty template and then the error template stand in the panel; the error template gets the text and a retry function

### SC-UKV-1290 — the autocomplete emptyTemplate input still works

Given an `rt-autocomplete` with the `emptyTemplate` input and no directive
When it has no options
Then that template stands in the panel; with the directive declared too, the directive wins

### SC-UKV-1291 — a local list takes its own empty view

Given one of `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector`, `rt-side-menu` with its empty template and nothing found
When it is drawn
Then the template stands instead of the «ничего не найдено» line; without a template the line stays

### SC-UKV-1292 — the PDF viewer takes its own error view

Given an `rt-pdf-viewer` whose document failed to open and an `rtPdfViewerError` template
When it is drawn
Then the template stands instead of the default error and gets the error text and a download function
