# Scenarios — the toggle choice of the second kit

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1693 — a toggle group that does not fit folds into a select, and a choice there counts as a press

Given a toggle group «Период» of six values that need 520 px where 343 px are free, on a phone
When it is drawn, its field is pressed and «Месяц» is chosen in the sheet
Then the group stands as a select, its buttons are hidden and only measured, and the group reports «Месяц»

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1694 — a toggle group that fits stays buttons

Given the same group needing 280 px where 343 px are free
When it is drawn
Then it stays buttons, and no field of choice stands in its place

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1695 — a toggle group of multiple choice folds into a multiselect

Given a toggle group of multiple choice that does not fit its place
When it is drawn
Then it stands as a multiselect

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1696 — the folding switched off, or a wrapping layout, keeps the buttons

Given a toggle group that does not fit its place, with the folding switched off, then with a wrapping layout
When it is drawn
Then it stays buttons each time; a group not laid out yet, or short of its place by less than half a pixel, does not fold either

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1697 — the field with toggles sums up the choice instead of chips

Given a multiselect with toggles over five categories
When all five are on, then three, then none
Then the field says «Все», then «3 из 5», then its placeholder, and no chip stands in it

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1698 — a row with a toggle switches its value and keeps the panel open

Given a multiselect with toggles open, «Продукты» off
When the row «Продукты» is pressed
Then its toggle is on, the value holds «Продукты», and the panel is still open

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1699 — «Show all» turns every value on, and off when all are on

Given a multiselect with toggles open with three of five on
When «Показать все» is pressed twice
Then all five are on after the first press, and none after the second

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1700 — the application's own toggles stand above the line, the values under it

Given a multiselect with toggles and the application's toggle «Скрыть пустые»
When its panel is open
Then «Показать все» and «Скрыть пустые» stand above the line, and the five categories under it

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1701 — in the sheet the field with toggles has no footer

Given a multiselect with toggles on a phone
When its field is pressed
Then its rows are inside the bottom sheet, and no footer «Выбрано · Сбросить · Готово» stands under them

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles.spec.ts`.

### SC-UKV-1704 — the folded toggle group passes the switch and has no clear cross

Given a toggle group folded into a field, with the sheet switched off, on a phone
When the field is pressed
Then the list opens next to the field, and the single choice field shows no clear cross

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1598 — «Show all» keeps disabled and unknown values

Given a field with toggles whose value holds a disabled option and a value not among the options
When «Show all» is pressed, and pressed again
Then both kept values stay in the value both times

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1599 — «Reset» in the sheet keeps disabled values

Given a multiselect in the sheet whose value holds a disabled option
When «Reset» is pressed
Then the disabled value stays, and «Reset» goes inactive when nothing is left to take off

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1705 — «Show all» is reached by the arrows

Given an open field with toggles
When the arrows are pressed, then Enter
Then «Show all» is the first highlighted row and Enter switches it; the trigger names the highlighted row

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1601 — the panel with toggles carries no name without a role

Given a field with toggles and a field with a list
When both are opened
Then the toggles panel has no accessible name of its own, and the list keeps its name

Covered: `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-toggles-keys.spec.ts`.

### SC-UKV-1621 — the folded group unfolds only with room to spare

Given a toggle group folded into a field
When its place grows, or changes because of the fold itself
Then it unfolds only when the place is the width of its buttons plus 8 px; the fold's own change does not unfold it

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1639 — a group folded in a parent sized by its content unfolds by itself

Given a toggle group of 520 px of buttons in a parent that takes the width of its content
When the place is squeezed to 343 px for a moment and then let go
Then the folded field is 528 px wide, the parent grows by it, and the group stands as buttons again

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.

### SC-UKV-1640 — a small group folds into a medium field

Given a small, a medium and a large toggle group that do not fit
When each folds
Then the small and the medium one stand as a medium field, and the large one as a large field

Covered: `projects/ui-kit-v2/src/lib/components/toggle-button-group/rt-toggle-button-group-fold.spec.ts`.
