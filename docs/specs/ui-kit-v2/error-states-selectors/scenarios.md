# Scenarios — load error and own placeholders of the selectors, the local lists and the PDF viewer

### SC-UKV-1287 — a server selector shows the load error in its panel

Given an open `rt-autocomplete` or `rt-dynamic-selector` with `error` «Нет сети»
When the panel is drawn
Then the error view with the title «Нет сети» and the «Повторить» button stands instead of the options

Covered by the states specs of the autocomplete and of the dynamic selector.

### SC-UKV-1288 — the retry button of a server selector emits retry

Given a server selector with its error view open
When the person presses «Повторить»
Then `retry` is emitted once and no request is made by the component

Covered by the states specs of the autocomplete and of the dynamic selector.

### SC-UKV-1289 — a server selector takes its own empty and error views

Given a server selector with `rt<Component>Empty` and `rt<Component>Error` templates
When it has no options, and then gets an error
Then the empty template and then the error template stand in the panel; the error template gets the text and a retry function

Covered by the states specs of the autocomplete and of the dynamic selector.

### SC-UKV-1290 — the autocomplete emptyTemplate input still works

Given an `rt-autocomplete` with the `emptyTemplate` input and no directive
When it has no options
Then that template stands in the panel; with the directive declared too, the directive wins

Covered by the autocomplete states spec.

### SC-UKV-1291 — a local list takes its own empty view

Given one of `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector`, `rt-side-menu` with its empty template and nothing found
When it is drawn
Then the template stands instead of the «ничего не найдено» line; without a template the line stays

Covered by the states specs of all six lists.

### SC-UKV-1293 — the error of a server selector wins over loading

Given a server selector with `loading` true and `error` «Нет сети»
When it is drawn
Then the error view stands and no spinner is drawn

Covered by the states specs of the autocomplete and of the dynamic selector.

### SC-UKV-1294 — an empty error takes the kit title and the description takes the hint

Given a server selector with `error` empty and `errorDescription` «Проверьте сеть»
When it is drawn
Then the title is the label `uiLoadError` and the hint is «Проверьте сеть»

Covered by the autocomplete states spec; the dynamic selector draws the same `rtLoadErrorView`.

### SC-UKV-1295 — the dynamic selector opens on the error when there is nothing to choose

Given an `rt-dynamic-selector` with `localSearch`, no entities and `error` not null
When it is drawn
Then the field does not say «Выбирать не из чего», and its window opens on the error view

Covered by the dynamic selector states spec.

### SC-UKV-1296 — a local list without a template keeps its line

Given a local list with nothing to show and no empty template
When it is drawn
Then its present «Нет вариантов» or «Ничего не найдено» line stands as before

Covered by the states specs of all six lists; the PDF viewer spec checks its default error the same
way.

### SC-UKV-1292 — the PDF viewer takes its own error view

Given an `rt-pdf-viewer` whose document failed to open and an `rtPdfViewerError` template
When it is drawn
Then the template stands instead of the default error and gets the error text and a download function

Covered by the PDF viewer states spec.
