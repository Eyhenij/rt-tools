# Scenarios — the sheet opened from a sheet

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1631 — a sheet opened from a sheet replaces it

Given the filters sheet open on a phone
When the list of a select in it opens in a sheet of its own
Then the list stands as the second screen of the same sheet, at its height and with a back chevron
instead of «×», and the filters sheet is hidden, takes no taps and stays reachable to the focus of
its field

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`.

### SC-UKV-1867 — the second screen follows the height of the first one

Given the list's sheet open in place of the filters sheet
When the window changes its size or turns, and the filters sheet becomes lower
Then the list's sheet takes the new height of the filters sheet, and its back chevron stays on the
screen

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`.

### SC-UKV-1632 — closing the top sheet shows the previous one

Given the list's sheet open in place of the filters sheet
When the list's sheet closes
Then the filters sheet is seen again and takes the keyboard

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`.
