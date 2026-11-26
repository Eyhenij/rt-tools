# Scenarios — the code of the bottom sheet arrives at the first opening

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1782 — a panel closed before the code of the sheet arrives leaves no sheet

Given the code of the sheet is not loaded yet and a panel is opened in the sheet mode
When the panel is closed, or the directive is removed, before the code arrives
Then no sheet stands on the page after the code arrives, and the panel is closed

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-lazy.spec.ts`.

### SC-UKV-1783 — opening again before the code arrives gives one sheet

Given the code of the sheet is not loaded yet
When a panel is opened, closed and opened again before the code arrives
Then one sheet stands on the page; once the code is loaded a repeated opening takes it at once

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-lazy.spec.ts`.

### SC-UKV-1784 — a code of the sheet that fails to load closes the panel

Given the code of the sheet fails to load
When a panel is opened in the sheet mode
Then the panel is closed, the failure goes to the error handler of the application, and the next opening tries again

Covered: `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-lazy-failure.spec.ts`.
