# Scenarios — the filters of a toolbar behind a button

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers go through:
the titles of the tests refer to them.

### SC-UKV-1086 — on a narrow screen the filters stand behind one button

Given a toolbar with a filters slot and a right part of buttons
When the place is narrow
Then the toolbar draws the filter button first in the row and no filter field

### SC-UKV-1087 — on a wide screen the filters stand in the left part

Given the same toolbar
When the place is wide
Then the filter fields stand in the left part and no filter button is drawn

### SC-UKV-1088 — a filter on is shown by a whole dot

Given a narrow toolbar with `filtersActive` set
When it is drawn
Then the filter button carries the indicator, and the toolbar clips nothing of it

### SC-UKV-1089 — the filter button opens the filters panel

Given a narrow toolbar
When the filter button is pressed
Then an aside opens with the title «Фильтры», the back arrow, no overline, the filters slot drawn
with the context `panel`, and the footer «Сбросить» and «Применить»

### SC-UKV-1090 — the footer presses of the panel

Given an open filters panel
When «Сбросить» is pressed, then «Применить»
Then `filtersReset` is reported and the panel stays, then `filtersApply` is reported and the panel
closes; the back arrow closes it with nothing reported

### SC-UKV-1091 — the title of an aside header stands on the line of the back arrow

Given an aside header with a title and no overline
When it is drawn
Then the heading block is as high as the back button and centres the title vertically

### SC-UKV-1092 — the dismiss label of an aside footer kept on a phone

Given an aside footer with `phoneCloseLabel` set to `false` and a dismiss button «Сбросить»
When the screen is a phone
Then the button reads «Сбросить», not «Закрыть»

### SC-UKV-1093 — the filters panel closes with its toolbar and on a wide screen

Given an open filters panel
When the screen widens, or the toolbar is destroyed
Then the panel closes, and the filter fields stand only in the toolbar or nowhere

### SC-UKV-1094 — the filters panel holds the focus

Given a narrow screen and the filter button
When the panel is opened
Then the panel holds the keyboard focus inside itself

### SC-UKV-1096 — the filters panel opens once

Given a narrow screen and the filter button
When the button is pressed twice before the first panel is ready
Then one panel is open, and the screen widening closes it

### SC-UKV-1097 — the focus goes to the toolbar when the panel closes on a wide screen

Given an open filters panel holding the focus
When the screen widens
Then the focus stands on a field in the left part of the toolbar, not on the page

### SC-UKV-1098 — the filters panel is a modal dialog

Given a narrow screen and the filter button
When the panel is opened
Then its frame is `role="dialog"` with `aria-modal="true"` and named «Фильтры»

### SC-UKV-1095 — a filter on is named to a screen reader

Given a narrow screen and the filter button
When `filtersActive` turns on
Then the button name for a screen reader reads «Фильтры, отбор включён» instead of «Фильтры»
