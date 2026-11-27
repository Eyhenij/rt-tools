# Scenarios — the sheet opened from a sheet

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1631 — a sheet opened from a sheet replaces it

Given the filters sheet open on a phone
When the list of a select in it opens in a sheet of its own
Then the list stands as the second screen of the same sheet, not lower than it and with a back chevron
instead of «×», and the filters sheet is hidden, takes no taps and stays reachable to the focus of
its field

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`.

### SC-UKV-1867 — the second screen grows past the first one with an animation

Given the filters sheet open on a phone and the list of a select taller than it
When the list opens as the second screen, and then the chevron brings the filters back
Then the list is not lower than the filters sheet and shows all its rows up to the limit of a
full-height sheet; the height passes from screen to screen and the content slides in, by the
duration of the sheet's slide, and with reduced motion the screens switch without motion; when the
window changes its size and the filters sheet becomes lower, the list follows its new height; when
the whole page goes away with both screens, the filters sheet switches nothing and nothing fails. The
owner's word: «рсти и переключение и рост с анимацией а не скачком».

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`,
`projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-screens.spec.ts`.

### SC-UKV-1632 — closing the top sheet shows the previous one

Given the list's sheet open in place of the filters sheet
When the list's sheet closes
Then the filters sheet is seen again and takes the keyboard

Covered: `projects/ui-kit-v2/src/lib/components/bottom-sheet/rt-bottom-sheet-stack.spec.ts`.
