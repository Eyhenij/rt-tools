# Scenarios — a button with two positions

### SC-UKV-95 — without a sign of the position the button says nothing about it

Given the button is declared without a sign of the position
When it is drawn
Then nothing is said about the position, and it has no look of a pressed one

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`.

### SC-UKV-96 — the released position is declared on a par with the pressed one

Given the button is declared released
When it is drawn
Then the position is declared released, and it has no look of a pressed one

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`.

### SC-UKV-97 — the pressed position is visible and declared

Given the button is declared pressed
When it is drawn
Then the position is declared pressed, and the look is that of a held press

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`.

### SC-UKV-98 — a switched-off button keeps its position

Given the button is declared pressed and switched off
When it is drawn
Then the position stays pressed, and the press does not pass

Covered: `projects/ui-kit-v2/src/lib/components/button/rt-button.directive.spec.ts`.
