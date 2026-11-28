# Scenarios — the more of a sheet behind «⋮»

The numbers continue the numbering of the second kit and do not change after the merge. They were
written in the scenarios of the header of a sheet and moved here whole when that file reached its
limit.

### SC-UKV-1927 — a template of more puts «⋮» left of the icon buttons of the header

Given a sheet with a template of more and an icon button of its own in the header
When it is open
Then «⋮» stands on the right of the header before the button of the application; a sheet without
the template has neither «⋮» nor a second screen

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1928 — «⋮» opens the second screen with the title of the template or «More»

Given a sheet with a template of more
When «⋮» is pressed
Then the second screen opens with the template in it, titled «More» in the language of the kit, or
by the title the template names

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1929 — the chevron and the back request return to the first screen

Given the second screen of more is open
When the chevron back is pressed, or the template calls its back request
Then the second screen closes and the first stays open, and Escape does the same; a sheet the
application closes and opens again opens on its first screen, and a template taken away and put
back does not open the second screen by itself

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1930 — a sheet with its own header opens the second screen itself

Given a sheet with its own header template and a template of more
When the header calls the request to open more
Then the second screen opens with the template of more; with no template of more the header gets
the sign that there is no second screen

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1931 — after «stay» the closed second screen stays out of reach

Given a sheet with a question before closing and a closed second screen of more
When the person asks to close and answers «stay»
Then the closed second screen stays `inert`: Tab and a screen reader do not reach it

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1932 — the template of more belongs to the sheet it is written in

Given a sheet declared in the content of another, only the inner one with a template of more
When both are drawn
Then «⋮» and the second screen stand in the inner sheet only

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.

### SC-UKV-1933 — a template of more passed by an input opens the second screen

Given a sheet drawn in the template of another component, the template of more passed by its input
When «⋮» is pressed
Then the second screen opens with that template and the title it names

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-sheet-more.directive.spec.ts`.
