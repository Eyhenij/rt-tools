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
