# Scenarios — the radio button

The numbers continue the numbering of the second kit and do not change after the merge. While a
scenario is not covered, it carries the mark with the reason.

### SC-UKV-276 — the radio button whose value is the model is chosen

Given the form holds the very value the radio button stands for
When the radio button is drawn
Then it is declared chosen, and the circle has the dot

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-277 — an equal value that is not the same one does not choose

Given the radio button stands for a record, and the form holds a copy of it with the same content
When the radio button is drawn
Then it is declared not chosen

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-278 — a press chooses the radio button and gives its value to the form

Given the radio button is not chosen and available
When it is pressed
Then the form gets its value once, and the radio button is declared chosen

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-279 — a press on the chosen radio button changes nothing in the form

Given the radio button is chosen
When it is pressed
Then the form gets no value, and the radio button stays chosen

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-280 — a value written by the form does not come back as an edit

Given the radio button is bound to a form control
When the control sets the model to the value of the radio button
Then the radio button is declared chosen, and the control is not marked edited

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-281 — a press on the chosen radio button marks it touched

Given the radio button is chosen and was never touched
When it is pressed
Then the control is marked touched

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-282 — the input switches the radio button off

Given the radio button is declared unavailable by the input
When it is pressed
Then the form gets no value, and the radio button is declared unavailable

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-283 — a control created switched off keeps the radio button unavailable

Given the form control is created switched off, and the input does not switch the radio button off
When the radio button is drawn and pressed
Then it is declared unavailable, and the form gets no value

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-284 — the keys do not choose an unavailable radio button

Given the radio button is unavailable and has the focus
When Space or Enter is pressed
Then the form gets no value

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-285 — every press is reported outward

Given the radio button is chosen
When it is pressed
Then the press is reported outward once

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-286 — a press does not reach the element around the radio button

Given the radio button stands inside an element that listens to presses
When the radio button is pressed
Then the element around it gets no press

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-287 — Space chooses the radio button and does not scroll the page

Given the radio button is not chosen, available and has the focus
When Space is pressed
Then the form gets its value, and the default action of the key does not run

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-288 — Enter chooses the radio button

Given the radio button is not chosen, available and has the focus
When Enter is pressed
Then the form gets its value

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-289 — the role, the choice and the unavailability are declared

Given one radio button is chosen and another is unavailable
When they are drawn
Then each is declared a radio button with its choice, and the second is declared unavailable

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-290 — the radio button is a stop of the keyboard focus

Given the radio button is drawn, available or unavailable
When the focus moves by Tab
Then it reaches the radio button

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-291 — the keyboard focus draws the ring of the kit

Given the radio button is on the page
When it gets the focus from the keyboard
Then the ring of the kit is drawn around it, and a focus from a press draws none

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-292 — without texts the radio button is the circle alone

Given neither a label nor an explanation is given
When the radio button is drawn
Then only the circle is drawn, with no empty block of content next to it

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-293 — the label and the explanation are drawn when given

Given a label and an explanation are given
When the radio button is drawn
Then the label stands next to the circle, and the explanation under it is smaller and muted

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-294 — the card look puts the circle on the right

Given the radio button is declared in the card look with a label
When it is drawn
Then it is a framed box with the label on the left and the circle on the right

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-295 — the chosen card takes the colour of the choice on its frame

Given two radio buttons in the card look, one chosen
When they are drawn
Then the frame of the chosen one has the colour of the choice, and the other keeps the neutral frame

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-296 — the unavailable radio button is dimmed as a whole

Given the radio button in the card look is chosen and unavailable
When it is drawn
Then the circle, the dot, the texts and the frame are dimmed together, and the pointer does not act on it

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-297 — the material preset repaints the radio button

Given a chosen and a not chosen radio button stand under the sign of the material preset
When they are drawn
Then the colour of the choice, the rim and the texts come from the material appointments

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts` and the showcase snapshots `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--states.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--card.png`, `projects/ui-kit-v2/.storybook/__snapshots__/atoms-forms-radiobutton--themes.png`.

### SC-UKV-298 — the choice given by the input, without a form

Given two radio buttons without a form, the first given as chosen by the input
When the person presses the second one
Then the output of the change reports that the second is chosen, and the look follows the input the caller sets back

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.

### SC-UKV-299 — the circle alone is named by the input

Given a radio button without a label, with a name given by the input
When the assistive means read it
Then they read that name together with the role and the choice

Covered: `projects/ui-kit-v2/src/lib/components/radio-button/rt-radio-button.component.spec.ts`.
